import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FaIcon from '../common/FaIcon';

export default function VendorDashboardLayout() {
  const { profile } = useAuth();

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          borderRadius: 24,
          padding: 24,
          background: 'linear-gradient(135deg, rgba(14,165,233,0.14), rgba(15,118,110,0.10))',
          border: '1px solid rgba(14,165,233,0.18)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--brand-primary)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: '.78rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}><FaIcon name="screwdriver-wrench" />Espace prestataire</p>
            <h1 style={{ margin: '6px 0 8px', fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Bonjour {profile?.profession || 'prestataire'}</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gérez vos services, votre profil et votre abonnement depuis un espace dédié.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to="/dashboard/vendor/create-service">Créer un service</Link>
            <Link className="btn btn-secondary" to="/dashboard/vendor/subscription">Abonnement</Link>
          </div>
        </div>
      </section>

      <section className="card p-20">
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <NavLink className="btn btn-ghost btn-sm" to="/dashboard/vendor" end><FaIcon name="chart-column" style={{ marginRight: 8 }} />Vue d’ensemble</NavLink>
          <NavLink className="btn btn-ghost btn-sm" to="/dashboard/vendor/orders"><FaIcon name="clipboard-list" style={{ marginRight: 8 }} />Mes demandes</NavLink>
          <NavLink className="btn btn-ghost btn-sm" to="/dashboard/vendor/services"><FaIcon name="screwdriver-wrench" style={{ marginRight: 8 }} />Mes services</NavLink>
          <NavLink className="btn btn-ghost btn-sm" to="/dashboard/vendor/profile"><FaIcon name="file-pen" style={{ marginRight: 8 }} />Mon profil</NavLink>
          <NavLink className="btn btn-ghost btn-sm" to="/dashboard/vendor/subscription"><FaIcon name="credit-card" style={{ marginRight: 8 }} />Mon abonnement</NavLink>
          <NavLink className="btn btn-ghost btn-sm" to="/dashboard/vendor/create-service"><FaIcon name="plus" style={{ marginRight: 8 }} />Créer un service</NavLink>
        </nav>
      </section>

      <Outlet />
    </div>
  );
}
