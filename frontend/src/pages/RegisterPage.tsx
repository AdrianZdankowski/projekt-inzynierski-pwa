import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import axiosInstance from '../api/axiosInstance';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');

  const navigate = useNavigate();

  // walidacja nazwy użytkownika
  const validateUsername = (name: string) => {
    // maks. 32 znaki alfanumeryczne (bez spacji, znaków specjalnych)
    const nameRegex = /^[a-zA-Z0-9_.-]{3,32}$/;
    const errorMessage = "Nazwa użytkownika może mieć maksymalnie 32 znaki alfanumeryczne!"
    return nameRegex.test(name) ? "" : errorMessage;
  }

  // walidacja hasła
  const validatePassword = (pass: string) => {
    // min. 8 znaków, wielka i mała litera, liczba i znak specjalny
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    const errorMessage = "Hasło musi zawierać min. 8 znaków, wielką i małą literę, liczbę oraz znak specjalny!";
    return passRegex.test(pass) ? "" : errorMessage;
  }

  const validateRepeatPassword = (pass: string, rpass: string) => {
    const errorMessage = "Hasła nie są identyczne!";
    return (pass==rpass) ? "" : errorMessage;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3}>
        <Typography variant="h5" gutterBottom>
          Zarejestruj się
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Nazwa użytkownika"
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
            label="Hasło"
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
            label="Powtórz hasło"
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
            Zarejestruj
          </Button>

          <Box
          sx={{textAlign: 'center', mt: 2, color: 'white'}}
          >
            <Link className='clean-link' to="/login">Masz konto? Zaloguj się!</Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
