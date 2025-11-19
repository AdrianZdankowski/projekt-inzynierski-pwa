import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
} from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  registered?: boolean;
  loggedOutDueToNetworkError?: boolean;
}

const LoginPage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [showAlert, setShowAlert] = useState<boolean>(
    () => !!state?.registered
  );

  const navigate = useNavigate();
  const { logoutReason } = useAuth();

  const [showNetworkAlert, setShowNetworkAlert] = useState<boolean>(
    () => logoutReason === "network"
  );

  useEffect(() => {
    if (state?.registered) {
      navigate('.', { replace: true, state: {} });
    }
  }, [navigate, state?.registered]);

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
        <LoginForm
          showRegistrationAlert={showAlert}
          showNetworkAlert={showNetworkAlert}
          onCloseRegistrationAlert={() => setShowAlert(false)}
          onCloseNetworkAlert={() => setShowNetworkAlert(false)}
        />
      </Container>
    </Box>
  );
};

export default LoginPage;
