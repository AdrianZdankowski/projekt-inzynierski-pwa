import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface LoginFormProps {
  onLoginError?: (message: string) => void;
}

const LoginForm = ({
  onLoginError,
}: LoginFormProps) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

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
      showNotification(t('login.loginSuccess'), 'success');
      navigate('/user-files', {
        replace: true
      })
    }
    catch (error: any) {
      console.error(error);
      
      if (onLoginError) {
        if (error.response?.status === 400) {
          onLoginError(t('login.loginError'));
        } else {
          onLoginError(t('login.generalError'));
        }
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: '32px'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textAlign: 'left',
          }}
        >
          {t('login.title')}
        </Typography>
        <Typography 
          variant="body1"
          sx={{
            textAlign: 'left',
          }}
        >
          {t('login.subtitle')}
        </Typography>
      </Box>
      
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ mb: '16px' }}>
          <Typography variant="body2" sx={{ mb: '8px' }}>
            {t('login.username')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('login.usernamePlaceholder')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            helperText={usernameError}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ mb: '16px' }}>
          <Typography variant="body2" sx={{ mb: '8px' }}>
            {t('login.password')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('login.passwordPlaceholder')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: '16px',
            py: '12px',
            px: '80px',
            alignSelf: 'center'
          }}
        >
          {t('login.submit')}
        </Button>

        <Box
          sx={{
            textAlign: 'center',
            mt: '32px'
          }}
        >
          <RouterLink 
            to="/register"
            style={{ 
              textDecoration: 'none',
            }}
            className='clean-link'
          >
            <Typography variant="body2" component="span">
              {t('login.noAccount')} {t('login.registerLink')}
            </Typography>
          </RouterLink>
        </Box>
      </Box>
    </>
  );
};

export default LoginForm;

