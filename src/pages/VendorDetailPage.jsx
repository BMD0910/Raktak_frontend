import { useNavigate, useParams } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

export default function VendorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useAsyncData(() => marketplaceService.getVendorById(Number(id)), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const vendor = data?.vendor;
  const services = data?.services || [];
  const vendorName = vendor?.fullName || vendor?.name || 'Prestataire';
  const vendorBio = vendor?.bio || vendor?.description || 'Aucune bio renseignée.';
  const vendorLocation = [vendor?.city, vendor?.country].filter(Boolean).join(', ');
  const verified = vendor?.vendorVerified ?? vendor?.verified;

  const formatDelivery = (value) => {
    if (value === null || value === undefined || value === '') return 'Durée à définir';
    if (typeof value === 'number') return `${value} jour${value > 1 ? 's' : ''}`;
    return String(value);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return 'Sur devis';
    if (typeof value === 'number') return `${value} FCFA`;
    return String(value).includes('FCFA') ? String(value) : `${value} FCFA`;
  };

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="row" style={{ gap: 16 }}>
          <div className="col-md-4">
            <div className="card p-24 card-vendor-profile">
              <div className="profile-avatar-big">
                {vendor?.avatar && typeof vendor.avatar === 'string' && vendor.avatar.startsWith('http') ? (
                  <img src={vendor.avatar} alt={vendorName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <FaIcon name={vendor?.avatar || 'building'} />
                )}
              </div>
              <h2 className="profile-name" style={{ marginTop: 12 }}>{vendorName}</h2>
              <p className="profile-location">{vendor?.email}</p>
              <p className="profile-location" style={{ marginTop: 2 }}>{vendorLocation}</p>
              <p className="profile-rating-row"><FaIcon name="star" style={{ marginRight: 6 }} /> {vendor?.rating ?? '-'} · {vendor?.totalReviews ?? 0} avis</p>
              {verified ? <span className="badge bg-success-subtle text-success-emphasis mt-2">Prestataire vérifié</span> : null}

              {vendor?.phone ? (
                <p className="profile-location" style={{ marginTop: 8 }}><FaIcon name="phone" style={{ marginRight: 6 }} /> {vendor.phone}</p>
              ) : null}

              <h3 className="profile-section-title" style={{ marginTop: 18 }}>Bio</h3>
              <p className="profile-description">{vendorBio}</p>

              {vendor?.email ? (
                <a className="btn btn-primary btn-block" href={`mailto:${vendor.email}`} style={{ marginTop: 12, display: 'inline-block' }}>Contacter</a>
              ) : (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} type="button" disabled>Contacter (bientôt)</button>
              )}
            </div>
          </div>

          <div className="col-md-8">
            <div className="card p-24">
              <h3 className="profile-section-title">Services proposés</h3>
              {services.length === 0 ? <p className="text-muted">Aucun service actif.</p> : (
                <div className="profile-services-list">
                  {services.map((service) => (
                    <button
                      className="service-item"
                      key={service.id}
                      onClick={() => navigate(`/new-request?serviceId=${service.id}&serviceTitle=${encodeURIComponent(service.title)}&vendorName=${encodeURIComponent(vendorName)}&price=${service.price}`)}
                      type="button"
                    >
                      <div className="service-item-content">
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                          <div className="service-thumb" style={{ width: 92, height: 92, borderRadius: 16, overflow: 'hidden', background: 'rgba(13,27,42,0.04)', flex: '0 0 92px' }}>
                            {service.imageUrl ? (
                              <img src={service.imageUrl} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                                <FaIcon name="briefcase" />
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="service-name">{service.title}</div>
                            <div className="service-meta">{service.category || 'Services'} · {formatDelivery(service.deliveryTime)}</div>
                            <p className="service-desc" style={{ marginTop: 6 }}>{service.description}</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                              {service.featured ? <span className="badge bg-warning-subtle text-warning-emphasis">Populaire</span> : null}
                              <span className="badge bg-light text-dark">{service.active ? 'Actif' : service.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="service-price">{formatPrice(service.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
