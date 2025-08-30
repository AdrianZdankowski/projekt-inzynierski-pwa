import VideoPlayer from "../components/VideoPlayer";

// Propy będą przekazywane przez navigate, odbierane przez useLocation
interface VideoPageProps {
    videoId: string;
}

const VideoTestPage = ({videoId} : VideoPageProps) => {
    // Aby odtworzyć wideo lokalne skopiuj plik do katalogu public, ścieżka to /[nazwa_pliku].[rozszerznie]
    //(https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8?token=test)

    const sampleUrl = `http://localhost:5105/api/Stream/${videoId}/master.m3u8`;

    return <>
    <VideoPlayer src={sampleUrl} fileName="video.mp4" ownerName="Janek" uploadTimestamp="2025-07-29T18:00:00Z"/>
     
    {/* <VideoPlayer src="https://pl.streamingvideoprovider.com/mp3-playlist/playlist.m3u8"/>  */}
    </>
};

export default VideoTestPage;