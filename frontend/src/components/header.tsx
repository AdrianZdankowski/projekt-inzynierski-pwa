import { AppBar, Toolbar, Typography, Stack, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const Header = () => {
    const {isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {});
            logout();
            navigate('/login', {replace: true});
        }
        catch(error) {
            console.error(error);
        }
    }

    return (
        <AppBar>
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/"
            >
              Aplikacja PWA
            </Typography>
    
            {/* Prawa strona */}
            <Stack direction="row" spacing={2}>
              <Button 
                component={Link} 
                to="/pdf-file" 
              >
                  Dokument PDF
              </Button>
              <Button 
                component={Link} 
                to="/txt-file" 
              >
                 Plik TXT
              </Button>
              <Button 
                component={Link} 
                to="/video" 
              >
                 Wideo
              </Button>
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/user-file-manager"
                  >
                    Moje pliki
                  </Button>
                  <Button
                    onClick={handleLogout}
                  >
                    Wyloguj
                  </Button>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                >
                  Logowanie
                </Button>
              )}
            </Stack>
          </Toolbar>
        </AppBar>
      );
};

export default Header;