using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;

public class AzureBlobService(IConfiguration config) : IAzureBlobService
{
    private readonly string _connectionString = config["AzureStorage:ConnectionString"];
    private readonly string _containerName = config["AzureStorage:ContainerName"];

    public string GenerateUploadSasUri(string fileName, string contentType)
    {
        var blobClient = new BlobContainerClient(_connectionString, _containerName);
        var blob = blobClient.GetBlobClient(fileName);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerName,
            BlobName = fileName,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddHours(1),
            ContentType = contentType
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create | BlobSasPermissions.Add | BlobSasPermissions.List);
        return blob.GenerateSasUri(sasBuilder).ToString();
    }

    public async Task<Stream> GetFile(string blobName)
    {

        BlobServiceClient blobServiceClient = new BlobServiceClient(_connectionString);
        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
        BlobClient blobClient = containerClient.GetBlobClient(blobName);

        var response = await blobClient.DownloadAsync();
        return response.Value.Content;
    }
}
