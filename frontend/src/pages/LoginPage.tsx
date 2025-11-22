import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
} from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

interface LocationState {
  registered?: boolean;
  loggedOutDueToNetworkError?: boolean;
}

const LoginPage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const navigate = useNavigate();
  const { logoutReason } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    if (state?.registered) {
      showNotification(t('login.accountCreated'), 'success');
      navigate('.', { replace: true, state: {} });
    }
  }, [navigate, state?.registered, showNotification, t]);

  useEffect(() => {
    if (logoutReason === "network") {
      showNotification(t('login.connectionLost'), 'error');
    }
  }, [logoutReason, showNotification, t]);

  const handleLoginError = (message: string) => {
    showNotification(message, 'error');
  };

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
      <LanguageSwitcher />
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
        <LoginForm onLoginError={handleLoginError} />
      </Container>
    </Box>
  );
};

export default LoginPage;
