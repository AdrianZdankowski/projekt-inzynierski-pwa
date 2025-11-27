using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using PwaApp.Application.Interfaces;
using System;
using System.Threading.Tasks;
using WebApplication1;
using FileEntity = WebApplication1.File;

namespace backend.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly string _connectionString;
        private readonly string _containerName;
        private readonly IAppDbContext _context;
        private readonly IAzureBlobService _blobSvc;

        public FileUploadService(IConfiguration config, IAppDbContext context, IAzureBlobService blobSvc)
        {
            _connectionString = config.GetValue<string>("AzureStorage:ConnectionString")!;
            _containerName = config.GetValue<string>("AzureStorage:ContainerName")!;
            _context = context;
            _blobSvc = blobSvc;
        }

        public async Task<Guid> UploadSmallFileAsync(IFormFile file, Guid userId)
        {
            if (file is null || file.Length == 0)
                throw new ArgumentException("No file content", nameof(file));

            var container = new BlobContainerClient(_connectionString, _containerName);
            await container.CreateIfNotExistsAsync();

            var fileId = Guid.NewGuid();
            var blobName = _blobSvc.BuildUserScopedBlobName(userId, fileId, file.FileName);
            var blob = container.GetBlobClient(blobName);

            try
            {
                if (await blob.ExistsAsync())
                    throw new InvalidOperationException("Blob already exists for this fileId.");
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                
            }

            using var stream = file.OpenReadStream();
            var headers = new BlobHttpHeaders { ContentType = file.ContentType };

            await blob.UploadAsync(stream, headers);

            try
            {
                await blob.SetTagsAsync(new System.Collections.Generic.Dictionary<string, string>
                {
                    ["owner"] = userId.ToString("D"),
                    ["fileId"] = fileId.ToString("D")
                });
            }
            catch (RequestFailedException)
            {
                
            }

            var entity = new FileEntity
            {
                id = fileId,
                UserId = userId,
                FileName = file.FileName,
                MimeType = file.ContentType ?? "application/octet-stream",
                Size = file.Length,
                BlobName = blobName,
                UploadTimestamp = DateTime.UtcNow,
                Status = FileStatus.Uploaded, 
                Checksum = null
            };

            _context.Files.Add(entity);
            await _context.SaveChangesAsync();

            return fileId;
        }
        public async Task<bool> DeleteFile(Guid fileId)
        {
            var file = _context.Files.FirstOrDefault(f => f.id ==  fileId);

            try
            {
                _context.Files.Remove(file);
                await _context.SaveChangesAsync();
                await _blobSvc.DeleteFile(file.BlobName);
            }
            catch (Exception ex)
            {
                return false;
            }

            return true;
        }
    }
}