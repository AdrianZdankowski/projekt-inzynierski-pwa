namespace backend.DTO.Folder
{
    public class CreateFolderDto
    {
        public required string FolderName { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}
