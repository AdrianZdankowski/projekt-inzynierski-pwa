import PWABadge from '../PWABadge';
import Header from './header';
import { Outlet } from 'react-router-dom';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';
import { ThemeProvider } from '@mui/material/styles';
import HeaderTheme from '../themes/layouts/HeaderTheme';

const MainLayout = () => {
  useAxiosInterceptor();

  return (
    <div>
      <ThemeProvider theme={HeaderTheme}>
        <Header />
      </ThemeProvider>
      <PWABadge/>
      <Outlet />
    </div>
  );
};

export default MainLayout;
