import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
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
import LanguageSwitcher from '../components/LanguageSwitcher';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const navigate = useNavigate();

  // walidacja nazwy użytkownika
  const validateUsername = (name: string) => {
    // maks. 32 znaki alfanumeryczne (bez spacji, znaków specjalnych)
    const nameRegex = /^[a-zA-Z0-9_.-]{3,32}$/;
    const errorMessage = t('register.usernameError');
    return nameRegex.test(name) ? "" : errorMessage;
  }

  // walidacja hasła
  const validatePassword = (pass: string) => {
    // min. 8 znaków, wielka i mała litera, liczba i znak specjalny
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    const errorMessage = t('register.passwordError');
    return passRegex.test(pass) ? "" : errorMessage;
  }

  const validateRepeatPassword = (pass: string, rpass: string) => {
    const errorMessage = t('register.repeatPasswordError');
    return (pass==rpass) ? "" : errorMessage;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setRegisterError('');
    setPasswordError('');
    setUsernameError('');
    setRepeatPasswordError('');
    
    const passwordError = validatePassword(password);
    const nameError = validateUsername(username);
    const repeatPasswordError = validateRepeatPassword(password, repeatPassword);
    
    setPasswordError(passwordError);
    setUsernameError(nameError);
    setRepeatPasswordError(repeatPasswordError);

    if (passwordError || nameError || repeatPasswordError) return;

    try {
      await axiosInstance.post('/auth/register', {username, password});
      navigate('/login', {
        replace: true,
        state: {
          registered: true
        }
      });
    } catch (error: any) {
      console.error(error);
      
      if (error.response?.status === 400) {
        setRegisterError(t('register.userExistsError'));
      } else {
        setRegisterError(t('register.generalError'));
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
        maxWidth="sm"
        sx={{
          width: '100%',
          padding: {
            xs: '16px',
            sm: 0,
          },
        }}
      >
        <Paper elevation={3}>
        {registerError && 
            <Alert variant="filled" 
            severity="error" 
            onClose={() => setRegisterError('')}>
              {registerError}
            </Alert>}

        <Typography variant="h5" gutterBottom>
          {t('register.title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label={t('register.username')}
            type="text"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            helperText={usernameError}
            required
          />
          <TextField
            fullWidth
            label={t('register.password')}
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            required
          />
          <TextField
            fullWidth
            label={t('register.repeatPassword')}
            type="password"
            margin="normal"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            error={!!repeatPasswordError}
            helperText={repeatPasswordError}
            required
          />
          <Button
            type="submit"
            variant="contained"
          >
            {t('register.submit')}
          </Button>

          <Box
          sx={{textAlign: 'center', mt: 2}}
          >
            <Link className='clean-link' to="/login">{t('register.hasAccount')}</Link>
          </Box>
        </Box>
      </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
