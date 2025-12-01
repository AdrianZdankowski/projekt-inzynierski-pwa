import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { Close as CloseIcon, CreateNewFolder as CreateNewFolderIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useFileOperations } from '../hooks/useFileOperations';

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  parentFolderId: string | null;
  onFolderCreated?: () => void;
}

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  open,
  onClose,
  parentFolderId,
  onFolderCreated,
}) => {
  const { t } = useTranslation();
  const { createFolder } = useFileOperations();
  const [folderName, setFolderName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  };

  useEffect(() => {
    if (open) {
      setFolderName('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    const trimmedName = folderName.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    const success = await createFolder(trimmedName, parentFolderId);
    setIsSubmitting(false);

    if (success) {
      if (onFolderCreated) {
        onFolderCreated();
      }
      onClose();
    }
  };

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: '16px',
          py: '16px',
        }}
      >
        {t('fileList.createFolder.dialogTitle')}
        <IconButton
          aria-label="close"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            px: '4px',
            pt: '12px',
            pb: '4px',
          }}
        >
          <TextField
            fullWidth
            autoComplete="off"
            label={t('fileList.createFolder.nameLabel')}
            placeholder={t('fileList.createFolder.namePlaceholder')}
            value={folderName}
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CreateNewFolderIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: '16px',
          pb: '16px',
          pt: '8px',
          display: 'flex',
          justifyContent: 'right',
          gap: '8px',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            fontWeight: '600',
            px: '24px',
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!folderName.trim() || isSubmitting}
          sx={{
            borderRadius: '12px',
            fontWeight: '600',
            px: '24px',
          }}
        >
          {t('fileList.createFolder.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderDialog;


