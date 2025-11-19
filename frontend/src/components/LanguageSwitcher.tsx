import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        gap: 1,
      }}
    >
      <Button
        variant={currentLanguage === 'pl' ? 'contained' : 'outlined'}
        onClick={() => changeLanguage('pl')}
        size="small"
        sx={{
          minWidth: 'auto',
          px: 2,
          fontWeight: currentLanguage === 'pl' ? 'bold' : 'normal',
        }}
      >
        PL
      </Button>
      <Button
        variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
        onClick={() => changeLanguage('en')}
        size="small"
        sx={{
          minWidth: 'auto',
          px: 2,
          fontWeight: currentLanguage === 'en' ? 'bold' : 'normal',
        }}
      >
        EN
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;

