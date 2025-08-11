namespace backend.DTO.File
{
    public class FileDownloadDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string MimeType { get; set; }
        public long Size { get; set; }
        public DateTime UploadTimestamp { get; set; }
        public string DownloadUrl { get; set; }    
        public int ExpiresInSeconds { get; set; }   
    }
}
