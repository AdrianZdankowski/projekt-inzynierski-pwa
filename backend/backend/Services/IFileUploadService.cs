using backend.DTO.File;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IFileUploadService
    {
        Task<string> UploadFileAsync(IFormFile file, Guid userId);
        Task<Guid> CommitUploadMetadataAsync(FileMetadataDto dto, Guid userId);
    }
}
