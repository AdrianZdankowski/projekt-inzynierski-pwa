using backend.DTO.Folder;
using WebApplication1;

namespace PwaApp.Application.Interfaces
{
    public interface IFolderService
    {
        Task<Folder?> AddFolderAsync(CreateFolderDto folderDto, Guid userId);
        Task DeleteFolderAsync(Guid folderId);
        Task<FolderAccess> AddFolderPermissions(User user, Folder folder, PermissionFlags permissions);
        Task<List<FolderDto>> GetUserOwnFoldersTreeAsync(Guid userId);
        Task<List<FolderDto>> GetUserSharedFoldersTreeAsync(Guid userId);
        Task<FolderDto?> UpdateFolderAsync(Guid folderId, string? folderName, Guid? parentFolderId);
    }
}
