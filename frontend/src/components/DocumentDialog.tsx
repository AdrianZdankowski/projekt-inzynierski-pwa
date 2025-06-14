import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

interface DocumentDialogProps {
    open: boolean; 
    onClose: () => void;
    filePath: string;
    title?: string;
}

const DocumentDialog: React.FC<DocumentDialogProps> = ({ open, onClose, filePath, title = "Podgląd dokumentu" }) => {
    const documents = [{ uri: filePath }];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers style={{ height: '80vh' }}>
                <DocViewer
                    documents={documents}
                    pluginRenderers={DocViewerRenderers}
                    style={{ height: "100%" }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default DocumentDialog;