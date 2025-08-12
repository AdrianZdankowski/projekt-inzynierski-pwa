namespace backend.Services
{
    public interface IFileConverter
    {
        Task CreateHlsPlaylistAsync(string sourceFile, string localDirectory, string targetDirectory);
    }
}
