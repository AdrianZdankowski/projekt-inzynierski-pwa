import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogTitle, DialogContent, Box, CircularProgress, Alert, Typography, IconButton, useMediaQuery } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import { FileMetadata } from "../../types/FileMetadata";
import { useEffect, useState } from "react";
import { FileService } from "../../services/FileService";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface DocumentDialogProps {
    open: boolean; 
    onClose: () => void;
    file: FileMetadata | null;
}

const DocumentDialog = ({open, onClose, file} : DocumentDialogProps) => {
    if (!file) return null;

    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [sasLink, setSasLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string>('');
    const [retryCount, setRetryCount] = useState<number>(0);

    let uploadDate;
    let uploadTime;

    uploadDate = file.date.slice(0,10).split("-");
    uploadDate = `${uploadDate[2]}-${uploadDate[1]}-${uploadDate[0]}`;
    uploadTime = file.date.slice(11,16);

    useEffect(() => {
        const fetchFileLink = async () => {
            try {
                setLoading(true);
                setFetchError('');
                const response = await FileService.getUserFile(file.id);
                setSasLink(response.downloadUrl);
                setRetryCount(0);
            }
            catch (error: any) {
                console.error('Błąd podczas pobierania linku do pliku:', error);
                
                if (error.response?.status === 403 && retryCount < 2) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        fetchFileLink();
                    }, 1000);
                    return;
                }
                
                setFetchError(t("documentDialog.fetchError"));
            }
            finally {
                setLoading(false);
            }
        };

        if (open && file.id) {
            fetchFileLink();
        }
    }, [file.id, open, t]);

    const documents = sasLink ? [{uri: sasLink}] : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
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
                    aria-label={t("common.close")}
                    onClick={onClose}
                    edge="end"
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent 
                dividers 
                sx={{ 
                    height: isMobile ? "60vh" : "80vh", 
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
                <Box sx={{ padding: '16px', paddingBottom: '8px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t("documentDialog.uploadedAt", { date: uploadDate, time: uploadTime })}
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