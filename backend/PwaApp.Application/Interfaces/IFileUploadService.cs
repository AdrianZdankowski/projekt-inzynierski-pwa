using backend.DTO.File;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace PwaApp.Application.Interfaces
{
    public interface IFileUploadService
    {
        Task<Guid> UploadSmallFileAsync(IFormFile file, Guid userId);
        Task<bool> DeleteFile(Guid fileId);
        Task<FileListItem?> UpdateFileAsync(Guid fileId, string? fileName, Guid? folderId);
    }
}
