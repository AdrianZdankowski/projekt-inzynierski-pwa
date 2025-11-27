import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogTitle, DialogContent, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { FileMetadata } from "../types/FileMetadata";
import { useEffect, useState } from "react";
import { FileService } from "../services/FileService";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

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
            <DialogContent 
                dividers 
                sx={{ 
                    height: '80vh', 
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {fetchError && (
                    <Alert severity="error" onClose={() => setFetchError('')} sx={{ margin: 2 }}>
                        {fetchError}
                    </Alert>
                )}
                <Box sx={{ padding: 2, paddingBottom: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Przesłane: {uploadDate} {uploadTime}
                    </Typography>
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
                    '& #pdf-renderer': {
                        height: '100% !important',
                        width: '100% !important',
                        backgroundColor: 'transparent !important',
                    },
                    '& #pdf-controls': {
                        backgroundColor: 'transparent !important',
                    },
                    '& #pdf-page-wrapper, & .pdf-page-wrapper': {
                        display: 'flex !important',
                        flexDirection: 'column !important',
                        alignItems: 'center !important',
                        backgroundColor: 'transparent !important',
                        padding: '16px !important',
                        margin: '0 auto !important',
                        gap: '16px !important',
                        maxWidth: '100% !important',
                    },
                    '& .react-pdf__Page': {
                        position: 'relative !important',
                        marginBottom: '16px !important',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1) !important',
                    },
                    '& .react-pdf__Page__textContent': {
                        display: 'none !important',
                    },
                    '& .react-pdf__Page__annotations': {
                        display: 'none !important',
                    },
                    '& canvas': {
                        maxWidth: '100% !important',
                        width: 'auto !important',
                        height: 'auto !important',
                        display: 'block !important',
                        margin: '0 auto !important',
                    },
                    '& #react-doc-viewer': {
                        backgroundColor: 'transparent !important',
                    },
                    flex: 1,
                    height: '100%',
                    width: '100%',
                    overflow: "auto",
                    WebkitOverflowScrolling: "touch",
                    backgroundColor: 'transparent',
                    }}>
                    <DocViewer
                    documents={documents}
                    pluginRenderers={DocViewerRenderers}
                    style={{ height: "100%", width: "100%", backgroundColor: "transparent" }}
                    config={{
                        pdfZoom: {
                            defaultZoom: 1.0,
                            zoomJump: 0.2,
                        },
                        pdfVerticalScrollByDefault: true,
                        header: {
                            disableHeader: false,
                            disableFileName: false,
                        },
                        loadingRenderer: {
                            overrideComponent: () => <CircularProgress />,
                        },
                    }}
                    />
                    </Box>
                )
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DocumentDialog;