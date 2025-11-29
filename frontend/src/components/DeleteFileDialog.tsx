import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FileMetadata } from "../types/FileMetadata";

interface DeleteFileDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (fileId: string) => void;
    file: FileMetadata | null;
}

const DeleteFileDialog = ({open, onClose, onConfirm, file} : DeleteFileDialogProps) => {
    const { t } = useTranslation();

    if (!file) return null;

    return(
        <Dialog
        open={open}
        onClose={onClose}
        >
            <DialogTitle>
                {t('deleteFileDialog.title', { fileName: file.name })}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('deleteFileDialog.description', { fileName: file.name })}
                </DialogContentText>
                <DialogActions>
                    <Button onClick={onClose}>
                        {t('deleteFileDialog.cancel')}
                    </Button>
                    <Button onClick={() => {
                        onConfirm(file.id)
                        onClose();
                    }}>
                        {t('deleteFileDialog.confirm')}
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteFileDialog;