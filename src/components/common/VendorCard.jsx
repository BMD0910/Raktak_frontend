import { Link } from 'react-router-dom';
import { stars } from '../../utils/format';
import FaIcon from './FaIcon';

export default function VendorCard({ vendor }) {
  return (
    <Link to={`/vendors/${vendor.id}`} className="card-vendor-link">
      <div className="card card-vendor">
        {/* Header avec dégradé et badge */}
        <div className="card-vendor-header">
          <div className="card-vendor-banner" />
          {vendor.verified && <span className="badge badge-verified card-vendor-badge"><FaIcon name="check-circle" style={{ marginRight: 4 }} />Vérifié</span>}
        </div>

        {/* Logo/Icône */}
        <div className="card-vendor-logo-container">
          <div className="vendor-icon-circle"><FaIcon name={vendor.icon || 'building'} /></div>
        </div>

        {/* Contenu principal */}
        <div className="card-vendor-body">
          {/* Nom et catégorie */}
          <h3 className="card-vendor-name">{vendor.name}</h3>
          <p className="card-vendor-category">{vendor.category}</p>

          {/* Localisation */}
          <div className="card-vendor-meta">
            <FaIcon name="location-dot" className="icon-meta" />
            <span>{vendor.city}, {vendor.country}</span>
          </div>

          {/* Note et avis */}
          <div className="card-vendor-rating">
            <div className="stars-container">
              <span className="stars">{stars(vendor.rating)}</span>
              <span className="rating-value">{vendor.rating}</span>
            </div>
            <span className="review-count">({vendor.reviews} {vendor.reviews > 1 ? 'avis' : 'avis'})</span>
          </div>

          {/* Tags de services */}
          {vendor.services && vendor.services.length > 0 && (
            <div className="card-vendor-tags">
              {vendor.services.slice(0, 2).map((service) => (
                <span key={service} className="service-tag" title={service}>
                  {service.length > 18 ? service.substring(0, 15) + '...' : service}
                </span>
              ))}
            </div>
          )}

          {/* Pied de carte avec prix et CTA */}
          <div className="card-vendor-footer">
            <div className="card-vendor-price">
              <span className="price-label">À partir de</span>
              <strong className="price-value">{vendor.price}</strong>
            </div>
            <button className="btn btn-primary btn-sm card-vendor-cta">Voir le profil</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
