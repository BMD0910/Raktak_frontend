import { Outlet } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import AppFooter from '../common/AppFooter';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
