namespace PwaApp.Application.Interfaces
{
    public interface IFileAccessValidator
    {
        Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File file);
        Task<bool> ValidateDeletePermission(Guid userId, WebApplication1.File file);
        Task<bool> ValidateFolderDeletePermission(Guid userId, WebApplication1.Folder folder);
        Task<bool> ValidateFolderAddPermission(Guid userId, WebApplication1.Folder folder);
        Task<bool> ValidateFolderPermissions(Guid guid, WebApplication1.Folder folder, WebApplication1.PermissionFlags requiredPermissions);
    }
}
