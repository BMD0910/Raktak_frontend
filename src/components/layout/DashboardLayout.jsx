import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import FaIcon from '../common/FaIcon';

export default function DashboardLayout() {
  const { user, profile, isVendor, vendorVerified, logout, resolveDashboardPath } = useAuth();
  const dashboardPath = resolveDashboardPath(user, { isVendor, vendorVerified });
  const location = useLocation();
  const vendorSidebarRef = useRef({});

  const vendorNavItems = useMemo(() => ([
    { to: '/dashboard/vendor', label: 'Vue d’ensemble', icon: 'chart-column', exact: true },
    { to: '/dashboard/vendor/orders', label: 'Mes demandes', icon: 'clipboard-list' },
    { to: '/dashboard/vendor/services', label: 'Mes services', icon: 'screwdriver-wrench' },
    { to: '/dashboard/vendor/profile', label: 'Mon profil', icon: 'file-pen' },
    { to: '/dashboard/vendor/subscription', label: 'Mon abonnement', icon: 'credit-card' },
    { to: '/dashboard/vendor/create-service', label: 'Créer un service', icon: 'plus' }
  ]), []);

  useEffect(() => {
    if (!isVendor) return;

    const currentItem = vendorNavItems.find((item) => (
      item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ));

    const activeLink = currentItem ? vendorSidebarRef.current[currentItem.to] : null;
    if (activeLink && typeof activeLink.focus === 'function') {
      activeLink.focus({ preventScroll: true });
    }
  }, [isVendor, location.pathname, vendorNavItems]);

  const setVendorSidebarRef = (path) => (element) => {
    if (element) vendorSidebarRef.current[path] = element;
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar" id="dash-sidebar">
        <div className="sidebar-header"><Link to="/" className="sidebar-logo"><div className="sidebar-logo-mark">R</div>Raktak<span>k</span></Link></div>
        <div className="sidebar-user">
          <div className="sidebar-avatar"><FaIcon name="user" /></div>
          <div><div className="sidebar-user-name">{user?.fullName || 'Utilisateur'}</div><div className="sidebar-user-role">{user?.role || 'USER'}</div></div>
        </div>
        <nav className="sidebar-nav">
          {isVendor ? (
            <>
              {vendorNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  ref={setVendorSidebarRef(item.to)}
                  className="sidebar-link"
                  to={item.to}
                  end={item.exact}
                >
                  <span className="sidebar-icon"><FaIcon name={item.icon} /></span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <NavLink className="sidebar-link" to={dashboardPath}><span className="sidebar-icon"><FaIcon name="house" /></span><span>Dashboard</span></NavLink>
              <NavLink className="sidebar-link" to="/services"><span className="sidebar-icon"><FaIcon name="screwdriver-wrench" /></span><span>Services</span></NavLink>
              <NavLink className="sidebar-link" to="/vendors"><span className="sidebar-icon"><FaIcon name="building" /></span><span>Prestataires</span></NavLink>
              {user?.role === 'ADMIN' ? <NavLink className="sidebar-link" to="/dashboard/admin/plans"><span className="sidebar-icon"><FaIcon name="money-bill-wave" /></span><span>Plans prestataire</span></NavLink> : null}
              {!isVendor ? <NavLink className="sidebar-link" to="/become-vendor"><span className="sidebar-icon"><FaIcon name="screwdriver-wrench" /></span><span>Devenir prestataire</span></NavLink> : null}
              <NavLink className="sidebar-link" to="/search"><span className="sidebar-icon"><FaIcon name="magnifying-glass" /></span><span>Recherche</span></NavLink>
              <NavLink className="sidebar-link" to="/profile"><span className="sidebar-icon"><FaIcon name="user" /></span><span>Profil</span></NavLink>
            </>
          )}
          <button className="sidebar-link" style={{ textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={logout}><span className="sidebar-icon"><FaIcon name="right-from-bracket" /></span><span>Déconnexion</span></button>
        </nav>
      </aside>
      <main className="dash-main">
        <div className="dash-topbar"><span className="topbar-title">Espace Dashboard</span></div>
        <div className="dash-content"><Outlet /></div>
      </main>
    </div>
  );
}
