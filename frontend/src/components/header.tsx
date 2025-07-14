import './header.css';
import { Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogoutRequest } from '../hooks/useLogoutRequest';

const Header = () => {
    const {isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const {mutateAsync: logoutRequest} = useLogoutRequest();
    

    const handleLogout = async () => {
        try {
            await logoutRequest();
        }
        catch (error) {
            console.error('Logout request failed: ', error);
        }
        finally {
            logout();
            navigate("/", {replace: true});
        }
    }

    return <header className="Header">
        <Link className='clean-link' to="/"><p id="header-p">Aplikacja PWA</p></Link>
        <Stack
        direction="row"
        spacing={2}
        >
            
        {isAuthenticated ? 
            <Link className='clean-link' to="#" onClick={handleLogout}>Wyloguj</Link>
            :
            <Link className='clean-link' to="/login">Logowanie</Link>       
        }
            
            <Link className='clean-link' to="/pdf-file">Dokument PDF</Link>
            <Link className='clean-link' to="/txt-file">Plik TXT</Link>
        </Stack>
        
        </header>
}

export default Header;