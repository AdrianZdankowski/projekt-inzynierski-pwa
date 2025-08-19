using System;

public interface IAzureBlobService
{
    string BuildUserScopedBlobName(Guid userId, Guid fileId, string originalFileName);

    string GenerateUploadSasUri(string blobName, string contentType, TimeSpan ttl);

    string GenerateDownloadSasUri(string blobName, TimeSpan ttl);
}
