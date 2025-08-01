using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using backend.Contexts;
using backend.DTO.File;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApplication1;
using FileEntity = WebApplication1.File;

namespace backend.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly string _connectionString;
        private readonly string _containerName;
        private readonly FileContext _context;

        public FileUploadService(IConfiguration config, FileContext context)
        {
            _connectionString = config.GetValue<string>("AzureStorage:ConnectionString")!;
            _containerName = config.GetValue<string>("AzureStorage:ContainerName")!;
            _context = context;
        }

        public async Task<string> UploadFileAsync(IFormFile file, Guid userId)
        {
            var containerClient = new BlobContainerClient(_connectionString, _containerName);
            await containerClient.CreateIfNotExistsAsync();

            var blobName = $"{Guid.NewGuid()}_{file.FileName}";
            var blobClient = containerClient.GetBlobClient(blobName);

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders
            {
                ContentType = file.ContentType
            });

            var metadata = new FileEntity
            {
                id = Guid.NewGuid(),
                UserId = userId,
                FileName = file.FileName,
                MimeType = file.ContentType,
                Size = file.Length,
                BlobUri = blobClient.Uri.ToString(),
                UploadTimestamp = DateTime.UtcNow
            };

            _context.Files.Add(metadata);
            await _context.SaveChangesAsync();

            return metadata.BlobUri;
        }

        public async Task<Guid> CommitUploadMetadataAsync(FileMetadataDto dto, Guid userId)
        {
            var metadata = new FileEntity
            {
                id = Guid.NewGuid(),
                UserId = userId,
                FileName = dto.FileName,
                MimeType = dto.MimeType,
                Size = dto.Size,
                BlobUri = dto.BlobUri,
                UploadTimestamp = dto.UploadTimestamp
            };

            _context.Files.Add(metadata);
            await _context.SaveChangesAsync();

            return metadata.id;
        }

    }
}
