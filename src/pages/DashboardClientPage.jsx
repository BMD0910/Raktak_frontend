import KpiCard from '../components/common/KpiCard';
import FaIcon from '../components/common/FaIcon';
import { dashboardService } from '../services/dashboardService';
import { marketplaceService } from '../services/marketplaceService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export default function DashboardClientPage() {
  const { data: summary, loading: summaryLoading, error: summaryError } = useAsyncData(() => dashboardService.summary(), []);
  const { data: services, loading: servicesLoading, error: servicesError } = useAsyncData(() => marketplaceService.getServices(), []);

  if (summaryLoading || servicesLoading) return <LoadingSpinner />;
  if (summaryError || servicesError) return <ErrorState message={summaryError || servicesError} />;

  return (
    <div>
      <div className="dash-welcome">
        <div className="dash-welcome-emoji"><FaIcon name="hand" /></div>
        <h2>Bonjour !</h2>
        <p>Plateforme active avec <strong style={{ color: 'var(--brand-primary)' }}>{summary.totalVendors}</strong> prestataires.</p>
      </div>
      <div className="kpi-grid">
        <KpiCard icon={<FaIcon name="users" />} value={summary.totalUsers} label="Utilisateurs" tone="orange" />
        <KpiCard icon={<FaIcon name="building" />} value={summary.totalVendors} label="Prestataires" tone="teal" />
        <KpiCard icon={<FaIcon name="folder" />} value={summary.totalCategories} label="Catégories" tone="blue" />
        <KpiCard icon={<FaIcon name="puzzle-piece" />} value={summary.totalSubcategories} label="Sous-catégories" tone="amber" />
      </div>

      <div className="dash-panel">
        <div className="panel-header"><span className="panel-title"><FaIcon name="clipboard" style={{ marginRight: 8 }} /> Activité</span></div>
        <div className="panel-body">Données dashboard synchronisées avec `/api/dashboard/summary`.</div>
      </div>

      <div className="dash-panel">
        <div className="panel-header"><span className="panel-title"><FaIcon name="boxes-stacked" style={{ marginRight: 8 }} /> Services disponibles</span></div>
        {services?.length ? (
          <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
            {services.slice(0, 3).map((service) => (
              <article key={service.id} className="card p-16">
                <h4 style={{ fontWeight: 800, marginBottom: 6 }}>{service.title}</h4>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{service.vendorName}</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>{service.description}</p>
                <strong>{service.price} FCFA</strong>
              </article>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <Link className="btn btn-primary btn-sm" to="/services">Voir tous les services</Link>
            </div>
          </div>
        ) : <div className="panel-body"><EmptyState title="Aucun service" message="Aucun service actif pour le moment." /></div>}
      </div>
    </div>
  );
}
