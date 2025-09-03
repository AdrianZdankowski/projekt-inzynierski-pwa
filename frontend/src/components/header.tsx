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
        <AppBar position="static" color="primary" sx={{ backgroundColor: "#06d07c9f" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* Lewa strona */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Aplikacja PWA
            </Typography>
    
            {/* Prawa strona */}
            <Stack direction="row" spacing={2}>
              <Button component={Link} to="/pdf-file" color="inherit" sx={{ "&:hover": { backgroundColor: "#58B19F" } }}>
                Dokument PDF
              </Button>
              <Button component={Link} to="/txt-file" color="inherit" sx={{ "&:hover": { backgroundColor: "#58B19F" } }}>
                Plik TXT
              </Button>
              <Button component={Link} to="/video" color="inherit" sx={{ "&:hover": { backgroundColor: "#58B19F" } }}>
                Wideo
              </Button>
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/user-file-manager"
                    color="inherit"
                    sx={{ "&:hover": { backgroundColor: "#58B19F" } }}
                  >
                    Moje pliki
                  </Button>
                  <Button
                    onClick={handleLogout}
                    color="inherit"
                    sx={{ "&:hover": { backgroundColor: "#58B19F" } }}
                  >
                    Wyloguj
                  </Button>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  sx={{ "&:hover": { backgroundColor: "#58B19F" } }}
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