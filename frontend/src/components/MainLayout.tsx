import PWABadge from '../PWABadge';
import Header from './header';
import { Outlet } from 'react-router-dom';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';

const MainLayout = () => {
  useAxiosInterceptor();

  return (
    <div>
      <Header />
      <PWABadge/>
      <Outlet />
    </div>
  );
};

export default MainLayout;
