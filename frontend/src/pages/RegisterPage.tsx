import { useState } from 'react';
import {Link} from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { useRegister } from '../hooks/useRegister';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');

  // Żądanie HTTP do rejestracji
  const {mutate: registerRequest} = useRegister();

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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    const nameError = validateUsername(username);
    const repeatPasswordError = validateRepeatPassword(password, repeatPassword);
    
    setPasswordError(passwordError);
    setUsernameError(nameError);
    setRepeatPasswordError(repeatPasswordError);

    if (passwordError || nameError || repeatPasswordError) return;

    registerRequest({username, password},
      {
        onSuccess: (data) => {
          console.log("User registered: ", data);
        },
        onError: (error: any) => {
          console.error("Error during registration:", error.message);
        }
      }
    );
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 8 , backgroundColor: "#596275", color: 'white'}}>
        <Typography variant="h5" align="center" gutterBottom>
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
            sx={{
                // tekst i etykieta
                '& .MuiInputBase-input': {
                color: 'white', 
                },
                '& .MuiInputLabel-root': { 
                color: 'rgba(255, 255, 255, 0.7)' 
                },
                '& .MuiInputLabel-root.Mui-focused': { 
                color: 'white' 
                },
                // obramowanie
                '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                },
                '&:hover fieldset': {
                    borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'white',
                },
                },
            }}
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
            sx={{
                // tekst i etykieta
                '& .MuiInputBase-input': {
                color: 'white', 
                },
                '& .MuiInputLabel-root': { 
                color: 'rgba(255, 255, 255, 0.7)' 
                },
                '& .MuiInputLabel-root.Mui-focused': { 
                color: 'white' 
                },
                // obramowanie
                '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                },
                '&:hover fieldset': {
                    borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'white',
                },
                },
            }}
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
            sx={{
                // tekst i etykieta
                '& .MuiInputBase-input': {
                color: 'white', 
                },
                '& .MuiInputLabel-root': { 
                color: 'rgba(255, 255, 255, 0.7)' 
                },
                '& .MuiInputLabel-root.Mui-focused': { 
                color: 'white' 
                },
                // obramowanie
                '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                },
                '&:hover fieldset': {
                    borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'white',
                },
                },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 , display: 'block', mx: 'auto', backgroundColor: "#06d07c9f", '&:hover': {backgroundColor: "#58B19F"}}}
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
