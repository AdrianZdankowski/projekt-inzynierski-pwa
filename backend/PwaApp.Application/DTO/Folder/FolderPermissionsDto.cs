namespace backend.DTO.Folder
{
    public class FolderPermissionsDto
    {
        public required Guid FolderId { get; set; }
        public required string UserName { get; set; }
        public required int Permissions { get; set; }
    }
}
