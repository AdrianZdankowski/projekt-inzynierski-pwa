import { useEffect, useRef, useState } from "react";
import { 
    Container, 
    MenuItem, 
    FormControl, 
    Select, 
    Typography,
    Box,
    Alert
} from "@mui/material";
import Hls, { LoaderCallbacks, LoaderConfiguration, LoaderContext } from "hls.js";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

interface VideoPlayerProps {
    src: string;
    fileName: string;
    ownerName: string;
    uploadTimestamp: string;
    isShared: boolean;
}

interface LevelInfo {
    index: number;
    height?: number;
    bitrate: number;
}

const VideoPlayer = ({src, fileName, ownerName, uploadTimestamp, isShared}: VideoPlayerProps) => {

    const autoQuality = -1;

    const {accessToken} = useAuth();
    const { t } = useTranslation();

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [levels, setLevels] = useState<LevelInfo[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(autoQuality);
    const [error, setError] = useState<string>('');

    let uploadDate;
    let uploadTime;

    uploadDate = uploadTimestamp.slice(0,10).split("-");
    uploadDate = `${uploadDate[2]}-${uploadDate[1]}-${uploadDate[0]}`;
    uploadTime = uploadTimestamp.slice(11,16);
    
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
                        context.url = `${context.url}${separator}accessToken=${accessToken}`;
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

            hls.on(Hls.Events.ERROR, (_, data) => {
                console.error("HLS error:", data);
                if (data.fatal) {
                    switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        setError('Błąd sieci. Nie udało się załadować wideo.');
                        hls.startLoad(); 
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        setError('Błąd odtwarzania pliku multimedialnego.');
                        hls.recoverMediaError();
                        break;
                    default:
                        setError('Nieoczekiwany błąd odtwarzania.');
                        hls.destroy();
                        break;
                    }
                }
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
        <Container 
            maxWidth="lg" 
            sx={{
                mt: '16px',
                px: { xs: '0', sm: '16px' },
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {error && (
                <Box sx={{ mb: '8px' }}>
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                </Box>
            )}
            <video
                ref={videoRef}
                controls
                style={{ width: "100%", maxHeight: "60vh", aspectRatio: "16 / 9" }}
            />
            <Box
                sx={{
                    display: "flex", 
                    justifyContent: "space-between", 
                    flexDirection: {xs: "column", sm: "row"},
                    mt: '16px',
                    gap: '16px',
                }}
            >
                <Box sx={{display: "flex", flexDirection: "column"}}>
                    <Typography variant="h6" gutterBottom mt={1}>
                        {fileName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        {t("videoPlayer.uploadedAt", { date: uploadDate, time: uploadTime })}
                    </Typography>
                {isShared && 
                    <Typography variant="subtitle1" gutterBottom>
                        {t("videoPlayer.sharedBy", { owner: ownerName })}
                    </Typography>
                }
                </Box>
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gridTemplateRows: "auto auto",
                    gap: 1,
                    alignItems: "center"
                    }}>
                    <Typography variant="subtitle1" mt={1}>
                        {t("videoPlayer.quality")}
                    </Typography>
                        <FormControl size="small">
                            <Select
                                id="quality-select"
                                value={currentQuality}
                                onChange={(e) => changeQuality(Number(e.target.value))}
                            >
                                <MenuItem value={autoQuality}
                                >{t("videoPlayer.qualityAuto")}</MenuItem>
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