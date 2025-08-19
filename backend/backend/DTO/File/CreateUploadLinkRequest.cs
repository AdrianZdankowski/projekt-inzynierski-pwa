namespace backend.DTO.File
{
    public class CreateUploadLinkRequest
    {
        public string FileName { get; set; }
        public string MimeType { get; set; }
        public long ExpectedSize { get; set; }
    }
}
