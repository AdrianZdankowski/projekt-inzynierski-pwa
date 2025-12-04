import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { FileMetadata } from "../../types/FileMetadata";

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
        maxWidth="xs"
        fullWidth
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: 2,
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
                    title={t('deleteFileDialog.title', { fileName: file.name })}
                >
                    {t('deleteFileDialog.title', { fileName: file.name })}
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