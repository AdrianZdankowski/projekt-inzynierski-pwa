import './header.css';
import { Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return <header className="Header">
        <Link className='clean-link' to="/"><p id="header-p">Aplikacja PWA</p></Link>
        <Stack
        direction="row"
        spacing={2}
        >
            <Link className='clean-link' to="/login">Logowanie</Link>
            <Link className='clean-link' to="/pdf-file">Dokument PDF</Link>
            <Link className='clean-link' to="/txt-file">Plik TXT</Link>
        </Stack>
        
        </header>
}

export default Header;