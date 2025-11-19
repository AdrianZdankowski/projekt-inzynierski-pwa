import { Box, Select, MenuItem, SelectChangeEvent, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PL as FlagPL, GB as FlagGB } from 'country-flag-icons/react/3x2';
import { SupportedLanguage, languageOptions } from '../types/language';
import { isSupportedLanguage } from '../services/LanguageService';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const currentLanguage = isSupportedLanguage(i18n.language) ? i18n.language : 'pl';

  const changeLanguage = (event: SelectChangeEvent<SupportedLanguage>) => {
    const lng = event.target.value as SupportedLanguage;
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const flagComponents = {
    pl: FlagPL,
    en: FlagGB,
  } as const;
  
  const FlagIcon = ({ language, size = 20 }: { language: SupportedLanguage; size?: number }) => {
    const FlagComponent = flagComponents[language];
    return (
      <Box
        component={FlagComponent}
        sx={{
          width: size,
          height: (size * 2) / 3
        }}
      />
    );
  };

  const renderLanguageOption = (language: SupportedLanguage) => {
    const languageOption = languageOptions.find((option) => option.code === language);
    if (!languageOption) {
      return null;
    }

    return (
      <Box display="flex" alignItems="center" gap={isCompact ? 0 : 1.5}>
        <FlagIcon language={language} size={22} />
        {!isCompact && (
          <Typography variant="body2" component="span">
            {t(languageOption.translationKey)}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: '1000'
      }}
    >
      <Select
        value={currentLanguage}
        onChange={changeLanguage}
        renderValue={(value) => renderLanguageOption(value as SupportedLanguage)}
        MenuProps={{
          PaperProps: {
            sx: {
              minWidth: isCompact ? '56px' : '140px',
              width: isCompact ? '64px' : '160px',
              mt: '0.5rem',
              p: isCompact ? '2px' : '4px',
              borderRadius: '12px'
            },
          },
        }}
        sx={{
          width: isCompact ? '72px' : '160px',
          height: '40px',
          '& .MuiSelect-select': {
            padding: '6px 12px !important',
            paddingRight: isCompact ? '32px !important' : '12px !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact ? 'center' : 'flex-start',
            gap: isCompact ? '0px' : '12px'
          },
        }}
        variant="outlined"
      >
        {languageOptions.map(({ code }) => (
          <MenuItem
            key={code}
            value={code}
            sx={{
              minHeight: '40px !important',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact ? 'center' : 'flex-start',
              gap: isCompact ? '0px' : '12px',
              px: '10px',
              py: '4px',
              my: '4px',
              mx: '4px',
              borderRadius: '12px'
            }}
          >
            {renderLanguageOption(code)}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default LanguageSwitcher;

