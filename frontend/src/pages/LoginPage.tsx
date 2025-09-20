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
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  registered?: boolean;
}


const LoginPage = () => {
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

  const {login} = useAuth();

  useEffect(() => {
        if (state?.registered) {
            navigate('.',{replace: true, state: {} });
        }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
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
      navigate('/', {
        replace: true
      })
    }
    catch (error: any) {
      console.error(error);
      
      // Check if it's a login error (400 status)
      if (error.response?.status === 400) {
        setLoginError('Użytkownik o podanej nazwie oraz wprowadzonym haśle nie istnieje. Spróbuj ponownie.');
      } else {
        setLoginError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
      }
    }
  };

  return (
    <Container>
      <Paper elevation={3}>

        {showAlert && 
            <Alert variant="filled" 
            severity="success" 
            onClose={() => setShowAlert(false)}>
              {'Konto utworzone! Zaloguj się.'}
            </Alert>}

        {loginError && 
            <Alert variant="filled" 
            severity="error" 
            onClose={() => setLoginError('')}>
              {loginError}
            </Alert>}

        <Typography variant="h5" gutterBottom>
          Zaloguj się
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nazwa użytkownika"
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
            label="Hasło"
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
            Zaloguj
          </Button>

          <Box
          sx={{textAlign: 'center', mt: 2, color: 'white'}}
          >
            <Link className='clean-link' to="/register">Nie masz konta? Zarejestruj się!</Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
