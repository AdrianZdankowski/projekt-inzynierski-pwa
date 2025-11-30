import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthRequests } from '../../hooks/useAuthRequests';

const LoginForm = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { loginUser } = useAuthRequests();

  const validateUsername = (name: string) => {
    const nameRegex = /^[a-zA-Z0-9_.-]{3,32}$/;
    const errorMessage = t('login.usernameError');
    return nameRegex.test(name) ? "" : errorMessage;
  }

  const validatePassword = (pass: string) => {
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

    const success = await loginUser(username, password);
    if (success) {
      window.location.replace('/user-files');
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
            {t('login.password')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('login.passwordPlaceholder')}
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

