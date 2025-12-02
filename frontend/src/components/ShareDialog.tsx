import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'file' | 'folder';
  onShared?: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  itemId,
  itemType,
  onShared,
}) => {
  const { t } = useTranslation();
  const { shareFile } = useFileOperations();
  const { shareFolder } = useFolderOperations();
  const [username, setUsername] = useState<string>('');
  const [canCreate, setCanCreate] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  useEffect(() => {
    if (open) {
      setUsername('');
      setCanCreate(false);
      setCanDelete(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || isSubmitting) return;

    setIsSubmitting(true);
    
    let success = false;
    if (itemType === 'file') {
      success = await shareFile(itemId, trimmedUsername);
    } else {
      success = await shareFolder(itemId, trimmedUsername, {
        canCreate,
        canDelete,
      });
    }
    
    setIsSubmitting(false);

    if (success) {
      if (onShared) {
        onShared();
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
        {t(`shareDialog.${itemType}.dialogTitle`)}
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
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <TextField
            fullWidth
            autoComplete="off"
            label={t('shareDialog.usernameLabel')}
            placeholder={t('shareDialog.usernamePlaceholder')}
            value={username}
            onChange={handleUsernameChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {itemType === 'folder' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                p: '8px',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={canCreate}
                    onChange={(e) => setCanCreate(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('shareDialog.folder.canCreate')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={canDelete}
                    onChange={(e) => setCanDelete(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('shareDialog.folder.canDelete')}
              />
            </Box>
          )}

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
          disabled={!username.trim() || isSubmitting}
          sx={{
            borderRadius: '12px',
            fontWeight: '600',
            px: '24px',
          }}
        >
          {t('shareDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;

