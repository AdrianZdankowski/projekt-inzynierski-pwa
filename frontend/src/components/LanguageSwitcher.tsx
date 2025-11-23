import * as React from 'react';
import { Select, MenuItem, SelectChangeEvent, Typography, useMediaQuery, useTheme, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PL as FlagPL, GB as FlagGB } from 'country-flag-icons/react/3x2';
import { SupportedLanguage, languageOptions } from '../types/language';
import { isSupportedLanguage } from '../services/LanguageService';

interface LanguageSwitcherProps {
  isCompactModeAvailable?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isCompactModeAvailable = false }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompact = isCompactModeAvailable && isMobile;
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
  
  const FlagIcon = ({ language, size = 22 }: { language: SupportedLanguage; size?: number }) => {
    const FlagComponent = flagComponents[language];
    return (
      <FlagComponent
        style={{
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

    const showText = !isCompact;

    return (
      <Box style={{ display: 'flex', alignItems: 'center', gap: showText ? '12px' : '0px' }}>
        <FlagIcon language={language} size={22} />
        {showText && (
          <Typography variant="body2" component="span">
            {t(languageOption.translationKey)}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Select
      value={currentLanguage}
      onChange={changeLanguage}
      renderValue={(value) => renderLanguageOption(value as SupportedLanguage)}
      MenuProps={{
        PaperProps: {
          sx: {
            minWidth: !isCompact ? '140px' : '56px',
            width: !isCompact ? '160px' : '64px',
            mt: '0.5rem',
            p: !isCompact ? '4px' : '2px',
            borderRadius: '12px'
          },
        },
      }}
      sx={{
        width: !isCompact ? '160px' : '72px',
        height: '40px',
        '& .MuiSelect-select': {
          padding: '6px 12px !important',
          paddingRight: !isCompact ? '12px !important' : '32px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: !isCompact ? 'flex-start' : 'center',
          gap: !isCompact ? '12px' : '0px'
        },
      }}
      variant="outlined"
    >
      {languageOptions.map(({ code }) => (
        <MenuItem
          key={code}
          value={code}
          sx={{
            minHeight: '45px !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: !isCompact ? 'flex-start' : 'center',
            gap: !isCompact ? '12px' : '0px',
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
  );
};

export default LanguageSwitcher;

