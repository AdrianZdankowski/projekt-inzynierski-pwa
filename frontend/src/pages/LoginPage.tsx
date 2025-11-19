import { useState, useEffect } from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface LocationState {
  registered?: boolean;
  loggedOutDueToNetworkError?: boolean;
}


const LoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const location = useLocation();
  const state =  location.state as LocationState | null;
  const [showAlert, setShowAlert] = useState<boolean>(
    () => !!state?.registered
  );
 
  const navigate = useNavigate();

  const {login, logoutReason} = useAuth();

  const [showNetworkAlert, setShowNetworkAlert] = useState<boolean>(
    () => logoutReason === "network"
  );

  useEffect(() => {
        if (state?.registered) {
            navigate('.',{replace: true, state: {} });
        }
  }, []);

  // walidacja nazwy użytkownika
  const validateUsername = (name: string) => {
    // maks. 32 znaki alfanumeryczne (bez spacji, znaków specjalnych)
    const nameRegex = /^[a-zA-Z0-9_.-]{3,32}$/;
    const errorMessage = t('login.usernameError');
    return nameRegex.test(name) ? "" : errorMessage;
  }

  // walidacja hasła
  const validatePassword = (pass: string) => {
    // min. 8 znaków, wielka i mała litera, liczba i znak specjalny
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    const errorMessage = t('login.passwordError');
    return passRegex.test(pass) ? "" : errorMessage;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoginError('');
    setUsernameError('');
    setPasswordError('');

    const passwordError = validatePassword(password);
    const nameError = validateUsername(username);

    setPasswordError(passwordError);
    setUsernameError(nameError);

    if (passwordError || nameError) return;

    try {
      const result = await axiosInstance.post('/auth/login', {username, password});
      const accessToken = result.data.accessToken;
      login(accessToken);
      navigate('/user-files', {
        replace: true
      })
    }
    catch (error: any) {
      console.error(error);
      
      if (error.response?.status === 400) {
        setLoginError(t('login.loginError'));
      } else {
        setLoginError(t('login.generalError'));
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: {
          xs: '24px',
          sm: '32px',
        },
        position: 'relative',
      }}
    >
      <LanguageSwitcher />
      <Container
        sx={{
          width: '100%',
          padding: {
            xs: '16px',
            sm: 0,
          },
        }}
      >
        <Paper elevation={3}>

        {showAlert && 
            <Alert variant="filled" 
            severity="success" 
            onClose={() => setShowAlert(false)}>
              {t('login.accountCreated')}
            </Alert>}

        {showNetworkAlert && 
            <Alert variant="filled" 
            severity="error" 
            onClose={() => setShowNetworkAlert(false)}>
              {t('login.connectionLost')}
            </Alert>}

        {loginError && 
            <Alert variant="filled" 
            severity="error" 
            onClose={() => setLoginError('')}>
              {loginError}
            </Alert>}

        <Typography variant="h5" gutterBottom>
          {t('login.title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('login.username')}
            type="text"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            helperText= {usernameError}
            required
          />
          <TextField
            fullWidth
            label={t('login.password')}
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            required
          />
          <Button
            type="submit"
            variant="contained"
          >
            {t('login.submit')}
          </Button>

          <Box
          sx={{textAlign: 'center', mt: 2}}
          >
            <Link className='clean-link' to="/register">{t('login.noAccount')}</Link>
          </Box>
        </Box>
      </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
