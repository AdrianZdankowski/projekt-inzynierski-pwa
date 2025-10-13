import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogTitle, DialogContent, Box, CircularProgress } from '@mui/material';
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
    // const documents = [{ uri: filePath }];

    if (!file) return null;

    const [sasLink, setSasLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchFileLink = async () => {
            try {
                setLoading(true);
                const response = await FileService.getUserFile(file.id);
                setSasLink(response.downloadUrl);
            }
            catch (error: any) {
                console.error(error);
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
            <DialogTitle>{file.fileName} {isShared && "(Udostępnione)"}</DialogTitle>
            <DialogContent dividers style={{ height: '80vh' }}>
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
                    <DocViewer
                    documents={documents}
                    pluginRenderers={DocViewerRenderers}
                    style={{ height: "100%"}}
                    />
                )
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DocumentDialog;