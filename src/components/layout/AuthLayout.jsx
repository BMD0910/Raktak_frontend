import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Outlet />
    </div>
  );
}
