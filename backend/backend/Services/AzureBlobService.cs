using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Linq;

public class AzureBlobService(IConfiguration config) : IAzureBlobService
{
    private readonly string _cs = config["AzureStorage:ConnectionString"];
    private readonly string _cn = config["AzureStorage:ContainerName"];

    private BlobClient Blob(string blobName)
        => new BlobContainerClient(_cs, _cn).GetBlobClient(blobName);

    public string BuildUserScopedBlobName(Guid userId, Guid fileId, string originalFileName)
    {
        var safe = Sanitize(originalFileName);
        return $"{userId:D}/{fileId:D}/{safe}";
    }

    public string GenerateUploadSasUri(string blobName, string contentType, TimeSpan ttl)
    {
        var blob = Blob(blobName);
        if (!blob.CanGenerateSasUri) throw new InvalidOperationException("Cannot generate SAS");

        var b = new BlobSasBuilder
        {
            BlobContainerName = _cn,
            BlobName = blobName,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-2),
            ExpiresOn = DateTimeOffset.UtcNow.Add(ttl),
            Protocol = SasProtocol.Https,
            ContentType = contentType
        };
        b.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);
        return blob.GenerateSasUri(b).ToString();
    }

    public string GenerateDownloadSasUri(string blobName, TimeSpan ttl)
    {
        var blob = Blob(blobName);
        if (!blob.CanGenerateSasUri) throw new InvalidOperationException("Cannot generate SAS");

        var b = new BlobSasBuilder
        {
            BlobContainerName = _cn,
            BlobName = blobName,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-2),
            ExpiresOn = DateTimeOffset.UtcNow.Add(ttl),
            Protocol = SasProtocol.Https
        };
        b.SetPermissions(BlobSasPermissions.Read);

        b.ContentDisposition = $"attachment; filename={blobName.Substring(74)}";
        return blob.GenerateSasUri(b).ToString();
    }

    private static string Sanitize(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "file";
        var invalid = Path.GetInvalidFileNameChars();
        var safe = new string(name.Select(c => invalid.Contains(c) ? '_' : c).ToArray());
        return safe.Length > 200 ? safe[..200] : safe;
    }

    public async Task<Stream> GetFile(string blobName)
    {

        BlobServiceClient blobServiceClient = new BlobServiceClient(_cs);
        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(_cn);
        BlobClient blobClient = containerClient.GetBlobClient(blobName);

        var response = await blobClient.DownloadAsync();
        return response.Value.Content;
    }
    public async Task DonwloadFileToDirectory(string blobName, string targetDirectory, string fileName)
    {
        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        BlobServiceClient blobServiceClient = new BlobServiceClient(_cs);
        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(_cn);
        BlobClient blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.DownloadToAsync(Path.Combine(targetDirectory, fileName));
    }

    public async Task UploadFileAsync(string blobName, string filePath, string targetDirectory)
    {
        BlobServiceClient blobServiceClient = new BlobServiceClient(_cs);
        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(_cn);
        BlobClient blobClient = containerClient.GetBlobClient(string.Concat(targetDirectory, "/", blobName));

        await blobClient.UploadAsync(filePath);
    }

    public async Task DeleteFile(string blobName)
    {
        var container = new BlobContainerClient(_cs, _cn);

        //deleting filename from blobName to get folder name
        int index = blobName.LastIndexOf('/');
        if (index >= 0)
            blobName = blobName.Substring(0, index);

        //deleting all files in folder (multiple files in one folder are in case of video files)
        await foreach (var blob in container.GetBlobsAsync(prefix: blobName))
        {
            var blobClient = container.GetBlobClient(blob.Name);
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
