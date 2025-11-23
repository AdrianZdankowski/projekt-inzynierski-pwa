using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class FileAccessValidator(AppDbContext context,IConfiguration config) : IFileAccessValidator
    {
        public async Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File file)
        {

            //var user = await GetUserFromJwt(accessToken);


            if (file.UserId.Equals(userId))
            {
                return true;
            }

            var fileAccess = context.FileAccesses.FirstOrDefault(f => f.file.id == file.id && f.user.id == userId);
            if (fileAccess is not null)
            {
                return true;
            }

            return false;
        }

        public async Task<bool> ValidateDeletePermission(Guid userId, WebApplication1.File file)
        {
            //currently only owner can delete file
            if (file.UserId.Equals(userId))
            {
                return true;
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

            //checking if user has permissions for creating files in folder
            var permissions = context.FolderAccesses.FirstOrDefault(f => f.user.id == userId).permissions;
            if (WebApplication1.Permissions.hasPermission(WebApplication1.PermissionFlags.Create, permissions))
            {
                return true;
            }

            return false;
        }

        //function for validating permissions for given user in specified folder
        //to set multiple permissions use '|' eg. PermissionFlags.Create | PermissionFlags.Delete
        public async Task<bool> ValidateFolderPermissions(Guid userId, WebApplication1.Folder folder, WebApplication1.PermissionFlags requiredPermissions)
        {
            //owner can do everything
            if (folder.OwnerId.Equals(userId))
            {
                return true;
            }

            //checking if user has required permissions
            var permissions = context.FolderAccesses.FirstOrDefault(f => f.user.id == userId).permissions;
            if (WebApplication1.Permissions.hasPermission(requiredPermissions, permissions))
            {
                return true;
            }

            return false;
        }
    }
}
