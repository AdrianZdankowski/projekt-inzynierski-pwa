import { useEffect } from 'react';
import {
  Container,
  Box,
} from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { logoutReason } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    if (logoutReason === "network") {
      showNotification(t('login.connectionLost'), 'error');
    }
  }, [logoutReason, showNotification, t]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: {
          xs: 3,
          sm: 4
        },
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: '1000'
        }}
      >
        <LanguageSwitcher isCompactModeAvailable />
      </Box>
      <Container
        sx={{
          width: '100%',
          maxWidth: {
            xs: '100%',
            sm: '600px'
          },
          padding: {
            xs:  '16px',
            sm: '0px'
          },
        }}
      >
        <LoginForm />
      </Container>
    </Box>
  );
};

export default LoginPage;
