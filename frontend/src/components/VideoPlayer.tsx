import { useEffect, useRef, useState } from "react";
import { 
    Container, 
    InputLabel, 
    MenuItem, 
    FormControl, 
    Select 
} from "@mui/material";
import Hls, { LoaderCallbacks, LoaderConfiguration, LoaderContext } from "hls.js";

interface VideoPlayerProps {
    src: string;
    token?: string;
}

interface LevelInfo {
    index: number;
    height?: number;
    bitrate: number;
}

// class CustomLoader extends Hls.DefaultConfig.loader {
//     load(context: any, config: any, callbacks: any) {
//         const separator = context.url.includes("?") ? "&" : "?";
//         context.url = context.url + separator + "token=test";
//         super.load(context, config, callbacks);
//     }
// }

const VideoPlayer = ({src, token = "test"}: VideoPlayerProps) => {

    const autoQuality = -1;

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [levels, setLevels] = useState<LevelInfo[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(autoQuality);

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
                        context.url = `${context.url}${separator}token=${token}`;
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
        <Container maxWidth="md" sx={{mt: 4}}>
        <video
            ref={videoRef}
            controls
            style={{width: "100%", maxHeight:"500px"}}
        />
        <FormControl>
            <InputLabel id="quality-select-label">Jakość wideo</InputLabel>
            <Select
                id="quality-select"
                variant="filled"
                labelId="quality-select-label"
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
        </Container>
    );
};

export default VideoPlayer;