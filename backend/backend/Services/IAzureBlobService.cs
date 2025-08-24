using System;

public interface IAzureBlobService
{
    string BuildUserScopedBlobName(Guid userId, Guid fileId, string originalFileName);

    string GenerateUploadSasUri(string blobName, string contentType, TimeSpan ttl);

    string GenerateDownloadSasUri(string blobName, TimeSpan ttl);
    Task<Stream> GetFile(string blobName);
    Task DonwloadFileToDirectory(string blobName, string targetDirectory, string fileName);
    Task UploadFileAsync(string blobName, string filePath, string targetDirectory);
}
