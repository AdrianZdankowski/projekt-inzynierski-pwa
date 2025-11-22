import { Container, Box } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import RegisterForm from '../components/RegisterForm';
import { useNotification } from '../context/NotificationContext';

const RegisterPage = () => {
  const { showNotification } = useNotification();

  const handleRegisterError = (message: string) => {
    showNotification(message, 'error');
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
          maxWidth: {
            xs: '100%',
            sm: '600px',
          },
          padding: {
            xs: '16px',
            sm: '0px',
          },
        }}
      >
        <RegisterForm onRegisterError={handleRegisterError} />
      </Container>
    </Box>
  );
};

export default RegisterPage;
