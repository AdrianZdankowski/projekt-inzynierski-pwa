import { useEffect, useRef } from "react";
import { Container } from "@mui/material";
import Hls from "hls.js";

interface VideoPlayerProps {
    src: string;
}

const VideoPlayer = ({src}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let hls: Hls | null = null;
        
        if (videoRef.current) {
            if (src.endsWith(".m3u8") && Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(videoRef.current);
            } 
            else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
                videoRef.current.src = src;
            }
            else {
                //Plik o formacie innym niż .m3u8
                videoRef.current.src = src;
            }
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };

    },[src]);

    return (
        <Container maxWidth="md" sx={{mt: 4}}>
        <video
            ref={videoRef}
            controls
            style={{width: "100%", maxHeight:"500px"}}
        />
        </Container>
    );
};

export default VideoPlayer;