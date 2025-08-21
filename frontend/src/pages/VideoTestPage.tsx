import VideoPlayer from "../components/VideoPlayer";

const VideoTestPage = () => {
    // Aby odtworzyć wideo lokalne skopiuj plik do katalogu public, ścieżka to /[nazwa_pliku].[rozszerznie]
    //(https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8?token=test)
    return <>
    <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" fileName="video.mp4" ownerName="Janek" uploadTimestamp="2025-07-29T18:00:00Z"/>
     
    {/* <VideoPlayer src="https://pl.streamingvideoprovider.com/mp3-playlist/playlist.m3u8"/>  */}
    </>
};

export default VideoTestPage;