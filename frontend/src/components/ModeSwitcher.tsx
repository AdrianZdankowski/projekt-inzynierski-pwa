import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../context/ThemeModeContext';

const ModeSwitcher = () => {
  const { mode, toggleMode } = useThemeMode();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'light' ? t('modeSwitcher.switchToDark') : t('modeSwitcher.switchToLight')}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        sx={{
          width: '40px',
          height: '40px',
          padding: '8px'
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ModeSwitcher;
