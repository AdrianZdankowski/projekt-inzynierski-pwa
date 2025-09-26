import { Navigate, useLocation } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { FileMetadata } from "../types/FileMetadata";
import { API_BASE_URL } from "../api/axiosConfig";

// Propy będą przekazywane przez navigate, odbierane przez useLocation
interface VideoPageProps {
    file: FileMetadata;
    isShared: boolean;
}

const VideoTestPage = () => {

    const {state} = useLocation() as {state?: VideoPageProps}

    if (!state?.file) return <Navigate to="/user-files" replace/>

    // Aby odtworzyć wideo lokalne skopiuj plik do katalogu public, ścieżka to /[nazwa_pliku].[rozszerznie]
    //(https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8?token=test)

    // const videoUrl = `http://localhost:5105/api/Stream/${videoId}/master.m3u8`;
    //${state.file.id}/master.m3u8`
    //
    return <>
    <VideoPlayer src={`${API_BASE_URL}/Stream/448cb6b1-6f01-408a-8f98-a49ef327f365/master.m3u8`} 
    fileName={state.file.fileName} 
    ownerName={state.file.ownerName} 
    ownerId={state.file.userId} 
    uploadTimestamp={state.file.uploadTimestamp}
    isShared={state.isShared}/>
     
    {/* <VideoPlayer src="https://pl.streamingvideoprovider.com/mp3-playlist/playlist.m3u8"/>  */}
    </>
};

export default VideoTestPage;