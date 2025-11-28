namespace backend.DTO.Folder
{
    public class FolderDto
    {
        public Guid Id { get; set; }
        public string FolderName { get; set; } = string.Empty;
        public List<FolderDto> SubFolders { get; set; } = new List<FolderDto>();
    }
}

