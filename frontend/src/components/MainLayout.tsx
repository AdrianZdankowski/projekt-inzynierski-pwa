import PWABadge from '../PWABadge';
import Header from './header';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      <Header />
      <PWABadge/>
      <Outlet />
    </div>
  );
};

export default MainLayout;
