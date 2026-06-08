import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FaIcon from '../common/FaIcon';

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar" id="dash-sidebar">
        <div className="sidebar-header"><div className="sidebar-logo">A</div>Admin</div>
        <div className="sidebar-user">
          <div className="sidebar-avatar"><FaIcon name="user" /></div>
          <div><div className="sidebar-user-name">{user?.fullName || 'Admin'}</div><div className="sidebar-user-role">ADMIN</div></div>
        </div>
        <nav className="sidebar-nav">
          <NavLink className="sidebar-link" to="/dashboard/admin" end><FaIcon name="chart-column" style={{ marginRight: 8 }} />Tableau de bord</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/plans"><FaIcon name="credit-card" style={{ marginRight: 8 }} />Plans d'abonnement</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/subscribers"><FaIcon name="users" style={{ marginRight: 8 }} />Abonnés</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/vendors"><FaIcon name="building" style={{ marginRight: 8 }} />Prestataires</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/clients"><FaIcon name="users" style={{ marginRight: 8 }} />Clients</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/services"><FaIcon name="screwdriver-wrench" style={{ marginRight: 8 }} />Services</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/categories"><FaIcon name="layer-group" style={{ marginRight: 8 }} />Catégories</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/requests"><FaIcon name="clipboard-list" style={{ marginRight: 8 }} />Demandes</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/admins"><FaIcon name="user-shield" style={{ marginRight: 8 }} />Administrateurs</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/audit"><FaIcon name="file-lines" style={{ marginRight: 8 }} />Historique</NavLink>
          <NavLink className="sidebar-link" to="/dashboard/admin/settings"><FaIcon name="gear" style={{ marginRight: 8 }} />Paramètres</NavLink>
          <button className="sidebar-link" style={{ textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: 8 }} onClick={logout}><span className="sidebar-icon"><FaIcon name="right-from-bracket" /></span><span>Déconnexion</span></button>
        </nav>
      </aside>
      <main className="dash-main">
        <div className="dash-topbar"><span className="topbar-title">Espace Admin</span></div>
        <div className="dash-content"><Outlet /></div>
      </main>
    </div>
  );
}
