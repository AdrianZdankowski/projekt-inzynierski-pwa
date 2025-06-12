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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logowanie:', { email, password });
    // TODO: Fetch here
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 8 , backgroundColor: "#596275", color: 'white'}}>
        <Typography variant="h5" align="center" gutterBottom>
          Zaloguj się
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Zaloguj
          </Button>

          <Box
          sx={{textAlign: 'center', mt: 2, color: 'white'}}
          >
            <Link to="/register">Nie masz konta? Zarejestruj się!</Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
