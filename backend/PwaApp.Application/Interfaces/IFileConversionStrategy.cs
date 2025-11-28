namespace PwaApp.Application.Interfaces
{

    public interface IFileConversionStrategy
    {

        bool CanHandle(string mimeType);

        Task ConvertAsync(string localDirectory, WebApplication1.File file, Guid userId);
    }
}

