import { Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { FileMetadata } from "../../types/FileMetadata";
import { API_BASE_URL } from "../../api/axiosConfig";
import VideoPlayer from "./VideoPlayer";
import { useState, useEffect } from "react";

interface VideoDialogProps {
    file: FileMetadata | null;
    open: boolean;
    onClose: () => void;
}

const VideoDialog = ({file, open, onClose} : VideoDialogProps) => {

    if (!file) return null;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [videoKey, setVideoKey] = useState<number>(0);

    useEffect(() => {
        if (open) {
            setVideoKey(prev => prev + 1);
        }
    }, [open, file?.id]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: '16px',
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: '600',
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: { xs: "70%", sm: "80%" },
                        flexShrink: 1,
                    }}
                    title={file.name}
                >
                    {file.name}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    edge="end"
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                sx={{
                    pt: '0px',
                    pb: '16px',
                    px: { xs: '12px', sm: '24px' },
                    height: isMobile ? 'auto' : '80vh',
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    alignItems: isMobile ? "center" : "stretch",
                    justifyContent: isMobile ? "center" : "flex-start",
                    overflowY: isMobile ? "auto" : "hidden",
                }}
            >
                <VideoPlayer
                    key={videoKey}
                    src={`${API_BASE_URL}/Stream/${file.id}/master.m3u8`} 
                    fileName={file.name} 
                    uploadTimestamp={file.date}
                />
            </DialogContent>
        </Dialog>
    )
}

export default VideoDialog;