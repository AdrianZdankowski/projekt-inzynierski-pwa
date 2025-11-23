import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogTitle, DialogContent, Box, CircularProgress, Typography, Alert } from '@mui/material';
import { FileMetadata } from "../types/FileMetadata";
import { useEffect, useState } from "react";
import { FileService } from "../services/FileService";

interface DocumentDialogProps {
    open: boolean; 
    onClose: () => void;
    file: FileMetadata | null;
    isShared: boolean;
}

const DocumentDialog = ({open, onClose, file, isShared} : DocumentDialogProps) => {
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

    const documents = sasLink ? [{uri: sasLink}] : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>{file.fileName} {isShared && `Udostępnione przez ${file.userId}`}</DialogTitle>
            <DialogContent dividers style={{ height: '80vh', overflow: 'hidden' }}>
                {fetchError && (<Alert severity="error" onClose={() => setFetchError('')}>{fetchError}</Alert>)}
                <Box>
                    <Typography>Przesłane: {uploadDate} {uploadTime}</Typography>
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
                documents.length > 0 && (
                    <Box
                    sx={{
                    '& #proxy-renderer, & #msdoc-renderer': {
                        height: '100% !important',
                        width: '100% !important',
                    },
                    flex: 1,
                    height: '100%',
                    width: '100%',
                    overflow: "auto",
                    WebkitOverflowScrolling: "touch"
                    }}>
                    <DocViewer
                    documents={documents}
                    pluginRenderers={DocViewerRenderers}
                    style={{ height: "100%"}}
                    />
                    </Box>
                )
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DocumentDialog;