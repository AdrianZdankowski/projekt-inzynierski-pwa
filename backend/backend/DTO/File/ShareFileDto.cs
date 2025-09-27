namespace backend.DTO.File
{
    public class ShareFileDto
    {
        public required Guid FileId { get; set; }
        public required string UserName { get; set; }
    }
}
