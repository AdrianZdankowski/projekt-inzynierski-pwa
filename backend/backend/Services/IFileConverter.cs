namespace backend.Services
{
    public interface IFileConverter
    {
        Task CreateHlsPlaylistAsync(string localDirectory, WebApplication1.File file, Guid userId);
    }
}
