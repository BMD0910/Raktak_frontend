import { useAuth } from '../hooks/useAuth';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { marketplaceService } from '../services/marketplaceService';
import { Link } from 'react-router-dom';
import FaIcon from '../components/common/FaIcon';

export default function DashboardVendorPage() {
  const { profile } = useAuth();
  const { data: services, loading, error } = useAsyncData(() => marketplaceService.getMyServices(), []);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const list = services || [];
  const totalServices = list.length;
  const activeServices = list.filter((service) => service.active).length;
  const inactiveServices = totalServices - activeServices;

  return (
    <div className="container-fluid px-0">
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2 d-flex align-items-center gap-2"><FaIcon name="wallet" /> Abonnement</div>
              <div className="h4 fw-bold mb-1">{profile?.subscriptionPlanName || profile?.subscriptionPlanCode || 'Aucun'}</div>
              <div className="text-secondary small">{profile?.subscriptionActive ? 'Actif' : 'Inactif'}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2 d-flex align-items-center gap-2"><FaIcon name="briefcase" /> Services</div>
              <div className="h4 fw-bold mb-1">{totalServices}</div>
              <div className="text-secondary small">{activeServices} publiés · {inactiveServices} désactivés</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2 d-flex align-items-center gap-2"><FaIcon name="id-card" /> Profil</div>
              <div className="h4 fw-bold mb-1">{profile?.profileCompleted ? 'Complet' : 'À finir'}</div>
              <div className="text-secondary small">{profile?.profession || 'Profession non renseignée'}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2 d-flex align-items-center gap-2"><FaIcon name="star" /> Note</div>
              <div className="h4 fw-bold mb-1">{Number(profile?.rating || 0).toFixed(1)}</div>
              <div className="text-secondary small">{profile?.totalReviews || 0} avis</div>
            </div>
          </div>
        </div>
      </div>

      <section className="card mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">Accès rapides</h2>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/dashboard/vendor/services">Voir mes services</Link>
            <Link className="btn btn-outline-secondary" to="/dashboard/vendor/profile">Modifier mon profil</Link>
            <Link className="btn btn-outline-secondary" to="/dashboard/vendor/subscription">Changer mon abonnement</Link>
            <Link className="btn" to="/dashboard/vendor/create-service" style={{ border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)' }}>Nouveau service</Link>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-body">
          <h2 className="h5 mb-3">Aperçu de vos services</h2>
          {list.length === 0 ? (
            <p className="text-muted mb-0">Aucun service n’a encore été créé.</p>
          ) : (
            <div className="d-grid gap-2">
              {list.slice(0, 3).map((service) => (
                <article key={service.id} className="card">
                  <div className="card-body d-flex justify-content-between gap-3 align-items-start">
                    <div>
                      <h3 className="h6 mb-1">{service.title}</h3>
                      <p className="text-muted mb-0">{service.category} · {service.deliveryTime} jours</p>
                    </div>
                    <span className="badge" style={{ background: service.active ? 'rgba(6,182,212,.15)' : 'rgba(180,83,9,.12)', color: service.active ? 'var(--brand-teal)' : '#b45309' }}>
                      {service.active ? 'Publié' : 'Inactif'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
