using System.Security.Claims;
using System.Threading.Tasks;
using backend.DTO.Folder;
using backend.Migrations;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FolderController(AppDbContext appDbContext, IFileAccessValidator fileAccessValidator, IFolderService folderService): ControllerBase
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
            if (await fileAccessValidator.ValidateFolderDeletePermission(userId, folder) == false)
            {
                return Unauthorized("User does not have permission to delete this folder");
            }

            await folderService.DeleteFolderAsync(folderId);
            return Ok();
        }

    }
}
