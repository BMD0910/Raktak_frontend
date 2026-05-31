import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import FaIcon from '../components/common/FaIcon';
import { adminService } from '../services/adminService';
import KpiCard from '../components/common/KpiCard';
import SimpleLineChart from '../components/common/SimpleLineChart';

export default function AdminMainDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      adminService.getStats(),
      adminService.getMetrics(),
      adminService.getUsersPaged({ page: 1, limit: 5, role: 'client' }),
      adminService.getServices({ page: 1, limit: 5 }),
      adminService.getAuditLogs({ page: 1, limit: 5 })
    ])
      .then(([s, m, users, services, audit]) => {
        if (!mounted) return;
        setStats(s);
        setMetrics(m);
        setRecentUsers(users?.data || []);
        setRecentServices(services?.data || []);
        setRecentLogs(audit?.logs || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.userMessage || err?.message || 'Erreur de chargement du tableau de bord');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const safeStats = stats || {};
  const usersTrend = (metrics?.usersTrend || []).map((d) => Number(d.count || 0));
  const usersDates = (metrics?.usersTrend || []).map((d) => d.date);
  const activeRate = safeStats.totalUsers ? Math.round((Number(safeStats.activeUsers || 0) / Number(safeStats.totalUsers)) * 100) : 0;
  const vendorQuality = safeStats.vendorsCount ? Math.round((Number(safeStats.verifiedVendors || 0) / Number(safeStats.vendorsCount)) * 100) : 0;
  const moderationLoad = Number(safeStats.pendingOrders || 0) + Number(safeStats.suspendedServicesCount || 0) + Number(safeStats.suspendedUsers || 0);

  const platformHighlights = [
    { label: 'Utilisateurs actifs', value: `${activeRate}%`, tone: 'green' },
    { label: 'Prestataires vérifiés', value: `${vendorQuality}%`, tone: 'teal' },
    { label: 'Charge modération', value: moderationLoad, tone: 'orange' }
  ];

  const spotlightStats = [
    {
      icon: 'users',
      label: 'Taux d’activité',
      value: `${activeRate}%`,
      note: 'Utilisateurs actifs sur l’ensemble du parc.',
      tone: 'green',
      progress: activeRate
    },
    {
      icon: 'shield-check',
      label: 'Prestataires validés',
      value: `${vendorQuality}%`,
      note: 'Part des prestataires vérifiés et prêts à servir.',
      tone: 'teal',
      progress: vendorQuality
    },
    {
      icon: 'arrow-trend-up',
      label: 'Nouveaux comptes (7j)',
      value: safeStats.newUsers7Days ?? '—',
      note: 'Progression observée sur les 7 derniers jours.',
      tone: 'orange',
      progress: Math.min(Number(safeStats.newUsers7Days || 0) * 10, 100)
    }
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-hero dash-panel">
        <div className="panel-body admin-dashboard-hero-body">
          <div className="admin-dashboard-hero-copy">
            <span className="admin-dashboard-badge"><FaIcon name="shield-halved" /> Pilotage plateforme</span>
            <h1 className="display-sm" style={{ marginTop: 10, marginBottom: 10 }}>Tableau de bord — Administration</h1>
            <p className="admin-dashboard-lead">Vue d'ensemble complète des utilisateurs, prestataires, services, demandes et modération en temps réel.</p>
            <div className="admin-dashboard-hero-actions">
              <Link className="btn btn-primary btn-sm" to="/dashboard/admin/services">Gérer les services</Link>
              <Link className="btn btn-outline btn-sm" to="/dashboard/admin/vendors">Prestataires</Link>
              <Link className="btn btn-ghost btn-sm" to="/dashboard/admin/audit">Journal d'audit</Link>
            </div>
          </div>
          <div className="admin-dashboard-hero-stats">
            {platformHighlights.map((item) => (
              <div key={item.label} className={`admin-metric-slab is-${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="kpi-grid admin-kpi-grid">
        <KpiCard icon={<FaIcon name="users" />} value={safeStats.totalUsers ?? '—'} label="Utilisateurs" tone="blue" />
        <KpiCard icon={<FaIcon name="check" />} value={safeStats.activeUsers ?? '—'} label="Actifs" tone="green" />
        <KpiCard icon={<FaIcon name="ban" />} value={safeStats.suspendedUsers ?? '—'} label="Suspendus" tone="red" />
        <KpiCard icon={<FaIcon name="building" />} value={safeStats.vendorsCount ?? '—'} label="Prestataires" tone="orange" />
        <KpiCard icon={<FaIcon name="shield-check" />} value={safeStats.verifiedVendors ?? '—'} label="Prest. vérifiés" tone="teal" />
        <KpiCard icon={<FaIcon name="box" />} value={safeStats.servicesCount ?? '—'} label="Services" tone="amber" />
        <KpiCard icon={<FaIcon name="clipboard" />} value={safeStats.totalOrders ?? '—'} label="Demandes totales" tone="purple" />
        <KpiCard icon={<FaIcon name="hourglass-half" />} value={safeStats.pendingOrders ?? '—'} label="En attente" tone="amber" />
        <KpiCard icon={<FaIcon name="check" />} value={safeStats.completedOrders ?? '—'} label="Complétées" tone="green" />
      </div>

      <section className="admin-insight-band">
        {spotlightStats.map((item) => (
          <article key={item.label} className={`admin-insight-card is-${item.tone}`}>
            <div className="admin-insight-head">
              <div className="admin-insight-icon"><FaIcon name={item.icon} /></div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </div>
            <p>{item.note}</p>
            <div className="admin-progress-track" aria-hidden="true">
              <div className="admin-progress-fill" style={{ width: `${item.progress}%` }} />
            </div>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="dash-panel admin-panel-wide">
          <div className="panel-header">
            <span className="panel-title"><FaIcon name="chart-line" style={{ marginRight: 8 }} /> Nouveaux utilisateurs — 14 jours</span>
            <span className="text-muted small">{usersDates[0]} → {usersDates[usersDates.length - 1]}</span>
          </div>
          <div className="panel-body admin-trend-card">
            <div className="admin-trend-chart">
              <SimpleLineChart points={usersTrend} width={540} height={140} stroke="#0ea5e9" />
            </div>
            <div className="admin-trend-note">Nombre de comptes créés par jour sur les deux dernières semaines.</div>
            <div className="admin-mini-grid">
              <div className="admin-mini-card">
                <span>Nouveaux utilisateurs (7j)</span>
                <strong>{safeStats.newUsers7Days ?? '—'}</strong>
              </div>
              <div className="admin-mini-card">
                <span>Services suspendus</span>
                <strong>{safeStats.suspendedServicesCount ?? 0}</strong>
              </div>
              <div className="admin-mini-card">
                <span>Réactivation rapide</span>
                <strong>{Math.max(Number(safeStats.suspendedUsers || 0) - Number(safeStats.pendingOrders || 0), 0)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dash-panel admin-panel-side">
          <div className="panel-header"><span className="panel-title"><FaIcon name="circle-info" style={{ marginRight: 8 }} /> État de la plateforme</span></div>
          <div className="panel-body admin-status-list">
            <div className="admin-status-row"><span>Utilisateurs actifs</span><strong>{activeRate}%</strong></div>
            <div className="admin-status-row"><span>Prestataires vérifiés</span><strong>{vendorQuality}%</strong></div>
            <div className="admin-status-row"><span>Charge de modération</span><strong>{moderationLoad}</strong></div>
            <div className="admin-status-row"><span>Clients</span><strong>{safeStats.clientsCount ?? '—'}</strong></div>
            <div className="admin-status-row"><span>Services actifs</span><strong>{Number(safeStats.servicesCount || 0) - Number(safeStats.suspendedServicesCount || 0)}</strong></div>
          </div>
        </section>

        <section className="dash-panel admin-panel-side">
          <div className="panel-header"><span className="panel-title"><FaIcon name="user-shield" style={{ marginRight: 8 }} /> Actions rapides</span></div>
          <div className="panel-body admin-actions-grid">
            <Link className="btn btn-primary btn-sm" to="/dashboard/admin/vendors">Gérer les prestataires</Link>
            <Link className="btn btn-outline btn-sm" to="/dashboard/admin/clients">Gérer les clients</Link>
            <Link className="btn btn-outline btn-sm" to="/dashboard/admin/requests">Gérer les demandes</Link>
            <Link className="btn btn-outline btn-sm" to="/dashboard/admin/plans">Plans d'abonnement</Link>
            <Link className="btn btn-outline btn-sm" to="/dashboard/admin/audit">Journal d'audit</Link>
            <Link className="btn btn-outline btn-sm" to="/dashboard/admin/settings">Paramètres</Link>
          </div>
        </section>

        <section className="dash-panel admin-panel-side">
          <div className="panel-header"><span className="panel-title"><FaIcon name="users" style={{ marginRight: 8 }} /> Clients récents</span></div>
          <div className="panel-body admin-list-stack">
            {recentUsers.length ? recentUsers.map((user) => (
              <div key={user.id} className="admin-list-row">
                <div className="admin-avatar"><FaIcon name="user" /></div>
                <div className="admin-list-main">
                  <strong>{user.full_name || user.email}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="admin-list-meta">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</div>
              </div>
            )) : <EmptyState title="Aucun client récent" message="Les nouvelles inscriptions apparaîtront ici." />}
          </div>
        </section>

        <section className="dash-panel admin-panel-side">
          <div className="panel-header"><span className="panel-title"><FaIcon name="boxes-stacked" style={{ marginRight: 8 }} /> Services récents</span></div>
          <div className="panel-body admin-list-stack">
            {recentServices.length ? recentServices.map((service) => (
              <div key={service.id} className="admin-list-row">
                <div className="admin-avatar is-primary"><FaIcon name="screwdriver-wrench" /></div>
                <div className="admin-list-main">
                  <strong>{service.title}</strong>
                  <span>{service.vendorName || service.vendor_name || 'Prestataire'}</span>
                </div>
                <div className="admin-list-meta">{service.status || '—'}</div>
              </div>
            )) : <EmptyState title="Aucun service" message="Les derniers services publiés s'afficheront ici." />}
          </div>
        </section>

        <section className="dash-panel admin-panel-wide">
          <div className="panel-header"><span className="panel-title"><FaIcon name="file-lines" style={{ marginRight: 8 }} /> Activité récente</span></div>
          <div className="panel-body admin-list-stack">
            {recentLogs.length ? recentLogs.map((log) => (
              <div key={log.id} className="admin-audit-row">
                <div>
                  <strong>{log.action}</strong>
                  <div className="text-muted small">{log.reason || 'Aucun motif'}</div>
                </div>
                <div className="text-muted small">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</div>
              </div>
            )) : <EmptyState title="Aucune activité" message="L'historique admin apparaitra ici." />}
          </div>
        </section>
      </div>
    </div>
  );
}
