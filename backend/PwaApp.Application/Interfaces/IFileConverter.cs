namespace PwaApp.Application.Interfaces
{
    public interface IFileConverter
    {

        Task ConvertFileAsync(string localDirectory, WebApplication1.File file, Guid userId);

        [Obsolete("Use ConvertFileAsync instead")]
        Task CreateHlsPlaylistAsync(string localDirectory, WebApplication1.File file, Guid userId);
    }
}
