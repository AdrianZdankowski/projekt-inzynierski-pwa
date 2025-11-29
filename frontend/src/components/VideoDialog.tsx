import { Dialog, DialogContent, ThemeProvider } from "@mui/material";
import { FileMetadata } from "../types/FileMetadata";
import { API_BASE_URL } from "../api/axiosConfig";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerTheme from "../themes/components/VideoPlayerTheme";

interface VideoDialogProps {
    file: FileMetadata | null;
    isShared: boolean;
    open: boolean;
    onClose: () => void;
}

const VideoDialog = ({file, isShared, open, onClose} : VideoDialogProps) => {

    if (!file) return null;
    return (
        <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        slotProps={{
            paper: {
                sx: {
                    backgroundColor: "#1e272e"
                }
            }
        }}>
            <DialogContent>
                <ThemeProvider theme={VideoPlayerTheme}>
                    <VideoPlayer 
                    src={`${API_BASE_URL}/Stream/${file.id}/master.m3u8`} 
                    fileName={file.name} 
                    ownerName={file.ownerName}
                    uploadTimestamp={file.date}
                    isShared={isShared}/>
                </ThemeProvider>
            </DialogContent>

        </Dialog>
    )
}

export default VideoDialog;