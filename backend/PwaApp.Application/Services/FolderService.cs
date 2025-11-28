using backend.Data;
using backend.DTO.Folder;
using Microsoft.EntityFrameworkCore;
using PwaApp.Application.Interfaces;
using WebApplication1;

namespace backend.Services
{
    public class FolderService(IAppDbContext appDbContext, IFileUploadService fileUploadService) : IFolderService
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

            var folders = appDbContext.Folders.Where(f => f.ParentFolder.id == folderId).ToList();
            foreach (var deleteFolder in folders)
            {
                await DeleteFolderAsync(deleteFolder.id);
            }

            var folder = appDbContext.Folders.FirstOrDefault(f => f.id == folderId);
            appDbContext.Folders.Remove(folder);
            await appDbContext.SaveChangesAsync();
        }
        public async Task<FolderAccess> AddFolderPermissions(User user, Folder folder, PermissionFlags permissions)
        {
            var folderPermissions = new FolderAccess(Guid.NewGuid(), folder, user, permissions);

            appDbContext.FolderAccesses.Add(folderPermissions);
            await appDbContext.SaveChangesAsync();

            return folderPermissions;
        }

        private FolderDto BuildFolderTree(WebApplication1.Folder folder, List<WebApplication1.Folder> allFolders)
        {
            var folderDto = new FolderDto
            {
                Id = folder.id,
                FolderName = folder.FolderName,
                SubFolders = new List<FolderDto>()
            };

            // Find all subfolders
            var subFolders = allFolders
                .Where(f => f.ParentFolder?.id == folder.id)
                .ToList();

            // Build subfolders recursively
            foreach (var subFolder in subFolders)
            {
                folderDto.SubFolders.Add(BuildFolderTree(subFolder, allFolders));
            }

            return folderDto;
        }

        public async Task<List<FolderDto>> GetUserOwnFoldersTreeAsync(Guid userId)
        {
            // Get all folders owned by the user
            var allOwnFolders = await appDbContext.Folders
                .Where(f => f.OwnerId == userId)
                .Include(f => f.ParentFolder)
                .ToListAsync();

            // Build tree starting from root folders
            var rootFolders = allOwnFolders
                .Where(f => f.ParentFolder == null)
                .ToList();

            return rootFolders
                .Select(f => BuildFolderTree(f, allOwnFolders))
                .ToList();
        }

        public async Task<List<FolderDto>> GetUserSharedFoldersTreeAsync(Guid userId)
        {
            // Get folders shared with the user (only root folders)
            var sharedFolderIds = await appDbContext.FolderAccesses
                .Where(fa => fa.user.id == userId)
                .Select(fa => fa.folder.id)
                .ToListAsync();

            var sharedRootFolders = await appDbContext.Folders
                .Where(f => sharedFolderIds.Contains(f.id) && f.ParentFolder == null)
                .Include(f => f.ParentFolder)
                .ToListAsync();

            // Exclude folders that user already owns
            var ownFolderIds = await appDbContext.Folders
                .Where(f => f.OwnerId == userId)
                .Select(f => f.id)
                .ToListAsync();
            
            var ownFolderIdsSet = ownFolderIds.ToHashSet();
            var uniqueSharedFolders = sharedRootFolders
                .Where(f => !ownFolderIdsSet.Contains(f.id))
                .ToList();

            // todo: right now access is granted only to main folder - change it to allow access to subfolders
            return uniqueSharedFolders.Select(f => new FolderDto
            {
                Id = f.id,
                FolderName = f.FolderName,
                SubFolders = new List<FolderDto>()
            }).ToList();
        }

    }
}
