using Microsoft.AspNetCore.Mvc;
using PwaApp.Application.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class StreamController(IStreamService streamService) : ControllerBase
    {
        [HttpGet("{videoId}/{fileName}")]
        public async Task<IActionResult> GetVideo(string videoId, string fileName, [FromQuery] string accessToken)
        {
            var returnFile = await streamService.GetVideo(accessToken, Guid.Parse(videoId), fileName);

            if (fileName.EndsWith(".m3u8", StringComparison.OrdinalIgnoreCase))
                return File(returnFile, "application/vnd.apple.mpegurl");

            else if (fileName.EndsWith(".ts", StringComparison.OrdinalIgnoreCase))
                return File(returnFile, "video/MP2T");
            else
                return BadRequest();
        }
    }
}
