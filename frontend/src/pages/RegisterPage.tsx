import { Container, Box } from '@mui/material';
import LanguageSwitcher from '../components/LanguageSwitcher';
import RegisterForm from '../components/form/RegisterForm';
import Logo from '../components/Logo';

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
      <Box
        sx={{
          position: 'absolute',
          top: {
            xs: '20px',
            sm: '16px'
          },
          left: '16px',
          zIndex: '1000',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Logo />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: '1000'
        }}
      >
        <LanguageSwitcher isCompactModeAvailable />
      </Box>
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
