using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace backend.DTO.File
{
    public class FileUploadDto
    {
        [Required]
        public required IFormFile File { get; set; }
    }
}
