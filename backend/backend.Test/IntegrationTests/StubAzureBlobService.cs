namespace backend.Test.IntegrationTests
{
    public class StubAzureBlobService : IAzureBlobService
    {
        public string BuildUserScopedBlobName(Guid userId, Guid fileId, string originalFileName)
            => $"users/{userId}/files/{fileId}/{originalFileName}";

        public string GenerateUploadSasUri(string blobName, string contentType, TimeSpan ttl)
            => $"https://stub/upload/{Uri.EscapeDataString(blobName)}?ct={Uri.EscapeDataString(contentType)}&ttl={(int)ttl.TotalSeconds}";

        public string GenerateDownloadSasUri(string blobName, TimeSpan ttl)
            => $"https://stub/download/{Uri.EscapeDataString(blobName)}?ttl={(int)ttl.TotalSeconds}";

        public Task<Stream> GetFile(string blobName)
            => Task.FromResult<Stream>(new MemoryStream(System.Text.Encoding.UTF8.GetBytes($"stub:{blobName}")));

        //typo to be fixed later: "DoNwload"
        public async Task DonwloadFileToDirectory(string blobName, string targetDirectory, string fileName)
        {
            Directory.CreateDirectory(targetDirectory);
            var path = Path.Combine(targetDirectory, fileName);
            await File.WriteAllTextAsync(path, $"stub downloaded: {blobName}");
        }

        public async Task UploadFileAsync(string blobName, string filePath, string targetDirectory)
        {
            var root = Path.Combine(Path.GetTempPath(), "stub-blob-storage");
            var destDir = Path.Combine(root, targetDirectory ?? string.Empty);
            Directory.CreateDirectory(destDir);

            var destPath = Path.Combine(destDir, Path.GetFileName(filePath ?? "stub.txt"));
            if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath))
                File.Copy(filePath, destPath, overwrite: true);
            else
                await File.WriteAllTextAsync(destPath, $"stub uploaded: {blobName}");
        }
    }
}