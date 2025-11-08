using System.Security.Claims;
using backend.DTO.Folder;
using backend.Migrations;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FolderController(AppDbContext appDbContext, FileAccessValidator fileAccessValidator, IFolderService folderService): ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<CreateFolderDto>> AddFolderAsync(CreateFolderDto request)
        {
            var claims = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(claims, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user ID");
            }

            var folder = await folderService.AddFolderAsync(request, userId);

            return Ok(folder);
        }

        [Authorize]
        [HttpDelete]
        public void DeleteFolder() 
        { 
        
        }

    }
}
