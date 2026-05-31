import { useAsyncData } from '../hooks/useAsyncData';
import { subscriptionPlanService } from '../services/subscriptionPlanService';
import FaIcon from '../components/common/FaIcon';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';

function formatFcfa(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function PricingPage() {
  const { data, loading, error } = useAsyncData(() => subscriptionPlanService.getPublicPlans(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={error} /></div>;

  const plans = data || [];

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <h1 className="display-sm" style={{ marginBottom: 12 }}>Tarifs</h1>
        <p className="text-muted" style={{ marginBottom: 24 }}>Abonnements pour les clients qui veulent devenir prestataires.</p>
        {plans.length === 0 ? (
          <EmptyState title="Aucun tarif" message="Aucun plan d'abonnement disponible pour le moment." />
        ) : (
          <div className="row g-4">
            {plans.map((plan, index) => (
              <div key={plan.code} className="col-12 col-md-6 col-xl-4">
                <div className={`card h-100 shadow-sm pricing-card ${index === 1 ? 'featured' : ''}`}>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                      <div>
                        <h3 className="h4 fw-bold mb-1">{plan.name}</h3>
                        {index === 1 ? <span className="badge bg-warning text-dark">Populaire</span> : null}
                      </div>
                      <div className="text-end">
                        <div className="pricing-price">{formatFcfa(plan.priceFcfa)}</div>
                        <small className="text-muted">/ abonnement</small>
                      </div>
                    </div>

                    <p className="text-muted mb-3" style={{ flex: 1 }}>{plan.description}</p>

                    <ul className="pricing-features list-unstyled mb-4">
                      {(plan.features || []).slice(0, 5).map((feature) => (
                        <li key={`${plan.code}-${feature}`}><FaIcon name="circle-check" className="me-2" />{feature}</li>
                      ))}
                    </ul>

                    <Link className="btn btn-primary w-100" to={`/become-vendor?plan=${encodeURIComponent(plan.code)}`}>
                      S'abonner
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
