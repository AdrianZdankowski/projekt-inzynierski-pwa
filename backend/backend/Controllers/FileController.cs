using backend.Contexts;
using backend.DTO.File;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FileEntity = WebApplication1.File;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController(
        IFileUploadService uploadService,
        IAzureBlobService azureBlobService,
        FileContext fileContext) : ControllerBase
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
                var blobUri = await uploadService.UploadFileAsync(request.File, userId);
                return Ok(new { BlobUri = blobUri });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Upload failed: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet("generate-upload-link")]
        public IActionResult GetUploadLink(string fileName, string contentType)
        {
            var uri = azureBlobService.GenerateUploadSasUri(fileName, contentType);
            return Ok(new { uploadUrl = uri });
        }

        [Authorize]
        [HttpPost("commit")]
        public async Task<IActionResult> CommitUpload([FromBody] FileMetadataDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            try
            {
                var fileId = await uploadService.CommitUploadMetadataAsync(dto, userId);
                return Ok(new { Message = "Upload committed", FileId = fileId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Commit failed: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet]
        public IActionResult GetUserFiles()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var files = fileContext.Files
                .Where(f => f.UserId == userId)
                .Select(f => new
                {
                    f.id,
                    f.FileName,
                    f.MimeType,
                    f.Size,
                    f.UploadTimestamp,
                    f.BlobUri
                })
                .ToList();

            return Ok(files);
        }

        [Authorize]
        [HttpGet("{id:guid}")]
        public IActionResult GetFileWithLink(Guid id, [FromServices] FileContext fileContext, [FromServices] IAzureBlobService azureBlobService)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid or missing user ID");
            }

            var file = fileContext.Files.FirstOrDefault(f => f.id == id);
            if (file == null) return NotFound("File not found");

            if (file.UserId != userId) return Forbid("You are not allowed to access this file");

            var timeToLive = TimeSpan.FromMinutes(10);
            var downloadUrl = azureBlobService.GenerateDownloadSasUri(file.FileName, timeToLive);

            var returnDto = new FileDownloadDto
            {
                Id = file.id,
                FileName = file.FileName,
                MimeType = file.MimeType,
                Size = file.Size,
                UploadTimestamp = file.UploadTimestamp,
                DownloadUrl = downloadUrl,
                ExpiresInSeconds = (int)timeToLive.TotalSeconds
            };

            return Ok(returnDto);
        }
    }
}