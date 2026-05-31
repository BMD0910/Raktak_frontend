import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { marketplaceService } from '../services/marketplaceService';
import { Link } from 'react-router-dom';
import FaIcon from '../components/common/FaIcon';

export default function VendorServicesPage() {
  const { data: services, loading, error } = useAsyncData(() => marketplaceService.getMyServices(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const list = services || [];

  return (
    <section className="card p-24">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ marginBottom: 6 }}>Mes services</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Liste complète de vos services, publiés ou non.</p>
        </div>
        <Link className="btn btn-primary" to="/dashboard/vendor/create-service">Créer un service</Link>
      </div>

      {list.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucun service disponible.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {list.map((service) => (
            <article key={service.id} className="card p-20" style={{ borderColor: 'var(--border-light)', position: 'relative' }}>
              {(service.status === 'suspended' || !service.active) && (
                <div style={{ 
                  padding: '8px 12px', 
                  marginBottom: '12px', 
                  backgroundColor: '#fef08a', 
                  borderLeft: '4px solid #dc2626', 
                  fontSize: '0.875rem',
                  color: '#991b1b'
                }}>
                  <FaIcon name="exclamation-triangle" style={{ marginRight: 8 }} /> <strong>{service.status === 'suspended' ? 'Service suspendu par un administrateur' : 'Service désactivé'}</strong>
                  {service.deactivationReason && (
                    <div style={{ marginTop: '4px' }}>Motif: {service.deactivationReason}</div>
                  )}
                  <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                    Contactez le support pour plus d'informations.
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: 8 }}>{service.title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{service.category} · {service.deliveryTime} jours</p>
                  <p style={{ marginBottom: 0 }}>{service.description}</p>
                  {(service.status === 'suspended' || !service.active) && service.deactivationReason && (
                    <p style={{ marginTop: 10, marginBottom: 0, color: '#991b1b', fontSize: '0.9rem' }}>
                      Motif de désactivation : {service.deactivationReason}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{Number(service.price || 0).toLocaleString('fr-FR')} FCFA</div>
                  <div style={{ marginTop: 8, fontSize: '.82rem', fontWeight: 700, color: 
                    service.status === 'suspended' ? '#dc2626' :
                    service.active ? 'var(--brand-teal)' : '#b45309' 
                  }}>
                      {service.status === 'suspended' ? <><FaIcon name="ban" style={{ marginRight: 6 }} /> Suspendu</> : 
                      service.active ? <><FaIcon name="check" style={{ marginRight: 6 }} /> Publié</> : <><FaIcon name="times" style={{ marginRight: 6 }} /> Inactif</>}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link className="btn btn-secondary btn-sm" to={`/dashboard/vendor/services/${service.id}`}>Détail</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
