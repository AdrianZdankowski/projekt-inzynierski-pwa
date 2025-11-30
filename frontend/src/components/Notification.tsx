import * as React from 'react';
import { Snackbar, Alert, IconButton, Slide, SlideProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNotification } from '../context/NotificationContext';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

const Notification = () => {
  const { currentNotification, removeNotification } = useNotification();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    if (currentNotification) {
      removeNotification(currentNotification.id);
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      slots={{ transition: SlideTransition }}
      key={currentNotification.id}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.type === 'success' ? 'success' : 'error'}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{ width: '100%' }}
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;

