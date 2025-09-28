namespace backend.DTO.File
{
    public class FileListItem
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string MimeType { get; set; }
        public long Size { get; set; }
        public DateTime UploadTimestamp { get; set; }
        public int Status { get; set; }
        public Guid UserId { get; set; }
        public string OwnerName { get; set; }
    }
}
