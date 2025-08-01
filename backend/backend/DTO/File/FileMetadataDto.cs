using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTO.File
{
    public class FileMetadataDto
    {
        [Required]
        public string FileName { get; set; }

        [Required]
        public string MimeType { get; set; }

        [Required]
        public long Size { get; set; }

        [Required]
        public string BlobUri { get; set; }

        public DateTime UploadTimestamp { get; set; } = DateTime.UtcNow;
    }
}
