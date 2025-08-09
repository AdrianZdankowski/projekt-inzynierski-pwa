import VideoPlayer from "../components/VideoPlayer";

const VideoTestPage = () => {
    // Aby odtworzyć wideo lokalne skopiuj plik do katalogu public, ścieżka to /[nazwa_pliku].[rozszerznie]
    return <>
    <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"/>
    </>
};

export default VideoTestPage;