import './header.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return <header className="Header">
        <Link to="/"><p id="header-p">Aplikacja PWA</p></Link>
        <nav>
           <Link to="/login">Logowanie</Link>
        </nav>
        </header>
}

export default Header;