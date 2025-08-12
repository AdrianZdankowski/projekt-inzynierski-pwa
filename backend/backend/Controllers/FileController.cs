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
        IFileConverter fileConverter) : ControllerBase
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
                return BadRequest(ModelState);

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("Invalid or missing user ID");

            try
            {
                var fileId = await uploadService.CommitUploadMetadataAsync(dto, userId);
                string tempDirectory = Path.Combine(@"C:\temp", dto.FileName.Replace(".", ""), DateTime.Now.ToString("yyyyMMdd_HHmmss"));
                string targetDirectory = string.Concat(userId.ToString(),"/", dto.FileName);
                await fileConverter.CreateHlsPlaylistAsync(dto.FileName, tempDirectory, targetDirectory);
                return Ok(new { Message = "Upload committed", FileId = fileId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Commit failed: {ex.Message}");
            }
        }
    }
}