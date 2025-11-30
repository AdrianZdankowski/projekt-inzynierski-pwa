import { Typography } from '@mui/material';

const Logo = () => {
  return (
    <Typography
      variant="h3"
      component="div"
      sx={{
        fontWeight: 700,
        fontStyle: 'italic',
        letterSpacing: '0.5px',
        background: 'linear-gradient(90deg, #4caf50 0%, #81c784 50%, #a5d6a7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        userSelect: 'none',
        display: 'inline-block',
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))',
      }}
    >
      Storigo
    </Typography>
  );
};

export default Logo;
