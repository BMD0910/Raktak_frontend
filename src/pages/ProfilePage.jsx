import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { stars } from '../utils/format';
import { useAsyncData } from '../hooks/useAsyncData';
import { marketplaceService } from '../services/marketplaceService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const vendorId = Number(searchParams.get('id') || 1);
  const [activeTab, setActiveTab] = useState('about');
  const { data, loading, error } = useAsyncData(() => marketplaceService.getVendorById(vendorId), [vendorId]);
  const { data: vendorReviews, loading: reviewsLoading, error: reviewsError } = useAsyncData(() => productService.reviews(vendorId), [vendorId]);

  const vendor = data?.vendor;
  const services = data?.services || [];

  if (loading || reviewsLoading) return <LoadingSpinner />;
  if (error || reviewsError) return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={error || reviewsError} /></div>;

  if (!vendor) {
    return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><EmptyState title="Profil introuvable" message="Ce prestataire n'existe pas." /></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-hero"></div>
      <div className="container">
        <div className="profile-breadcrumb">
          <Link to="/">Accueil</Link> › <Link to="/search">Prestataires</Link> › <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{vendor.fullName}</span>
        </div>

        <div className="profile-main">
          <div>
            <div className="profile-card-header">
              <div className="profile-avatar-big">
                {vendor.avatar && typeof vendor.avatar === 'string' && vendor.avatar.startsWith('http') ? (
                  <img src={vendor.avatar} alt={vendor.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <FaIcon name={vendor.avatar || vendor.emoji || 'building'} />
                )}
              </div>
              <div className="profile-header-body">
                <h1 className="profile-name">{vendor.fullName}</h1>
                <div className="profile-location"><FaIcon name="location-dot" style={{ marginRight: 8 }} /> {[vendor.city, vendor.country].filter(Boolean).join(', ') || 'Localisation non renseignée'}</div>
                <div className="profile-rating-row"><span className="stars">{stars(vendor.rating)}</span> <strong>{vendor.rating}</strong> <span className="review-count">({vendor.totalReviews} avis)</span></div>
                <div className="profile-tags">
                  {services.slice(0, 4).map((service) => (
                    <Link
                      className="tag"
                      key={service.id}
                      to={`/new-request?serviceId=${service.id}&serviceTitle=${encodeURIComponent(service.title)}&vendorName=${encodeURIComponent(vendor.fullName)}&price=${encodeURIComponent(service.price || 'Sur devis')}`}
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-tabs">
              <button className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>À propos</button>
              <button className={`profile-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
              <button className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Avis</button>
            </div>

            {activeTab === 'about' ? (
              <div className="card p-32 profile-content-card">
                <h2 className="profile-section-title">Présentation</h2>
                <p className="profile-description">{vendor.bio || vendor.description || 'Aucune présentation disponible.'}</p>
              </div>
            ) : null}

            {activeTab === 'services' ? (
              <div className="profile-services-list">
                {services.map((service) => (
                  <Link
                    className="service-card"
                    key={service.id}
                    to={`/new-request?serviceId=${service.id}&serviceTitle=${encodeURIComponent(service.title)}&vendorName=${encodeURIComponent(vendor.fullName)}&price=${encodeURIComponent(service.price || 'Sur devis')}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div>
                      <div className="service-name">{service.title}</div>
                      <div className="service-meta">{service.category || 'Services'} · {service.deliveryTime ? `${service.deliveryTime} jour${service.deliveryTime > 1 ? 's' : ''}` : 'Durée à définir'}</div>
                      <p className="service-desc" style={{ marginTop: 6 }}>{service.description}</p>
                    </div>
                    <div className="service-price">{typeof service.price === 'number' ? `${service.price} FCFA` : (service.price || 'Sur devis')}</div>
                  </Link>
                ))}
              </div>
            ) : null}

            {activeTab === 'reviews' ? (
              <div className="card p-32 profile-content-card">
                <h2 className="profile-section-title">Avis clients</h2>
                <div className="review-grid">
                  {vendorReviews.map((review) => (
                    <div className="review-item" key={review.id}>
                      <div className="review-header"><strong>{review.client}</strong><span>{review.date}</span></div>
                      <div className="review-stars">{stars(review.rating)}</div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="contact-sidebar">
            <div className="cta-box featured">
              <h3>Contactez ce prestataire</h3>
              <p>Réponse moyenne en moins de 2 heures.</p>
              <div className="cta-price">à partir de {services[0]?.price || vendor.price || 'Sur devis'}</div>
              <Link to="/login" className="btn btn-primary w-full"><FaIcon name="comment" style={{ marginRight: 8 }} /> Envoyer un message</Link>
            </div>

            <div className="card p-24 profile-info-card">
              <div className="profile-info-row"><span>Ville</span><strong>{vendor.city}</strong></div>
              <div className="profile-info-row"><span>Pays</span><strong>{vendor.country}</strong></div>
              <div className="profile-info-row"><span>Note</span><strong>{vendor.rating} / 5</strong></div>
              <div className="profile-info-row"><span>Avis</span><strong>{vendor.totalReviews}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
