import { useEffect, useRef, useState } from "react";
import { Container } from "@mui/material";
import Hls from "hls.js";

interface VideoPlayerProps {
    src: string;
}

interface LevelInfo {
    index: number;
    height?: number;
    bitrate: number;
}

const VideoPlayer = ({src}: VideoPlayerProps) => {

    const autoQuality = -1;

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [levels, setLevels] = useState<LevelInfo[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(autoQuality);

    

    useEffect(() => {
        
        if (!videoRef.current) return;
        
        if (Hls.isSupported() && src.endsWith(".m3u8")) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                const qualityLevels: LevelInfo[] = hls.levels.map((level, idx) => ({
                    index: idx,
                    height: level.height,
                    bitrate: level.bitrate
                }));
                setLevels(qualityLevels);
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
                setCurrentQuality(data.level);
            });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src=src;
        }
        
        return () => {
            hlsRef.current?.destroy();
        };
    },[src]);

    const changeQuality = (qualityIndex: number) => {
        if (!hlsRef.current) return;

        hlsRef.current.currentLevel = qualityIndex;
        setCurrentQuality(qualityIndex);
    };

    return (
        <Container maxWidth="md" sx={{mt: 4}}>
        <video
            ref={videoRef}
            controls
            style={{width: "100%", maxHeight:"500px"}}
        />
        <div style={{marginTop: 10}}>
            <label>Jakość:</label>
            <select
            value={currentQuality}
            onChange={(e) => changeQuality(Number(e.target.value))}
            >
                <option value={autoQuality}>Auto</option>
                {levels.map(lvl => (
                    <option key={lvl.index} value={lvl.index}>
                        {lvl.height
                        ? `${lvl.height}p (${Math.round(lvl.bitrate/1024)} kbps)`
                        : `${Math.round(lvl.bitrate / 1024)} kbps`
                        }
                    </option>
                ))}
            </select>
        </div>
        </Container>
    );
};

export default VideoPlayer;