﻿using Azure;
using Azure.Storage.Blobs;
using backend.Contexts;
using backend.DTO.File;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApplication1;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController(
        IAzureBlobService azureBlobService,
        IFileUploadService uploadService,
        FileContext fileContext,
        UserContext userContext,
        IConfiguration config,
        IFileConverter fileConverter,
        IFileAccessValidator fileAccessValidator) : ControllerBase
    {
        [Authorize]
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] FileUploadDto request)
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            try
            {
                var fileId = await uploadService.UploadSmallFileAsync(request.File, userId);

                var file = await fileContext.Files.FindAsync(fileId);
                var ttl = TimeSpan.FromMinutes(10);
                var downloadUrl = azureBlobService.GenerateDownloadSasUri(file.BlobName, ttl);

                return Ok(new
                {
                    FileId = fileId,
                    FileName = file.FileName,
                    MimeType = file.MimeType,
                    Size = file.Size,
                    DownloadUrl = downloadUrl,
                    ExpiresInSeconds = (int)ttl.TotalSeconds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Upload failed: {ex.Message}");
            }
        }

        private Guid GetUserIdOrThrow()
        {
            var c = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(c, out var id))
            {
                throw new UnauthorizedAccessException("Invalid or missing user ID");
            }
            return id;
        }

        [Authorize]
        [HttpPost("generate-upload-link")]
        public async Task<IActionResult> CreateUploadLink([FromBody] CreateUploadLinkRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.FileName) || string.IsNullOrWhiteSpace(req.MimeType))
            {
                return BadRequest("fileName and mimeType are required");
            }

            Guid userId;
            try 
            { 
                userId = GetUserIdOrThrow(); 
            } catch 
            { 
                return Unauthorized("Invalid or missing user ID"); 
            }

            var fileId = Guid.NewGuid();
            var blobName = azureBlobService.BuildUserScopedBlobName(userId, fileId, req.FileName);

            var entity = new WebApplication1.File
            {
                id = fileId,
                UserId = userId,
                FileName = req.FileName,
                MimeType = req.MimeType,
                Size = req.ExpectedSize,
                BlobName = blobName,
                UploadTimestamp = DateTime.UtcNow,
                Status = WebApplication1.FileStatus.Pending,
                Checksum = null
            };

            fileContext.Files.Add(entity);
            await fileContext.SaveChangesAsync();

            var uploadUrl = azureBlobService.GenerateUploadSasUri(blobName, req.MimeType, TimeSpan.FromMinutes(30));

            return Ok(new { fileId, uploadUrl });
        }

        [Authorize]
        [HttpPost("commit")]
        public async Task<IActionResult> CommitUpload([FromBody] FileMetadataDto dto)
        {
            Guid userId;
            try 
            { 
                userId = GetUserIdOrThrow(); 
            } catch 
            { 
                return Unauthorized("Invalid or missing user ID"); 
            }
            if (dto == null || dto.FileId == Guid.Empty)
            {
                return BadRequest("fileId is required");
            }
            try
            {
                var file = await fileContext.Files.FindAsync(dto.FileId);
                if (file == null) return NotFound("File not found.");
                if (file.UserId != userId) return Forbid("You are not allowed to access this file");
                if (file.Status != WebApplication1.FileStatus.Pending) return Conflict("Upload not in pending state");

                var container = new BlobContainerClient(config["AzureStorage:ConnectionString"], config["AzureStorage:ContainerName"]);
                var blob = container.GetBlobClient(file.BlobName);

                try
                {
                    var props = await blob.GetPropertiesAsync();

                    if (dto.Size > 0 && props.Value.ContentLength != dto.Size)
                        return BadRequest("Uploaded blob size does not match.");

                    if (!string.IsNullOrWhiteSpace(file.MimeType) &&
                        !string.Equals(props.Value.ContentType, file.MimeType, StringComparison.OrdinalIgnoreCase))
                    {
                        await blob.SetHttpHeadersAsync(new Azure.Storage.Blobs.Models.BlobHttpHeaders { ContentType = file.MimeType });
                    }

                    if (!string.IsNullOrWhiteSpace(dto.Checksum) && props.Value.ContentHash is not null)
                    {
                        var md5B64 = Convert.ToBase64String(props.Value.ContentHash);
                        if (!md5B64.Equals(dto.Checksum, StringComparison.OrdinalIgnoreCase))
                            return BadRequest("Checksum does not match");
                        file.Checksum = dto.Checksum;
                    }

                    await blob.SetTagsAsync(new Dictionary<string, string>
                    {
                        ["owner"] = userId.ToString("D"),
                        ["fileId"] = file.id.ToString("D")
                    });

                    file.Status = WebApplication1.FileStatus.Uploaded;
                    file.Size = props.Value.ContentLength;
                    file.UploadTimestamp = DateTime.UtcNow;

                    await fileContext.SaveChangesAsync();
                    if (file.MimeType == "video/mp4")
                    {
                        string tempDirectory = Path.Combine(@"C:\temp", dto.FileId.ToString().Replace(".", ""), DateTime.Now.ToString("yyyyMMdd_HHmmss"));
                        await fileConverter.CreateHlsPlaylistAsync(tempDirectory, file, userId);
                    }
                    return Ok(new { Message = "Upload committed", FileId = file.id });
                }
                catch (RequestFailedException ex) when (ex.Status == 404)
                {
                    return BadRequest("Blob not found. Did you upload the file?");
                }
            }
            catch (Exception)
            {
                return BadRequest("Error");
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUserFiles()
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var files = fileContext.Files.Where(f => f.UserId == userId).Select(f => new { f.id, f.FileName, f.MimeType, f.Size, f.UploadTimestamp, f.Status, f.UserId }).ToList();
            
            //add shared files to the final list
            var SharedWithUserFileIds = userContext.FileAccesses.Where(f => f.user.id == userId).Select(f => f.file.id).ToList();
            var SharedWithUserFiles = await fileContext.Files
                .Where(f => SharedWithUserFileIds.Contains(f.id))
                .Select(f => new { f.id, f.FileName, f.MimeType, f.Size, f.UploadTimestamp, f.Status, f.UserId })
                .ToListAsync();
            files.AddRange(SharedWithUserFiles);

            var userIds = files.Select(f => f.UserId).Distinct().ToList();
            var users = await userContext.Users
                .Where(u => userIds.Contains(u.id))
                .Select(u => new { u.id, u.username })
                .ToListAsync();

            var userMap = users.ToDictionary(u => u.id, u => u.username);

            var result = files.Select(f => new
            {
                f.id,
                f.FileName,
                f.MimeType,
                f.Size,
                f.UploadTimestamp,
                f.Status,
                f.UserId,
                OwnerName = userMap.TryGetValue(f.UserId, out var name) ? name : "Unknown"
            });

            return Ok(result);
        }

        [Authorize]
        [HttpPost("share")]
        public async Task<IActionResult> ShareFile(ShareFileDto sharedFileDto)
        {
            Guid userId;
            try
            {
                userId = GetUserIdOrThrow();
            }
            catch
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var user = userContext.Users.Where(u => u.username == sharedFileDto.UserName).FirstOrDefault();

            var file = fileContext.Files.Where(f => f.id == sharedFileDto.FileId).FirstOrDefault();
            if (file == null || user == null)
            {
                return BadRequest("Incorrect username or file id");
            }

            if (file.UserId != userId)
            {
                return Unauthorized("User needs to be owner of the shared file");
            }

            if (userContext.FileAccesses.Where(fa => fa.file.id == file.id && fa.user.id == user.id).FirstOrDefault() != null)
            {
                //in case of existing file access in db
                return Ok(file);
            }

            //file is from different context, so it is needed to attach, so it won't try to insert it to the same table
            userContext.Attach(file);

            var fileAccess = new WebApplication1.FileAccess();
            fileAccess.file = file;
            fileAccess.user = user;

            userContext.FileAccesses.Add(fileAccess);
            userContext.SaveChanges();

            return Ok();
        }

        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetFileWithLink(Guid id)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var file = fileContext.Files.FirstOrDefault(f => f.id == id);
            if (file == null) return NotFound("File not found");
            if (!fileAccessValidator.ValidateUserAccess(userId, file).Result) return Forbid("You are not allowed to access this file");
            if (file.Status != WebApplication1.FileStatus.Uploaded) return Conflict("File is not ready for download");

            var ttl = TimeSpan.FromMinutes(10);
            var downloadUrl = azureBlobService.GenerateDownloadSasUri(file.BlobName, ttl);

            var owner = await userContext.Users
                .Where(u => u.id == file.UserId)
                .Select(u => u.username)
                .FirstOrDefaultAsync();

            var dto = new FileDownloadDto
            {
                Id = file.id,
                FileName = file.FileName,
                MimeType = file.MimeType,
                Size = file.Size,
                UploadTimestamp = file.UploadTimestamp,
                DownloadUrl = downloadUrl,
                ExpiresInSeconds = (int)ttl.TotalSeconds,
                UserId = file.UserId,
                OwnerName = owner ?? "Unknown"
            };

            return Ok(dto);
        }

        private IActionResult Forbidden(string detail) =>
    Problem(statusCode: StatusCodes.Status403Forbidden, title: "Forbidden", detail: detail);
    }
}
