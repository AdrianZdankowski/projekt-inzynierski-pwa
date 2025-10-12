using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IFileUploadService
    {
        Task<Guid> UploadSmallFileAsync(IFormFile file, Guid userId);
        Task<bool> DeleteFile(Guid fileId);
    }
}
