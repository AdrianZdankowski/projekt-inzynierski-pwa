using System;

public interface IAzureBlobService
{
    string GenerateUploadSasUri(string fileName, string contentType);
}
