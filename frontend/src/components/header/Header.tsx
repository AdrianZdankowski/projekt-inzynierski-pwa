import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Stack, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Public as PublicIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { decodeUsername } from '../../utils/decodeUsername';
import SelectLanguageDialog from './SelectLanguageDialog';
import ModeSwitcher from './ModeSwitcher';
import ConnectionStatus from './ConnectionStatus';
import Logo from './Logo';

const Header = () => {
    const {isAuthenticated, logout, accessToken} = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();
    const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
    const isMenuOpen = Boolean(anchorEl);
    
    const username = accessToken ? decodeUsername(accessToken) : undefined;
    const firstLetter = username ? username.charAt(0).toUpperCase() : '?';
    
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {});
            logout();
            handleMenuClose();
            navigate('/login', {replace: true});
        }
        catch(error) {
            console.error(error);
        }
    };

    const handleLanguageDialogOpen = () => {
        setLanguageDialogOpen(true);
    };

    const handleLanguageDialogClose = () => {
        setLanguageDialogOpen(false);
    };

    return (
        <>
          <AppBar sx={{ position: 'static' }}>
            <Toolbar 
              sx={{ 
                justifyContent: 'space-between',
                minHeight: '70px',
                [theme.breakpoints.up('sm')]: {
                    minHeight: '80px',
                  },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Logo />
              </Box>
      
              {isAuthenticated && username ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <ConnectionStatus />
                  
                  <ModeSwitcher />

                  <Tooltip title={t('header.changeLanguage')}>
                    <IconButton
                      onClick={handleLanguageDialogOpen}
                      color="inherit"
                      sx={{
                        width: '40px',
                        height: '40px',
                        padding: '8px'
                      }}
                    >
                      <PublicIcon />
                    </IconButton>
                  </Tooltip>

                  <Stack 
                    direction="row" 
                    spacing={isCompact ? 0 : 1.5} 
                    alignItems="center"
                    sx={{ 
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '8px'
                    }}
                    onClick={handleAvatarClick}
                  >
                    <Avatar 
                      sx={{ 
                        width: '40px', 
                        height: '40px',
                        bgcolor: 'secondary.main'
                      }}
                    >
                      {firstLetter}
                    </Avatar>
                    {!isCompact && (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: '500',
                          fontSize: '1.1rem',
                        }}
                      >
                        {username}
                      </Typography>
                    )}
                  </Stack>

                  <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          minWidth: '160px',
                          width: '160px',
                          mt: '0.5rem',
                          p: '4px',
                          borderRadius: '12px'
                        }
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{
                        minHeight: '45px !important',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '12px',
                        px: '10px',
                        py: '4px',
                        my: '4px',
                        mx: '4px',
                        borderRadius: '12px'
                      }}
                    >
                      <LogoutIcon fontSize="small" />
                      {t('header.logout')}
                    </MenuItem>
                  </Menu>
                </Stack>
              ) : (
                <Box />
              )}
            </Toolbar>
          </AppBar>

          <SelectLanguageDialog 
            open={languageDialogOpen} 
            onClose={handleLanguageDialogClose}
          />
        </>
      );
};

export default Header;