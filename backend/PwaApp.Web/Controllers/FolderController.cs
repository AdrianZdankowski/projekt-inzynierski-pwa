using System.Threading.Tasks;
using backend.Data;
using backend.DTO.Folder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PwaApp.Application.Interfaces;
using WebApplication1;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    public class FolderController(IAppDbContext appDbContext, IFileAccessValidator fileAccessValidator, IFolderService folderService): ApiControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<CreateFolderDto>> AddFolderAsync(CreateFolderDto request)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var folder = await folderService.AddFolderAsync(request, userId);

            return Ok(folder);
        }

        [Authorize]
        [HttpDelete("{folderId:guid}")]
        public async Task<ActionResult> DeleteFolder(Guid folderId) 
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var folder = appDbContext.Folders.FirstOrDefault(f => f.id == folderId);
            if (folder == null)
            {
                return NotFound("Folder not found");
            }
            if (await fileAccessValidator.ValidateFolderPermissions(userId, folder, WebApplication1.PermissionFlags.Delete) == false)
            {
                return Unauthorized("User does not have permission to delete this folder");
            }

            await folderService.DeleteFolderAsync(folderId);
            return Ok();
        }

        [Authorize]
        [HttpPost("permissions")]
        public async Task<ActionResult> AddFolderPermissions(FolderPermissionsDto request)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var folder = appDbContext.Folders.FirstOrDefault(f => f.id == request.FolderId);
            //todo: change in case other users should be able to grant access
            if (folder is null || folder.OwnerId !=userId)
            {
                return Unauthorized("Only folder owner can grant access");
            }

            var user = appDbContext.Users.FirstOrDefault(x => x.id == request.UserId);
            if (user is null)
            {
                return BadRequest("User does not exists");
            }
            var folderPermissions = await folderService.AddFolderPermissions(user, folder, (PermissionFlags)request.Permissions);

            return Ok(folderPermissions);
        }

        [Authorize]
        [HttpGet("owned")]
        public async Task<ActionResult<List<FolderDto>>> GetUserOwnFolders()
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var folders = await folderService.GetUserOwnFoldersTreeAsync(userId);
            return Ok(folders);
        }

        [Authorize]
        [HttpGet("shared")]
        public async Task<ActionResult<List<FolderDto>>> GetUserSharedFolders()
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var folders = await folderService.GetUserSharedFoldersTreeAsync(userId);
            return Ok(folders);
        }

        [Authorize]
        [HttpPatch("{folderId:guid}")]
        public async Task<ActionResult<FolderDto>> UpdateFolder(Guid folderId, [FromBody] UpdateFolderDto updateDto)
        {
            Guid userId;
            try { userId = GetUserIdOrThrow(); } catch { return Unauthorized("Invalid or missing user ID"); }

            var folder = appDbContext.Folders
                .Include(f => f.ParentFolder)
                .FirstOrDefault(f => f.id == folderId);
            
            if (folder == null)
            {
                return NotFound("Folder not found");
            }

            // Check if user has access to the folder
            if (folder.OwnerId != userId)
            {
                if (!await fileAccessValidator.ValidateFolderPermissions(userId, folder, WebApplication1.PermissionFlags.Update))
                {
                    return Unauthorized("User does not have permission to update this folder");
                }
            }

            // Only folder owner can change the parent folder
            bool isOwner = folder.OwnerId == userId;
            if (!isOwner && updateDto.ParentFolderId.HasValue)
            {
                return Unauthorized("Only folder owner can change the folder location");
            }

            // Validate parent folder access if parentFolderId is provided
            Guid? parentFolderIdToUpdate = null;
            if (updateDto.ParentFolderId.HasValue)
            {
                if (updateDto.ParentFolderId.Value == Guid.Empty)
                {
                    // Guid.Empty means move to root
                    parentFolderIdToUpdate = Guid.Empty;
                }
                else
                {
                    var parentFolder = appDbContext.Folders.FirstOrDefault(f => f.id == updateDto.ParentFolderId.Value);
                    if (parentFolder == null)
                    {
                        return NotFound("Parent folder not found");
                    }
                    if (await fileAccessValidator.ValidateFolderAddPermission(userId, parentFolder) == false)
                    {
                        return Unauthorized("User does not have permission to add folders to this parent folder");
                    }
                    parentFolderIdToUpdate = updateDto.ParentFolderId;
                }
            }

            var updatedFolder = await folderService.UpdateFolderAsync(folderId, updateDto.FolderName, parentFolderIdToUpdate);
            if (updatedFolder == null)
            {
                return BadRequest("Failed to update folder");
            }

            return Ok(updatedFolder);
        }

    }
}
