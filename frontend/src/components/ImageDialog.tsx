import { useEffect, useState } from "react";
import { FileMetadata } from "../types/FileMetadata";
import { FileService } from "../services/FileService";
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

interface ImageDialogProps {
    open: boolean;
    onClose: () => void;
    file: FileMetadata | null;
    isShared: boolean;
}

const ImageDialog = ({open, onClose, file, isShared} : ImageDialogProps) => {
    if (!file) return null;

    const [sasLink, setSasLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string>('');

    let uploadDate;
    let uploadTime;

    uploadDate = file.uploadTimestamp.slice(0,10).split("-");
    uploadDate = `${uploadDate[2]}-${uploadDate[1]}-${uploadDate[0]}`;
    uploadTime = file.uploadTimestamp.slice(11,16);

    useEffect(() => {
            const fetchFileLink = async () => {
                try {
                    setLoading(true);
                    const response = await FileService.getUserFile(file.id);
                    setSasLink(response.downloadUrl);
                }
                catch (error: any) {
                    console.error(error);
                    setFetchError('Błąd przy pobieraniu danych pliku. Spróbuj ponownie.')
                }
                finally {
                    setLoading(false);
                }
            };
    
            fetchFileLink();
        }, [file.id]);

    return (
        <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xl" 
        fullWidth
        slotProps={{
            paper: {
                sx: {
                    backgroundColor: "#1e272e",
                    color: "whitesmoke",
                    overflow: 'hidden'
                }
            }
        }}>
            <DialogTitle>{file.fileName} {isShared && `Udostępnione przez ${file.userId}`}</DialogTitle>
            <DialogContent dividers style={{ height: '80vh', overflow: 'hidden' }}>
                {fetchError && (<Alert severity="error" onClose={() => setFetchError('')}>{fetchError}</Alert>)}
                <Box sx={{display: 'flex', gap: 2}}>
                    <Typography>Przesłane: {uploadDate} {uploadTime}</Typography>
                    <Button variant="contained" sx={{borderRadius: "6px"}}>Pobierz</Button>
                </Box>
                {loading ? (
                <Box
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    }}
                >
                    <CircularProgress />
                </Box>
                ) : (
                    <Box
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    }}
                    >
                    <img 
                    src={sasLink}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain"
                    }}/>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageDialog;