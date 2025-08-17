namespace backend.DTO.File
{
    public class FileMetadataDto
    {
        public Guid FileId { get; set; }
        public long Size { get; set; }
        public string MimeType { get; set; }
        public string Checksum { get; set; }
    }
}
