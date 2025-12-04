using Azure;
using Azure.Storage.Blobs;
using backend.Data;
using backend.DTO.File;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PwaApp.Application.Interfaces;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApplication1;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    public class FileController(
        IAzureBlobService azureBlobService,
        IFileUploadService uploadService,
        IAppDbContext appDbContext,
        IConfiguration config,
        IFileConverter fileConverter,
        IFileAccessValidator fileAccessValidator) : ApiControllerBase
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
                        string tempDirectory = Path.Combine(Path.GetTempPath(), dto.FileId.ToString().Replace(".", ""), DateTime.Now.ToString("yyyyMMdd_HHmmss"));
                        await fileConverter.CreateHlsPlaylistAsync(tempDirectory, file, userId);
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

            WebApplication1.Folder? currentFolder = null;
            int? currentFolderPermissions = null;
            bool canAddToFolder = false;
            bool canDeleteFromFolder = false;

            var sharedFolders = new List<WebApplication1.Folder>();

            IQueryable<WebApplication1.Folder> ownFolderQuery = appDbContext.Folders
                .Where(f => f.OwnerId == userId); 

            if (folderId is null) 
                ownFolderQuery = ownFolderQuery.Where(f => f.ParentFolder == null); 
            else
                ownFolderQuery = ownFolderQuery.Where(f => f.ParentFolder != null && f.ParentFolder.id == folderId); 

            var ownFolders = await ownFolderQuery.ToListAsync();

            if (folderId is not null)
            {
                currentFolder = await appDbContext.Folders
                    .Include(f => f.ParentFolder)
                    .FirstOrDefaultAsync(f => f.id == folderId);
                
                if (currentFolder == null)
                {
                    return NotFound("Folder not found");
                }

                if (await fileAccessValidator.ValidateFolderPermissions(userId, currentFolder, PermissionFlags.Read) == false)
                {
                    return Unauthorized("User does not have access to this folder");
                }

                bool isOwner = currentFolder.OwnerId == userId;
                if (isOwner)
                {
                    currentFolderPermissions = (int)(PermissionFlags.Create | 
                                                     PermissionFlags.Read | 
                                                     PermissionFlags.Update | 
                                                     PermissionFlags.Delete);
                    canAddToFolder = true;
                    canDeleteFromFolder = true;
                }
                else
                {
                    currentFolderPermissions = await fileAccessValidator.GetUserFolderPermissions(userId, currentFolder);
                    canAddToFolder = await fileAccessValidator.ValidateFolderAddPermission(userId, currentFolder);
                    canDeleteFromFolder = await fileAccessValidator.ValidateFolderPermissions(userId, currentFolder, PermissionFlags.Delete);
                }

                if (isOwner)
                {
                    var allSubfolders = await appDbContext.Folders
                        .Where(f => f.ParentFolder != null && f.ParentFolder.id == folderId)
                        .ToListAsync();
                    
                    var ownSubfolderIds = ownFolders.Select(f => f.id).ToHashSet();
                    sharedFolders = allSubfolders
                        .Where(f => !ownSubfolderIds.Contains(f.id))
                        .ToList();
                }
                else
                {
                    var sharedSubfolders = await appDbContext.Folders
                        .Where(f => f.ParentFolder != null && f.ParentFolder.id == folderId)
                        .ToListAsync();
                    
                    foreach (var subfolder in sharedSubfolders)
                    {
                        if (await fileAccessValidator.ValidateFolderPermissions(userId, subfolder, PermissionFlags.Read))
                        {
                            sharedFolders.Add(subfolder);
                        }
                    }
                }
            }
            else
            {
                var sharedFoldersAccesses = await appDbContext.FolderAccesses
                    .Include(fa => fa.folder)
                    .ThenInclude(f => f.ParentFolder)
                    .Where(fa => fa.user.id == userId)
                    .ToListAsync();
                
                var allSharedFolders = sharedFoldersAccesses
                    .Select(fa => fa.folder)
                    .ToList();
                
                var sharedFolderIdsSet = allSharedFolders.Select(f => f.id).ToHashSet();
                
                sharedFolders = allSharedFolders
                    .Where(f => f.ParentFolder == null || !sharedFolderIdsSet.Contains(f.ParentFolder.id))
                    .ToList();
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
                var ownFolderIds = ownFolders.Select(f => f.id).ToHashSet();
                sharedFolders = sharedFolders
                    .Where(f => !ownFolderIds.Contains(f.id))
                    .ToList();
            }

            //load own files with proper root/folder handling
            IQueryable<WebApplication1.File> ownFileQuery = appDbContext.Files
                .Where(f => f.UserId == userId);

            if (folderId is null)
                ownFileQuery = ownFileQuery.Where(f => f.ParentFolder == null);
            else
                ownFileQuery = ownFileQuery.Where(f => f.ParentFolder != null && f.ParentFolder.id == folderId);

            var ownFiles = await ownFileQuery.ToListAsync();

            var sharedFilesInFolder = new List<WebApplication1.File>();
            if (folderId is not null && currentFolder != null)
            {
                bool isOwner = currentFolder.OwnerId == userId;
                
                if (isOwner)
                {
                    var allFilesInFolder = await appDbContext.Files
                        .Where(f => f.ParentFolder != null && f.ParentFolder.id == folderId)
                        .ToListAsync();
                    
                    var ownerOwnFileIds = ownFiles.Select(f => f.id).ToHashSet();
                    sharedFilesInFolder = allFilesInFolder
                        .Where(f => !ownerOwnFileIds.Contains(f.id))
                        .ToList();
                }
                else
                {
                    var hasFolderAccess = await fileAccessValidator.ValidateFolderPermissions(
                        userId, currentFolder, WebApplication1.PermissionFlags.Read);
                    
                    if (hasFolderAccess)
                    {
                        var filesInSharedFolder = await appDbContext.Files
                            .Where(f => f.ParentFolder != null && 
                                       f.ParentFolder.id == folderId &&
                                       f.UserId == currentFolder.OwnerId)
                            .ToListAsync();
                        
                        sharedFilesInFolder.AddRange(filesInSharedFolder);
                    }
                    
                    var sharedFileAccesses = await appDbContext.FileAccesses
                        .Include(fa => fa.file)
                        .ThenInclude(f => f.ParentFolder)
                        .Where(fa => fa.user.id == userId && 
                                     fa.file.ParentFolder != null && 
                                     fa.file.ParentFolder.id == folderId)
                        .ToListAsync();
                    
                    var directlySharedFiles = sharedFileAccesses
                        .Select(fa => fa.file)
                        .ToList();
                    
                    var allFilesInFolder = sharedFilesInFolder
                        .Concat(directlySharedFiles)
                        .GroupBy(f => f.id)
                        .Select(g => g.First())
                        .ToList();
                    
                    sharedFilesInFolder = allFilesInFolder;
                }
            }

            var SharedWithUserFiles = new List<WebApplication1.File>();
            if (folderId == null)
            {
                var SharedWithUserFileIds = appDbContext.FileAccesses
                    .Where(f => f.user.id == userId)
                    .Select(f => f.file.id)
                    .ToList();

                SharedWithUserFiles = await appDbContext.Files
                    .Where(f => SharedWithUserFileIds.Contains(f.id) && f.ParentFolder == null)
                    .ToListAsync();
            }

            var allSharedFiles = sharedFilesInFolder
                .Concat(SharedWithUserFiles)
                .GroupBy(f => f.id)
                .Select(g => g.First())
                .ToList();

            // ADDED: avoid duplicate files (if user also owns file)
            var ownFileIds = ownFiles.Select(f => f.id).ToHashSet();
            allSharedFiles = allSharedFiles
                .Where(f => !ownFileIds.Contains(f.id))
                .ToList();
        
            var ownerIds = ownFolders.Select(f => f.OwnerId)
                .Concat(sharedFolders.Select(f => f.OwnerId))
                .Concat(ownFiles.Select(f => f.UserId))
                .Concat(allSharedFiles.Select(f => f.UserId))
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
                allSharedFiles.Select(f => new backend.DTO.UserItemDto
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
                page,
                pageSize,
                totalItems,
                totalPages,
                hasNext = page < totalPages,
                hasPrev = page > 1,
                sortBy = appliedKey,
                sortDir = desc ? "desc" : "asc",
                q,
                currentFolderPermissions = currentFolderPermissions,
                canAddToFolder = canAddToFolder,
                canDeleteFromFolder = canDeleteFromFolder
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
            await appDbContext.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetFileWithLink(Guid id)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var file = await appDbContext.Files
                .Include(f => f.ParentFolder)
                .FirstOrDefaultAsync(f => f.id == id);
            if (file == null) return NotFound("File not found");
            if (!await fileAccessValidator.ValidateUserAccess(userId, file)) return Forbid("You are not allowed to access this file");
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
        [HttpPatch("{id:guid}")]
        public async Task<IActionResult> UpdateFile(Guid id, [FromBody] UpdateFileDto updateDto)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var file = appDbContext.Files
                .Include(f => f.ParentFolder)
                .FirstOrDefault(f => f.id == id);
            if (file == null)
            {
                return NotFound("File not found");
            }

            // Check if user has access to the file
            if (!await fileAccessValidator.ValidateUserAccess(userId, file))
            {
                return Unauthorized("User does not have access to this file");
            }


            // Only file owner can change the folder
            bool isOwner = file.UserId == userId;
            if (!isOwner && updateDto.FolderId.HasValue)
            {
                return Unauthorized("Only file owner can change the file folder");
            }

            // Validate folder access if folderId is provided (not null and not Empty)
            Guid? folderIdToUpdate = null;
            if (updateDto.FolderId.HasValue)
            {
                if (updateDto.FolderId.Value == Guid.Empty)
                {
                    // Guid.Empty means move to root
                    folderIdToUpdate = Guid.Empty;
                }
                else
                {
                    var folder = appDbContext.Folders.FirstOrDefault(f => f.id == updateDto.FolderId.Value);
                    if (folder == null)
                    {
                        return NotFound("Folder not found");
                    }
                    if (await fileAccessValidator.ValidateFolderAddPermission(userId, folder) == false)
                    {
                        return Unauthorized("User does not have permission to add files to this folder");
                    }
                    folderIdToUpdate = updateDto.FolderId;
                }
            }

            var updatedFile = await uploadService.UpdateFileAsync(id, updateDto.FileName, folderIdToUpdate);
            if (updatedFile == null)
            {
                return BadRequest("Failed to update file");
            }

            return Ok(updatedFile);
        }

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFile(Guid id)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var file = await appDbContext.Files
                .Include(f => f.ParentFolder)
                .FirstOrDefaultAsync(f => f.id == id);
            
            if (file == null)
            {
                return NotFound("File not found");
            }

            if (!await fileAccessValidator.ValidateDeletePermission(userId, file))
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
