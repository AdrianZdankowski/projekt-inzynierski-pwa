import './header.css';
import { Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return <header className="Header">
        <Link to="/"><p id="header-p">Aplikacja PWA</p></Link>
        <Stack
        direction="row"
        spacing={2}
        >
            <Link to="/login">Logowanie</Link>
            <Link to="/pdf-file">Dokument PDF</Link>
            <Link to="/txt-file">Plik TXT</Link>
        </Stack>
        
        </header>
}

export default Header;