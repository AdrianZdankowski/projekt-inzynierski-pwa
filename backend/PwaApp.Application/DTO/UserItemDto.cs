namespace backend.DTO
{
    public class UserItemDto
    {
        //file or folder
        public string Type { get; set; } = default!;

        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        //for files only, null for folders
        public long? Size { get; set; }

        //for files only, null for folders
        public string? MimeType { get; set; }

        
        //files: UploadTimestamp
        //folders: CreatedDate
        public DateTime Date { get; set; }

        //true if item is shared with user  (FolderAccess/FileAccess)
        public bool IsShared { get; set; }

        //file only
        public int Status { get; set; }

        public Guid UserId { get; set; }

        public string OwnerName { get; set; } = string.Empty;
    }
}
