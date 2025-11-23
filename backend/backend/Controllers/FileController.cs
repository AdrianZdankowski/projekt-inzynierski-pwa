using Azure;
using Azure.Storage.Blobs;
using backend.DTO.File;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
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
        AppDbContext appDbContext,
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

                var file = await appDbContext.Files.FindAsync(fileId);
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

            //checking if user is allowed to add files to the folder
            Folder folder = null;
            if (req.FolderId is not null){
                folder = appDbContext.Folders.FirstOrDefault(f => f.id == req.FolderId);
                if (await fileAccessValidator.ValidateFolderAddPermission(userId, folder) == false)
                {
                    return Unauthorized("User is not allowed to add files in this folder");
                }
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
                Checksum = null,
                ParentFolder = folder
            };

            appDbContext.Files.Add(entity);
            await appDbContext.SaveChangesAsync();

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
                var file = await appDbContext.Files.FindAsync(dto.FileId);
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

                    await appDbContext.SaveChangesAsync();
                    
                    // Convert file if a strategy is available for this MIME type
                    try
                    {
                        string tempDirectory = Path.Combine(@"C:\temp", dto.FileId.ToString().Replace(".", ""), DateTime.Now.ToString("yyyyMMdd_HHmmss"));
                        await fileConverter.ConvertFileAsync(tempDirectory, file, userId);
                    }
                    catch (NotSupportedException)
                    {
                        // No conversion strategy available for this file type
                        // File will be stored as-is
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
        public async Task<IActionResult> GetUserFiles(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "uploadTimestamp",
            [FromQuery] string? sortDirection = "desc",
            [FromQuery] string? q = null,
            [FromQuery] Guid? folderId = null)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var sharedFolders = new List<WebApplication1.Folder>();

            if (folderId is not null)
            {
                var folder = appDbContext.Folders.FirstOrDefault(f => f.id == folderId);
                if (await fileAccessValidator.ValidateFolderPermissions(userId, folder, PermissionFlags.Read) == false)
                {
                    return Unauthorized("User does not have access to this folder");
                }
            }
            else
            {
                //return shared folders
                var sharedFoldersIds = appDbContext.FolderAccesses.Where(f => f.user.id ==  userId).Select(f => new {f.id }).ToList();
                foreach (var sharedFolderId in sharedFoldersIds)
                {
                    sharedFolders.Add(appDbContext.Folders.FirstOrDefault(f => f.id.Equals(sharedFolderId)));
                }
            }

                page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var keyRaw = (sortBy ?? "uploadTimestamp").ToLowerInvariant();
            var desc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

            var files = appDbContext.Files.Where(f => f.UserId == userId && f.ParentFolder.id == folderId).Select(f => new { f.id, f.FileName, f.MimeType, f.Size, f.UploadTimestamp, f.Status, f.UserId }).ToList();
            
            //todo: add sorting and pagination for folders
            var folders = appDbContext.Folders.Where(f => f.ParentFolder.id == folderId && f.OwnerId == userId).ToList();

            //add shared files to the final list
            var SharedWithUserFileIds = appDbContext.FileAccesses.Where(f => f.user.id == userId).Select(f => f.file.id).ToList();
            var SharedWithUserFiles = await appDbContext.Files
                .Where(f => SharedWithUserFileIds.Contains(f.id))
                .Select(f => new { f.id, f.FileName, f.MimeType, f.Size, f.UploadTimestamp, f.Status, f.UserId })
                .ToListAsync();
            files.AddRange(SharedWithUserFiles);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();

                files = files.Where(f =>
                    (!string.IsNullOrEmpty(f.FileName) && f.FileName.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(f.MimeType) && f.MimeType.Contains(term, StringComparison.OrdinalIgnoreCase))
                ).ToList();
            }

            var appliedKey = keyRaw switch
            {
                "filename" => "filename",
                "mimetype" => "mimetype",
                "size" => "size",
                "uploadtimestamp" => "uploadtimestamp",
                _ => "uploadtimestamp"   //default
            };

            IEnumerable <dynamic> ordered = appliedKey switch
            {
                "filename" => desc ? files.OrderByDescending(f => f.FileName) : files.OrderBy(f => f.FileName),
                "mimetype" => desc ? files.OrderByDescending(f => f.MimeType) : files.OrderBy(f => f.MimeType),
                "size" => desc ? files.OrderByDescending(f => f.Size) : files.OrderBy(f => f.Size),
                "uploadtimestamp" => desc ? files.OrderByDescending(f => f.UploadTimestamp) : files.OrderBy(f => f.UploadTimestamp),
                _ => desc ? files.OrderByDescending(f => f.UploadTimestamp) : files.OrderBy(f => f.UploadTimestamp),
            };

            var totalItems = ordered.LongCount();
            var totalPages = (int)Math.Ceiling(totalItems/(double)pageSize);
            var pageItems = ordered.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var userIds = pageItems.Select(f => f.UserId).Distinct().ToList();
            var users = await appDbContext.Users
                .Where(u => userIds.Contains(u.id))
                .Select(u => new { u.id, u.username })
                .ToListAsync();

            var userMap = users.ToDictionary(u => u.id, u => u.username);

            var result = pageItems.Select(f => new FileListItem
            {
                Id = f.id,
                FileName = f.FileName,
                MimeType = f.MimeType,
                Size = f.Size,
                UploadTimestamp = f.UploadTimestamp,
                Status = (int)f.Status,
                UserId = f.UserId,
                OwnerName = userMap.TryGetValue((Guid)f.UserId, out var name) ? name : "Unknown"
            });

            return Ok(new
            {
                items = result,
                folders = folders,
                sharedFolders = sharedFolders,
                page,
                pageSize,
                totalItems,
                totalPages,
                hasNext = page < totalPages,
                hasPrev = page > 1,
                sortBy = appliedKey,
                sortDir = desc ? "desc" : "asc",
                q
            });
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

            var user = appDbContext.Users.Where(u => u.username == sharedFileDto.UserName).FirstOrDefault();

            var file = appDbContext.Files.Where(f => f.id == sharedFileDto.FileId).FirstOrDefault();
            if (file is null || user is null)
            {
                return BadRequest("Incorrect username or file id");
            }

            if (file.UserId != userId)
            {
                return Unauthorized("User needs to be owner of the shared file");
            }

            if (appDbContext.FileAccesses.Where(fa => fa.file.id == file.id && fa.user.id == user.id).FirstOrDefault() is not null)
            {
                //in case of existing file access in db
                return Ok(file);
            }

            var fileAccess = new WebApplication1.FileAccess
            {
                id = Guid.NewGuid(),
                file = file,
                user = user
            };

            appDbContext.FileAccesses.Add(fileAccess);
            appDbContext.SaveChanges();

            return Ok();
        }

        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetFileWithLink(Guid id)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var file = appDbContext.Files.FirstOrDefault(f => f.id == id);
            if (file == null) return NotFound("File not found");
            if (!fileAccessValidator.ValidateUserAccess(userId, file).Result) return Forbid("You are not allowed to access this file");
            if (file.Status != WebApplication1.FileStatus.Uploaded) return Conflict("File is not ready for download");

            var ttl = TimeSpan.FromMinutes(10);
            var downloadUrl = azureBlobService.GenerateDownloadSasUri(file.BlobName, ttl);

            var owner = await appDbContext.Users
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

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFile(Guid id)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            if (!await fileAccessValidator.ValidateDeletePermission(userId, appDbContext.Files.FirstOrDefault(f => f.id == id)))
            {
                return Unauthorized("User does not have permission to delete this file");
            }

            var wasDeletingSuccesfull = await uploadService.DeleteFile(id);
            if (!wasDeletingSuccesfull)
            {
                throw new Exception("An error occured while deleting file"); 
            }
            return Ok();
        }

        private IActionResult Forbidden(string detail) =>
    Problem(statusCode: StatusCodes.Status403Forbidden, title: "Forbidden", detail: detail);
    }
}
