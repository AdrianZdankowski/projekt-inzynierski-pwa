namespace backend.Services
{
    public interface IFileAccessValidator
    {
        Task<bool> ValidateUserAccess(Guid userId, WebApplication1.File video);
    }
}
