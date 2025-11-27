using System.Collections.Generic;
using System.Linq;
using PwaApp.Application.Interfaces;

namespace backend.Services
{

    public class FileConverter(IEnumerable<IFileConversionStrategy> strategies) : IFileConverter
    {
        private readonly IEnumerable<IFileConversionStrategy> _strategies = strategies;


        public async Task ConvertFileAsync(string localDirectory, WebApplication1.File file, Guid userId)
        {
            var strategy = _strategies.FirstOrDefault(s => s.CanHandle(file.MimeType));
            
            if (strategy == null)
            {
                throw new NotSupportedException($"No conversion strategy found for MIME type: {file.MimeType}");
            }

            await strategy.ConvertAsync(localDirectory, file, userId);
        }


        [Obsolete("Use ConvertFileAsync instead")]
        public async Task CreateHlsPlaylistAsync(string localDirectory, WebApplication1.File file, Guid userId)
        {
            await ConvertFileAsync(localDirectory, file, userId);
        }
    }
}
