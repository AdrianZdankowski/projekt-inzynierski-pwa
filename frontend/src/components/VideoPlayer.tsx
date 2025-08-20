import { useEffect, useRef, useState } from "react";
import { 
    Container, 
    MenuItem, 
    FormControl, 
    Select, 
    Typography,
    Box
} from "@mui/material";
import Hls, { LoaderCallbacks, LoaderConfiguration, LoaderContext } from "hls.js";
import { useAuth } from "../context/AuthContext";

interface VideoPlayerProps {
    src: string;
    fileName?: string;
    ownerName?: string;
    onwerId?: string;
    uploadTimestamp?: string;
}

interface LevelInfo {
    index: number;
    height?: number;
    bitrate: number;
}

const VideoPlayer = ({src, fileName, ownerName, onwerId, uploadTimestamp}: VideoPlayerProps) => {

    const autoQuality = -1;

    const {accessToken} = useAuth();

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [levels, setLevels] = useState<LevelInfo[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(autoQuality);

    let uploadDate;
    let uploadTime;

    if (uploadTimestamp?.length == 20) {
        uploadDate = uploadTimestamp.slice(0,10).split("-");
        uploadDate = `${uploadDate[2]}-${uploadDate[1]}-${uploadDate[0]}`;
        uploadTime = uploadTimestamp.slice(11,16);
    }

    useEffect(() => {
        
        if (!videoRef.current) return;
        
        if (Hls.isSupported() && src.endsWith(".m3u8")) {
            const hls = new Hls({
                loader: class CustomLoader extends Hls.DefaultConfig.loader {
                    load(
                        context: LoaderContext,
                        config: LoaderConfiguration,
                        callbacks: LoaderCallbacks<LoaderContext>
                    ) {
                        const separator = context.url.includes("?") ? "&" : "?";
                        context.url = `${context.url}${separator}token=${accessToken}`;
                        super.load(context,config,callbacks);
                    }
                }
            });
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
        <Container maxWidth="md" sx={{mt: 6}}>
        <video
            ref={videoRef}
            controls
            style={{width: "100%", maxHeight:"50%"}}
        />
        <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Box sx={{display: "flex", flexDirection: "column"}}>
                <Typography variant="h6" gutterBottom mt={1}>
                    {fileName}
                </Typography>
               
                <Typography variant="body2" gutterBottom>
                Przesłane: {uploadDate} {uploadTime}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Udostępnione przez: {ownerName}
            </Typography>
            </Box>
            <Box sx={{display: "flex", gap: 2, alignItems: "baseline"}}>
            <Typography variant="subtitle1" mt={1}>
                Jakość wideo: 
            </Typography>
             <FormControl size="small">
                    <Select
                        id="quality-select"
                        
                        value={currentQuality}
                        onChange={(e) => changeQuality(Number(e.target.value))}
                        >
                            <MenuItem value={autoQuality}
                            >Auto</MenuItem>
                            {levels.map(lvl => (
                                <MenuItem value={lvl.index}>
                                {`${lvl.height}p`}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                </Box>
        </Box>
        </Container>
    );
};

export default VideoPlayer;