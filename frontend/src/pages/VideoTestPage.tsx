import { Navigate, useLocation } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { FileMetadata } from "../types/FileMetadata";
import { API_BASE_URL } from "../api/axiosConfig";

interface VideoPageProps {
    file: FileMetadata;
    isShared: boolean;
}

const VideoTestPage = () => {

    const {state} = useLocation() as {state?: VideoPageProps}

    if (!state?.file) return <Navigate to="/user-files" replace/>

    return <>
    <VideoPlayer src={`${API_BASE_URL}/Stream/${state.file.id}/master.m3u8`} 
    fileName={state.file.name} 
    uploadTimestamp={state.file.date}/>
    </>
};

export default VideoTestPage;