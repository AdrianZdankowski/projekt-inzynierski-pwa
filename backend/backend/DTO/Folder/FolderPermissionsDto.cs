namespace backend.DTO.Folder
{
    public class FolderPermissionsDto
    {
        public required Guid FolderId { get; set; }
        public required Guid UserId { get; set; }
        public required int Permissions { get; set; }
    }
}
