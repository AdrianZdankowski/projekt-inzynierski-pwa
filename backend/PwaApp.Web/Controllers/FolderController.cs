using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.DTO.Folder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PwaApp.Application.Interfaces;
using WebApplication1;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FolderController(IAppDbContext appDbContext, IFileAccessValidator fileAccessValidator, IFolderService folderService): ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<CreateFolderDto>> AddFolderAsync(CreateFolderDto request)
        {
            var claims = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(claims, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var folder = await folderService.AddFolderAsync(request, userId);

            return Ok(folder);
        }

        [Authorize]
        [HttpDelete("{folderId:guid}")]
        public async Task<ActionResult> DeleteFolder(Guid folderId) 
        {
            var claims = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(claims, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var folder = appDbContext.Folders.FirstOrDefault(f => f.id == folderId);
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
            var claims = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(claims, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

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
            var claims = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(claims, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var folders = await folderService.GetUserOwnFoldersTreeAsync(userId);
            return Ok(folders);
        }

        [Authorize]
        [HttpGet("shared")]
        public async Task<ActionResult<List<FolderDto>>> GetUserSharedFolders()
        {
            var claims = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(claims, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var folders = await folderService.GetUserSharedFoldersTreeAsync(userId);
            return Ok(folders);
        }

    }
}
