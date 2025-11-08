using backend.DTO.Folder;
using WebApplication1;

namespace backend.Services
{
    public interface IFolderService
    {
        Task<Folder?> AddFolderAsync(CreateFolderDto folderDto, Guid userId);
        Task DeleteFolderAsync(Guid folderId);
    }
}
