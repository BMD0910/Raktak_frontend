import { Link } from 'react-router-dom';
import KpiCard from '../components/common/KpiCard';
import Sparkline from '../components/common/Sparkline';
import { dashboardService } from '../services/dashboardService';
import { adminService } from '../services/adminService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

export default function DashboardAdminPage() {
  const { data, loading, error } = useAsyncData(() => dashboardService.summary(), []);
  const { data: metrics, loading: metricsLoading } = useAsyncData(() => adminService.getMetrics(), []);
  const { data: recentUsersData, loading: usersLoading } = useAsyncData(() => adminService.getUsersPaged({ page: 1, limit: 5, role: 'client' }), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 12px)', paddingBottom: 24 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Dashboard admin</h2>
        <div />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3"><KpiCard icon={<FaIcon name="users" />} value={data.totalUsers} label="Utilisateurs" tone="blue" /></div>
        <div className="col-6 col-md-3"><KpiCard icon={<FaIcon name="building" />} value={data.totalVendors} label="Prestataires" tone="orange" /></div>
        <div className="col-6 col-md-3"><KpiCard icon={<FaIcon name="folder" />} value={data.totalCategories} label="Catégories" tone="teal" /></div>
        <div className="col-6 col-md-3"><KpiCard icon={<FaIcon name="puzzle-piece" />} value={data.totalSubcategories} label="Sous-catégories" tone="amber" /></div>

        <div className="col-12 col-lg-6">
          <div className="card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="text-muted small">Utilisateurs (7 derniers jours)</div>
                <div className="fw-bold">{data.totalUsers}</div>
              </div>
              <div>
                <div style={{ width: 140 }}>
                  <Sparkline data={(metrics?.users || [])} stroke="#0ea5a4" fill="rgba(14,165,164,0.08)" />
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap small text-muted">
              <div>↑ Nouveaux : <strong>{metrics?.newUsersLast7Days ?? '-'}</strong></div>
              <div>·</div>
              <div>Connexion moy. / jour : <strong>{metrics?.avgLoginsPerDay ?? '-'}</strong></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="text-muted small">Prestataires (30 jours)</div>
                <div className="fw-bold">{data.totalVendors}</div>
              </div>
              <div style={{ width: 140 }}>
                <Sparkline data={(metrics?.vendors || [])} stroke="#fb923c" fill="rgba(251,146,60,0.06)" />
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap small text-muted">
              <div>Nouveaux : <strong>{metrics?.newVendorsLast30Days ?? '-'}</strong></div>
              <div>·</div>
              <div>Services actifs : <strong>{metrics?.activeServices ?? '-'}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="card mb-3">
            <div className="card-body">Supervision plateforme, utilisateurs et contenu.</div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2"><FaIcon name="circle-dollar-to-slot" /> <strong>Tarifs abonnements prestataire</strong></div>
              <Link className="btn btn-sm btn-primary" to="/dashboard/admin/plans">Ouvrir la page des plans</Link>
            </div>
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
              <p className="mb-0 text-muted">Gère les abonnements depuis une page dédiée, plus claire et plus simple.</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2"><FaIcon name="users" /> <strong>Utilisateurs récents</strong></div>
              <Link className="btn btn-sm btn-ghost" to="/dashboard/admin/clients">Voir la liste complète</Link>
            </div>
            <div className="card-body">
              {usersLoading ? (
                <div className="text-muted">Chargement...</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {(recentUsersData?.data || []).map((u) => (
                    <div key={u.id} className="d-flex justify-content-between align-items-center">
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaIcon name="user" /></div>
                        <div>
                          <div className="fw-bold">{u.full_name || u.email}</div>
                          <div className="text-muted small">{u.email}</div>
                        </div>
                      </div>
                      <div className="small text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</div>
                    </div>
                  ))}
                  {(!recentUsersData || (recentUsersData?.data || []).length === 0) && <div className="text-muted">Aucun utilisateur récent.</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
