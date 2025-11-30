import PWABadge from '../PWABadge';
import Header from './Header';
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
