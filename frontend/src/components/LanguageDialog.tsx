import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface LanguageDialogProps {
  open: boolean;
  onClose: () => void;
}

const LanguageDialog: React.FC<LanguageDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  
  return (
    <Dialog
      maxWidth="sm"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialogContent-root .MuiSelect-root': {
          width: '240px',
          height: '50px',
        },
        '& .MuiDialogContent-root .MuiSelect-select': {
          p: '8px 16px !important',
          pr: '12px !important',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: "16px",
        py: "16px"
      }}>
        {t('header.selectLanguage')}
        <IconButton
          aria-label="close"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
            px: "16px", 
            py: "16px", 
            display: 'flex', 
            justifyContent: 'center'
        }}>
          <LanguageSwitcher />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageDialog;

