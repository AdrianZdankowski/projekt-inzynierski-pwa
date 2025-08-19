import VideoPlayer from "../components/VideoPlayer";

const VideoTestPage = () => {
    // Aby odtworzyć wideo lokalne skopiuj plik do katalogu public, ścieżka to /[nazwa_pliku].[rozszerznie]
    //(https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8?token=test)
    return <>
    <h1 style={{marginLeft: '50%'}}>Wideo</h1>
    <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"/>
     {/* <h1 style={{marginLeft: '50%'}}>Audio</h1>
    <VideoPlayer src="https://pl.streamingvideoprovider.com/mp3-playlist/playlist.m3u8"/> */}
    </>
};

export default VideoTestPage;