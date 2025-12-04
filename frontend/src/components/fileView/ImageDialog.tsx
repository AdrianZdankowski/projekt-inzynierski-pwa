import { useEffect, useState } from "react";
import { FileMetadata } from "../../types/FileMetadata";
import { FileService } from "../../services/FileService";
import { Alert, Box, CircularProgress, Dialog, DialogContent, DialogTitle, Typography, IconButton, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

interface ImageDialogProps {
    open: boolean;
    onClose: () => void;
    file: FileMetadata | null;
}

const ImageDialog = ({open, onClose, file} : ImageDialogProps) => {
    if (!file) return null;

    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [sasLink, setSasLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string>('');

    let uploadDate;
    let uploadTime;

    uploadDate = file.date.slice(0,10).split("-");
    uploadDate = `${uploadDate[2]}-${uploadDate[1]}-${uploadDate[0]}`;
    uploadTime = file.date.slice(11,16);

    useEffect(() => {
            const fetchFileLink = async () => {
                try {
                    setLoading(true);
                    const response = await FileService.getUserFile(file.id);
                    setSasLink(response.downloadUrl);
                }
                catch (error: any) {
                    console.error(error);
                    setFetchError(t("imageDialog.fetchError"));
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
        fullWidth>
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
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {fetchError && (
                    <Alert severity="error" onClose={() => setFetchError('')} sx={{ mb: '16px' }}>
                        {fetchError}
                    </Alert>
                )}
                <Box sx={{ mb: '8px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {t("imageDialog.uploadedAt", { date: uploadDate, time: uploadTime })}
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
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: '1',
                        width: "100%",
                        overflow: "hidden",
                    }}
                >
                    <img 
                        src={sasLink}
                        alt={file.name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "800px",
                            height: "800px",
                            objectFit: "contain"
                        }}
                    />
                </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageDialog;