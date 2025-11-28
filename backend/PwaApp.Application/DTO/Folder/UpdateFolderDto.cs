namespace backend.DTO.Folder
{
    public class UpdateFolderDto
    {
        public string? FolderName { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}

