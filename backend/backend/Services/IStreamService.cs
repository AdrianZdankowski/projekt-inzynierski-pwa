namespace backend.Services
{
    public interface IStreamService
    {
        Task<Stream> GetVideo(string accessToken, Guid videoId, string fileName); //videoId - id of main video, filename - name of video segment or .m3u8 file
    }
}
