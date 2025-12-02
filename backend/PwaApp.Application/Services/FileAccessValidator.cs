using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PwaApp.Application.Interfaces;

namespace backend.Services
{
    public class FileAccessValidator(IAppDbContext context,IConfiguration config) : IFileAccessValidator
    {
        public async Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File file)
        {
            if (file.UserId.Equals(userId))
            {
                return true;
            }

            var fileAccess = await context.FileAccesses
                .FirstOrDefaultAsync(f => f.file.id == file.id && f.user.id == userId);
            if (fileAccess is not null)
            {
                return true;
            }

            if (file.ParentFolder != null)
            {
                var folder = await context.Folders
                    .Include(f => f.ParentFolder)
                    .FirstOrDefaultAsync(f => f.id == file.ParentFolder.id);
                
                if (folder != null)
                {
                    return await ValidateFolderPermissions(userId, folder, WebApplication1.PermissionFlags.Read);
                }
            }
            
            return false;
        }

        public async Task<bool> ValidateDeletePermission(Guid userId, WebApplication1.File file)
        {
            if (file.UserId.Equals(userId))
            {
                return true;
            }

            if (file.ParentFolder != null)
            {
                var folder = await context.Folders
                    .Include(f => f.ParentFolder)
                    .FirstOrDefaultAsync(f => f.id == file.ParentFolder.id);
                
                if (folder != null)
                {
                    if (folder.OwnerId.Equals(userId))
                    {
                        return true;
                    }

                    return await ValidateFolderPermissions(userId, folder, WebApplication1.PermissionFlags.Delete);
                }
            }

            return false;
        }

        //todo: refactor this to have one method - ValidateDeletePermission for folders and files
        public async Task<bool> ValidateFolderDeletePermission(Guid userId, WebApplication1.Folder folder)
        {
            //todo: add logic after sharing folders
            if (folder.OwnerId.Equals(userId))
            {
                return true;
            }

            return false;
        }

        public async Task<bool> ValidateFolderAddPermission(Guid userId, WebApplication1.Folder folder)
        {
            //checking if user is owner
            if (folder.OwnerId.Equals(userId))
            {
                return true;
            }

            // Check permissions up the folder hierarchy
            return await ValidateFolderPermissionsWithParentCheck(userId, folder, WebApplication1.PermissionFlags.Create);
        }

        //function for validating permissions for given user in specified folder
        //to set multiple permissions use '|' eg. PermissionFlags.Create | PermissionFlags.Delete
        public async Task<bool> ValidateFolderPermissions(Guid userId, WebApplication1.Folder folder, WebApplication1.PermissionFlags requiredPermissions)
        {
            // Check permissions up the folder hierarchy
            return await ValidateFolderPermissionsWithParentCheck(userId, folder, requiredPermissions);
        }

        // Check permissions up the folder hierarchy using while loop
        // If user has access to a parent folder, they should have access to child folders
        private async Task<bool> ValidateFolderPermissionsWithParentCheck(Guid userId, WebApplication1.Folder folder, WebApplication1.PermissionFlags requiredPermissions)
        {
            if (folder == null)
            {
                return false;
            }

            var currentFolder = folder;

            while (currentFolder != null)
            {
                // Owner can do everything
                if (currentFolder.OwnerId.Equals(userId))
                {
                    return true;
                }

                // Check if user has direct permissions for this folder
                var folderAccess = await context.FolderAccesses
                    .FirstOrDefaultAsync(f => f.user.id == userId && f.folder.id == currentFolder.id);
                
                if (folderAccess != null)
                {
                    if (WebApplication1.Permissions.hasPermission(requiredPermissions, folderAccess.permissions))
                    {
                        return true;
                    }
                }

                // Move to parent folder
                if (currentFolder.ParentFolder != null)
                {
                    currentFolder = await context.Folders
                        .Include(f => f.ParentFolder)
                        .FirstOrDefaultAsync(f => f.id == currentFolder.ParentFolder.id);
                }
                else
                {
                    currentFolder = null;
                }
            }

            return false;
        }

        public async Task<int?> GetUserFolderPermissions(Guid userId, WebApplication1.Folder folder)
        {
            if (folder == null)
            {
                return null;
            }

            if (folder.OwnerId == userId)
            {
                return (int)(WebApplication1.PermissionFlags.Create | 
                             WebApplication1.PermissionFlags.Read | 
                             WebApplication1.PermissionFlags.Update | 
                             WebApplication1.PermissionFlags.Delete);
            }

            var currentFolder = folder;
            int? permissions = null;

            while (currentFolder != null)
            {
                var folderAccess = await context.FolderAccesses
                    .FirstOrDefaultAsync(fa => fa.user.id == userId && fa.folder.id == currentFolder.id);
                
                if (folderAccess != null)
                {
                    permissions = (int)folderAccess.permissions;
                    break;
                }

                if (currentFolder.ParentFolder != null)
                {
                    currentFolder = await context.Folders
                        .Include(f => f.ParentFolder)
                        .FirstOrDefaultAsync(f => f.id == currentFolder.ParentFolder.id);
                }
                else
                {
                    currentFolder = null;
                }
            }

            return permissions;
        }
    }
}
