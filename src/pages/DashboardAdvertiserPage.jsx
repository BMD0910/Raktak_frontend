import KpiCard from '../components/common/KpiCard';
import { dashboardService } from '../services/dashboardService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

export default function DashboardAdvertiserPage() {
  const { data, loading, error } = useAsyncData(() => dashboardService.summary(), []);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 18 }}>Dashboard annonceur</h2>
      <div className="kpi-grid">
        <KpiCard icon={<FaIcon name="bullhorn" />} value={data.totalCategories} label="Catégories ciblées" tone="orange" />
        <KpiCard icon={<FaIcon name="eye" />} value={data.totalUsers} label="Audience" tone="blue" />
        <KpiCard icon={<FaIcon name="hand-pointer" />} value={data.totalVendors} label="Partenaires" tone="teal" />
        <KpiCard icon={<FaIcon name="circle-dollar-to-slot" />} value={data.totalSubcategories} label="Segments" tone="amber" />
      </div>
      <div className="dash-panel"><div className="panel-body">Gestion des campagnes et reporting de performance.</div></div>
    </div>
  );
}
