using backend.DTO.Folder;
using Microsoft.EntityFrameworkCore;
using WebApplication1;

namespace backend.Services
{
    public class FolderService(AppDbContext appDbContext, FileUploadService fileUploadService) : IFolderService
    {
        public async Task<Folder?> AddFolderAsync(CreateFolderDto folderDto, Guid userId)
        {
            Folder parentFolder = null;
            if (folderDto.ParentFolderId is not null)
            {
                parentFolder = appDbContext.Folders.FirstOrDefault(f => f.id == folderDto.ParentFolderId.Value);
            }
            Folder folder = new Folder(Guid.NewGuid(), userId, folderDto.FolderName, folderDto.CreatedDate, parentFolder);
            appDbContext.Folders.Add(folder);
            await appDbContext.SaveChangesAsync();
            return folder;
        }

        public async Task DeleteFolderAsync(Guid folderId)
        {
            var files = appDbContext.Files.Where(f => f.ParentFolder.id == folderId).ToList();
            foreach (var file in files)
            {
                await fileUploadService.DeleteFile(file.id);
            }
            
            var folder = appDbContext.Folders.FirstOrDefault(f => f.id == folderId);
            appDbContext.Folders.Remove(folder);
            await appDbContext.SaveChangesAsync();
        }
    }
}
