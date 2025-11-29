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
import { useAuthRequests } from '../hooks/useAuthRequests';

const RegisterForm = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');

  const navigate = useNavigate();
  const { registerUser } = useAuthRequests();

  // walidacja nazwy użytkownika
  const validateUsername = (name: string) => {
    // maks. 32 znaki alfanumeryczne (bez spacji, znaków specjalnych)
    const nameRegex = /^[a-zA-Z0-9_.-]{3,32}$/;
    const errorMessage = t('register.usernameError');
    return nameRegex.test(name) ? '' : errorMessage;
  };

  // walidacja hasła
  const validatePassword = (pass: string) => {
    // min. 8 znaków, wielka i mała litera, liczba i znak specjalny
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    const errorMessage = t('register.passwordError');
    return passRegex.test(pass) ? '' : errorMessage;
  };

  const validateRepeatPassword = (pass: string, repeat: string) => {
    const errorMessage = t('register.repeatPasswordError');
    return pass === repeat ? '' : errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const success = await registerUser(username, password);
    if (success) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: '32px',
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
          {t('register.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'left',
          }}
        >
          {t('register.subtitle')}
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
            {t('register.username')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('register.username')}
            autoComplete='off'
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            helperText={usernameError}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ mb: '16px' }}>
          <Typography variant="body2" sx={{ mb: '8px' }}>
            {t('register.password')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('register.password')}
            autoComplete='off'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ mb: '16px' }}>
          <Typography variant="body2" sx={{ mb: '8px' }}>
            {t('register.repeatPassword')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('register.repeatPassword')}
            autoComplete='off'
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            error={!!repeatPasswordError}
            helperText={repeatPasswordError}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              },
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
            alignSelf: 'center',
          }}
        >
          {t('register.submit')}
        </Button>

        <Box
          sx={{
            textAlign: 'center',
            mt: '32px',
          }}
        >
          <RouterLink
            to="/login"
            style={{
              textDecoration: 'none',
            }}
            className="clean-link"
          >
            <Typography variant="body2" component="span">
              {t('register.hasAccount')}
            </Typography>
          </RouterLink>
        </Box>
      </Box>
    </>
  );
};

export default RegisterForm;

