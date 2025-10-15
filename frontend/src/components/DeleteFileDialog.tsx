import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { FileMetadata } from "../types/FileMetadata";

interface DeleteFileDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (fileId: string) => void;
    file: FileMetadata | null;
}

const DeleteFileDialog = ({open, onClose, onConfirm, file} : DeleteFileDialogProps) => {

    if (!file) return null;

    return(
        <Dialog
        open={open}
        onClose={onClose}
        >
            <DialogTitle>
                Usunąć plik {file.fileName}?
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Plik {file.fileName} zostanie permanentnie usunięty.
                </DialogContentText>
                <DialogActions>
                    <Button onClick={onClose}>NIE</Button>
                    <Button onClick={() => {
                        onConfirm(file.id)
                        onClose();
                    }}>
                        TAK</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteFileDialog;