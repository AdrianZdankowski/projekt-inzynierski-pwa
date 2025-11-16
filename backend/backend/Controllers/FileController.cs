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

            var appliedKey = keyRaw switch
            {
                "filename" => "name",
                "mimetype" => "mimetype",
                "size" => "size",
                "uploadtimestamp" => "date",
                _ => "date"   //default
            };

            IQueryable<WebApplication1.Folder> ownFolderQuery = appDbContext.Folders
                .Where(f => f.OwnerId == userId); 

            if (folderId is null) 
                ownFolderQuery = ownFolderQuery.Where(f => f.ParentFolder == null); 
            else
                ownFolderQuery = ownFolderQuery.Where(f => f.ParentFolder.id == folderId); 

            var ownFolders = await ownFolderQuery.ToListAsync();

            //if folderId == null sharedFolders already loaded above avoid duplicates
            if (folderId is null)
            {
                var ownFolderIds = ownFolders.Select(f => f.id).ToHashSet();
                sharedFolders = sharedFolders
                    .Where(f => !ownFolderIds.Contains(f.id))
                    .ToList();
            }
            else
            {
                //if we're not in root, we don't show shared root folders here
                sharedFolders = new List<WebApplication1.Folder>();
            }

            //load own files with proper root/folder handling
            IQueryable<WebApplication1.File> ownFileQuery = appDbContext.Files
                .Where(f => f.UserId == userId);

            if (folderId is null)
                ownFileQuery = ownFileQuery.Where(f => f.ParentFolder == null);
            else
                ownFileQuery = ownFileQuery.Where(f => f.ParentFolder.id == folderId);

            var ownFiles = await ownFileQuery.ToListAsync();

            var SharedWithUserFileIds = appDbContext.FileAccesses
                .Where(f => f.user.id == userId)
                .Select(f => f.file.id)
                .ToList();

            var SharedWithUserFiles = await appDbContext.Files
                .Where(f => SharedWithUserFileIds.Contains(f.id))
                .ToListAsync();

            // ADDED: avoid duplicate files (if user also owns file)
            var ownFileIds = ownFiles.Select(f => f.id).ToHashSet();
            SharedWithUserFiles = SharedWithUserFiles
                .Where(f => !ownFileIds.Contains(f.id))
                .ToList();
        
            var ownerIds = ownFolders.Select(f => f.OwnerId)
                .Concat(sharedFolders.Select(f => f.OwnerId))
                .Concat(ownFiles.Select(f => f.UserId))
                .Concat(SharedWithUserFiles.Select(f => f.UserId))
                .Distinct()
                .ToList();

            var users = await appDbContext.Users
                .Where(u => ownerIds.Contains(u.id))
                .Select(u => new { u.id, u.username })
                .ToListAsync();

            var userMap = users.ToDictionary(u => u.id, u => u.username);

            string GetOwnerName(Guid id) =>
                userMap.TryGetValue(id, out var name) ? name : "Unknown";

            
            //unified list of UserItemDto (folders+files+shared)            
            var allItems = new List<backend.DTO.UserItemDto>();

            //own folders
            allItems.AddRange(
                ownFolders.Select(f => new backend.DTO.UserItemDto
                {
                    Type = "folder",
                    Id = f.id,
                    Name = f.FolderName,
                    Size = null,
                    MimeType = null,
                    Date = f.CreatedDate,
                    IsShared = false,
                    Status = 0,
                    UserId = f.OwnerId,
                    OwnerName = GetOwnerName(f.OwnerId)
                })
            );

            //shared folders (only in root)
            allItems.AddRange(
                sharedFolders.Select(f => new backend.DTO.UserItemDto
                {
                    Type = "folder",
                    Id = f.id,
                    Name = f.FolderName,
                    Size = null,
                    MimeType = null,
                    Date = f.CreatedDate,
                    IsShared = true,
                    Status = 0,
                    UserId = f.OwnerId,
                    OwnerName = GetOwnerName(f.OwnerId)
                })
            );

            //own files
            allItems.AddRange(
                ownFiles.Select(f => new backend.DTO.UserItemDto
                {
                    Type = "file",
                    Id = f.id,
                    Name = f.FileName,
                    Size = f.Size,
                    MimeType = f.MimeType,
                    Date = f.UploadTimestamp,
                    IsShared = false,
                    Status = (int)f.Status,
                    UserId = f.UserId,
                    OwnerName = GetOwnerName(f.UserId)
                })
            );

            //shared files
            allItems.AddRange(
                SharedWithUserFiles.Select(f => new backend.DTO.UserItemDto
                {
                    Type = "file",
                    Id = f.id,
                    Name = f.FileName,
                    Size = f.Size,
                    MimeType = f.MimeType,
                    Date = f.UploadTimestamp,
                    IsShared = true,
                    Status = (int)f.Status,
                    UserId = f.UserId,
                    OwnerName = GetOwnerName(f.UserId)
                })
            );

            //search now applies to unified list
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();

                allItems = allItems.Where(f =>
                    (!string.IsNullOrEmpty(f.Name) && f.Name.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(f.MimeType) && f.MimeType.Contains(term, StringComparison.OrdinalIgnoreCase))
                ).ToList();
            }

            //sorting unified list            
            Func<backend.DTO.UserItemDto, object?> selector = appliedKey switch
            {
                "name" => f => f.Name,
                "mimetype" => f => f.MimeType,
                "size" => f => f.Size ?? 0,
                "date" => f => f.Date,
                _ => f => f.Date
            };

            IEnumerable<backend.DTO.UserItemDto> ordered =
                desc ? allItems.OrderByDescending(selector)
                     : allItems.OrderBy(selector);

            //pagination now on unified list
            var totalItems = ordered.LongCount();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var pageItems = ordered.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            //final response now uses unified items list
            return Ok(new
            {
                items = pageItems,
                folders = ownFolders,
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
