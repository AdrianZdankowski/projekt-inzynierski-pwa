import { Container, Box } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
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
        <RegisterForm />
      </Container>
    </Box>
  );
};

export default RegisterPage;
