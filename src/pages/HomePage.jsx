import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SearchBar from '../components/common/SearchBar';
import SectionHeader from '../components/common/SectionHeader';
import VendorCard from '../components/common/VendorCard';
import FaIcon from '../components/common/FaIcon';
import { formatNumber } from '../utils/format';
import { useAsyncData } from '../hooks/useAsyncData';
import { productService } from '../services/productService';
import { marketplaceService } from '../services/marketplaceService';
import { subscriptionPlanService } from '../services/subscriptionPlanService';
import { publicService } from '../services/publicService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import WorldMapDots from '../components/common/WorldMapDots';

function formatFcfa(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isVendor, vendorVerified, getUserType, loading: authLoading } = useAuth();
  const userType = getUserType(user, { isVendor, vendorVerified });
  const isClientConnected = Boolean(user && userType === 'CLIENT');
  
  const [settings, setSettings] = useState({
    siteName: 'Raktakk',
    supportEmail: 'contact@raktakk.com',
    supportPhone: '+221 77 123 45 67'
  });

  useEffect(() => {
    publicService.getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const { data, loading, error } = useAsyncData(
    async () => {
      const [categories, cities, vendors, services, plans] = await Promise.all([
        productService.categories(),
        productService.cities(),
        productService.vendors(),
        marketplaceService.getServices(),
        subscriptionPlanService.getPublicPlans()
      ]);
      return { categories, cities, vendors, services, plans };
    },
    []
  );

  const goToRequest = (service) => {
    const qs = new URLSearchParams({
      serviceId: String(service.id),
      serviceTitle: service.title || '',
      vendorName: service.vendorName || '',
      price: service.price || ''
    }).toString();
    const target = `/new-request?${qs}`;
    if (isClientConnected) {
      navigate(target);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={error} /></div>;

  const categories = data?.categories || [];
  const cities = data?.cities || [];
  const topVendors = (data?.vendors || []).slice(0, 3);
  const plans = data?.plans || [];

  return (
    <>
      <section className="hero py-5 text-white" aria-label="Bannière principale">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <div className="mb-3"><span className="badge bg-light text-dark"><FaIcon name="globe" className="me-2" style={{ color: 'var(--brand-primary)' }} /> La plateforme business #1 en Afrique de l'Ouest</span></div>
              <h1 className="display-4 fw-bold">Trouvez le bon <em>prestataire</em><br />proche de vous, maintenant</h1>
              <p className="lead">Raktakk connecte clients et professionnels vérifiés en Afrique de l'Ouest.</p>
              <div className="mt-4">
                <SearchBar onSearch={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)} />
              </div>
              <div className="d-flex gap-4 mt-4">
                <div>
                  <div className="h4 mb-0">{formatNumber(48234)}</div>
                  <small className="text-white-50">Utilisateurs actifs</small>
                </div>
                <div>
                  <div className="h4 mb-0">{formatNumber(3420)}</div>
                  <small className="text-white-50">Prestataires vérifiés</small>
                </div>
                <div>
                  <div className="h4 mb-0">4.7★</div>
                  <small className="text-white-50">Note moyenne</small>
                </div>
              </div>
            </div>
            <div className="col-md-5 d-none d-md-block">
              <div
                className="rounded shadow-sm"
                style={{
                  height: 'clamp(260px, 28vw, 420px)',
                  width: '100%',
                  backgroundImage: 'url(/assets/images/carte1.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <SectionHeader icon="screwdriver-wrench" label="Découvrir" title="Services populaires" />
          {((data?.services || []).length === 0) ? (
            <EmptyState title="Aucun service" message="Aucun service disponible pour le moment." />
          ) : (
            <>
              <div className="row g-3 mt-3">
                {(data?.services || []).slice(0,6).map((service) => (
                  <div key={service.id} className="col-12 col-sm-6 col-md-4">
                    <button type="button" className="card h-100 btn-unstyled" onClick={() => goToRequest(service)}>
                      <div className="card-body">
                        <h6 className="fw-bold mb-1">{service.title}</h6>
                        <p className="text-muted small mb-2">{service.vendorName}</p>
                        <p className="text-secondary small mb-2">{service.description}</p>
                        <strong>{service.price} FCFA</strong>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <button className="btn btn-primary btn-sm" type="button" onClick={() => navigate('/services')}>Voir plus</button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <SectionHeader centered icon="layer-group" label="Explorer" title="Catégories populaires" subtitle="Trouvez rapidement le bon secteur." />
          <div className="row g-3 mt-3">
            {categories.map((category) => (
              <div key={category.id} className="col-6 col-sm-4 col-md-3">
                <button className="card h-100 p-3 text-start w-100 btn-unstyled" onClick={() => navigate(`/search?cat=${encodeURIComponent(category.name)}`)}>
                  <div className="d-flex align-items-center gap-3">
                      <FaIcon name={category.icon || 'folder'} className="fs-4" style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <div className="fw-bold">{category.name}</div>
                      <small className="text-muted">{category.count} prestataires</small>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="promo-hero py-5 text-white" aria-label="Devenir prestataire">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <span className="badge bg-white text-dark mb-2" style={{ fontWeight: 700 }}>Recrutement</span>
              <h2 className="display-5 fw-bold">Inscrivez votre entreprise</h2>
              <p className="lead">Rejoignez notre réseau de prestataires et augmentez votre visibilité auprès de milliers de clients en quelques clics. Nos plans incluent promotion dédiée, gestion des demandes et outils de paiement intégrés.</p>

              <div className="d-flex gap-3 align-items-center mt-4 promo-cta-group">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/become-vendor')}>Devenir prestataire</button>
                <button className="btn btn-outline-light btn-lg" onClick={() => navigate('/pricing')}>Voir nos plans</button>
              </div>

              <ul className="list-unstyled d-flex gap-3 mt-4 promo-features">
                <li className="text-white-50"><strong>Visibilité accrue</strong><br /><small className="text-white-50">Mettez en avant vos services</small></li>
                <li className="text-white-50"><strong>Outils pro</strong><br /><small className="text-white-50">Gestion des demandes et paiements</small></li>
                <li className="text-white-50"><strong>Support</strong><br /><small className="text-white-50">Accompagnement dédié</small></li>
              </ul>

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="h5 fw-bold text-white mb-3">Choisissez votre plan</h3>
                {plans.length === 0 ? (
                  <EmptyState title="Aucun tarif" message="Aucun abonnement n'est disponible pour le moment." />
                ) : (
                  <div className="row g-3">
                    {plans.map((plan, index) => (
                      <div key={plan.code} className="col-12 col-md-6 col-lg-4">
                        <div className={`card h-100 shadow-sm pricing-card ${index === 1 ? 'featured' : ''}`}>
                          <div className="card-body d-flex flex-column">
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                              <div>
                                <h4 className="h6 fw-bold mb-1">{plan.name}</h4>
                                {index === 1 ? <span className="badge bg-warning text-dark">Populaire</span> : null}
                              </div>
                              <div className="text-end">
                                <div className="pricing-price">{formatFcfa(plan.priceFcfa)}</div>
                                <small className="text-muted">/ abonnement</small>
                              </div>
                            </div>

                            <p className="text-muted small mb-2" style={{ flex: 1 }}>{plan.description}</p>

                            <ul className="pricing-features list-unstyled mb-3">
                              {(plan.features || []).slice(0, 3).map((feature) => (
                                <li key={`${plan.code}-${feature}`}><FaIcon name="circle-check" className="me-2" /><small>{feature}</small></li>
                              ))}
                            </ul>

                            <button className="btn btn-primary btn-sm w-100" onClick={() => navigate('/become-vendor')}>Choisir ce plan</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-5 d-none d-md-flex justify-content-center">
              <div
                className="promo-illustration image-illustration"
                aria-hidden="true"
                style={{
                  width: '100%',
                  maxWidth: 520,
                  height: 'min(360px, 40vw)',
                  borderRadius: 12,
                  backgroundImage: 'url(/assets/images/entreprise.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: '0 18px 40px rgba(13,27,42,0.18)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: 'linear-gradient(135deg, rgba(255,90,31,0.08) 0%, rgba(37,99,235,0.06) 50%, rgba(0,201,167,0.06) 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Éléments de fond décoratifs */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,90,31,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-100px',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <SectionHeader centered icon="handshake" label="Notre plateforme" title="Comment ça fonctionne" subtitle="Raktakk crée la liaison entre prestataires réputés et clients en quête de services." />
          
          <div className="row g-4 mt-5">
            {/* Étape 1: Clients */}
            <div className="col-md-4">
              <div className="text-center">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm" style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #FF5A1F 0%, #FF8A4A 100%)' }}>
                  <FaIcon name="magnifying-glass" className="text-white" style={{ fontSize: '2rem' }} />
                </div>
                <h3 className="h5 fw-bold mb-3" style={{ color: '#1a1a1a' }}>Clients découvrent</h3>
                <p className="text-muted">Parcourez nos milliers de services, filtrez par catégorie, localisation et budget pour trouver le prestataire idéal.</p>
                <div className="mt-3">
                  <button className="btn fw-semibold" style={{ background: 'linear-gradient(135deg, #FF5A1F 0%, #FF8A4A 100%)', color: 'white', border: 'none' }} onClick={() => navigate('/search')}>Découvrir services</button>
                </div>
              </div>
            </div>

            {/* Flèche */}
            <div className="col-md-4 d-flex align-items-center justify-content-center position-relative">
              <div style={{
                fontSize: '3rem',
                background: 'linear-gradient(135deg, #FF5A1F 0%, #2563EB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.8
              }}>
                <FaIcon name="arrow-right" className="d-none d-md-inline" />
                <FaIcon name="arrow-down" className="d-md-none" />
              </div>
            </div>

            {/* Étape 2: Prestataires */}
            <div className="col-md-4">
              <div className="text-center">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm" style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)' }}>
                  <FaIcon name="briefcase" className="text-white" style={{ fontSize: '2rem' }} />
                </div>
                <h3 className="h5 fw-bold mb-3" style={{ color: '#1a1a1a' }}>Prestataires prospèrent</h3>
                <p className="text-muted">Accédez à une base cliente vérifiée, gérez vos demandes centralisées et développez votre activité en confiance.</p>
                <div className="mt-3">
                  <button className="btn fw-semibold" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)', color: 'white', border: 'none' }} onClick={() => navigate('/become-vendor')}>Rejoindre Raktakk</button>
                </div>
              </div>
            </div>
          </div>

          {/* Flux détaillé en bas */}
          <div className="row g-3 mt-5 pt-4" style={{ borderTop: '2px solid rgba(255,90,31,0.2)' }}>
            <div className="col-md-3">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #FF5A1F 0%, #FF8A4A 100%)' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>1</span>
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: '#FF5A1F' }}>Recherchez</h6>
                  <small className="text-muted">Trouvez le service exact dont vous avez besoin</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>2</span>
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: '#2563EB' }}>Comparez</h6>
                  <small className="text-muted">Consultez les avis et tarifs des prestataires</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #00C9A7 0%, #06B6D4 100%)' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>3</span>
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: '#00C9A7' }}>Commandez</h6>
                  <small className="text-muted">Passez votre demande en quelques clics</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>4</span>
                  </div>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: '#8B5CF6' }}>Payez sécurisé</h6>
                  <small className="text-muted">Transactions protégées via notre plateforme</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <SectionHeader icon="star" label="Sélection premium" title="Top prestataires" />
          {topVendors.length === 0 ? <EmptyState title="Aucun prestataire" message="Les prestataires apparaîtront ici dès publication." /> : (
            <div className="row g-3 mt-3">
              {topVendors.map((vendor) => (
                <div key={vendor.id} className="col-12 col-md-6 col-lg-4">
                  <VendorCard vendor={vendor} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 d-flex justify-content-center">
            <button className="btn btn-primary btn-sm" type="button" onClick={() => navigate('/vendors')}>
              Voir plus
            </button>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <SectionHeader centered icon="location-dot" label="Couverture" title="Top villes actives" />
          <div className="row g-4 mt-3 align-items-start">
            <div className="col-12 col-lg-8">
              {/* World map with animated points (requires cities with lat/lng) */}
              <div className="card p-3 h-100 shadow-sm">
                <div className="card-body">
                  <WorldMapDots cities={cities} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold">Villes actives</h6>
                  <div className="list-group list-group-flush mt-3">
                    {(cities || []).slice(0, 8).map((city) => (
                      <button key={city.name} type="button" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}>
                        <div>
                          <div className="fw-semibold">{city.name}</div>
                          <small className="text-muted">{city.country || ''}</small>
                        </div>
                        <small className="text-muted">{formatNumber(city.vendors || 0)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(0,201,167,0.06) 100%)' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="mb-4">
                <span className="badge bg-primary" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>Contactez-nous</span>
              </div>
              <h2 className="h3 fw-bold mb-3">Besoin d'aide ou de plus d'informations ?</h2>
              <p className="lead text-muted mb-4">Notre équipe Raktakk est disponible pour répondre à toutes vos questions et vous accompagner dans votre parcours.</p>

              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="p-2 rounded" style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <FaIcon name="envelope" className="text-primary" style={{ fontSize: '1.2rem' }} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Email</h6>
                      <p className="text-muted small mb-0"><a href={`mailto:${settings.supportEmail}`} style={{ textDecoration: 'none', color: 'inherit' }}>{settings.supportEmail}</a></p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="p-2 rounded" style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <FaIcon name="phone" className="text-primary" style={{ fontSize: '1.2rem' }} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Téléphone</h6>
                      <p className="text-muted small mb-0"><a href={`tel:${settings.supportPhone.replace(/\s/g, '')}`} style={{ textDecoration: 'none', color: 'inherit' }}>{settings.supportPhone}</a></p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="p-2 rounded" style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <FaIcon name="map-location-dot" className="text-primary" style={{ fontSize: '1.2rem' }} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Localisation</h6>
                      <p className="text-muted small mb-0">Dakar, Sénégal</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button className="btn fw-semibold" style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A4A)', color: 'white', border: 'none' }} onClick={() => window.open(`mailto:${settings.supportEmail}`)}>
                  <FaIcon name="envelope" className="me-2" /> Nous écrire
                </button>
                <button className="btn btn-outline-primary fw-semibold" onClick={() => navigate('/about', { state: { scrollTo: 'contact' } })}>
                  <FaIcon name="arrow-right" className="me-2" /> En savoir plus
                </button>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow-lg" style={{ borderRadius: 16, border: 'none', overflow: 'hidden' }}>
                <div className="card-body p-4 p-lg-5">
                  <h5 className="fw-bold mb-4">Envoyez-nous un message</h5>
                  <form>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Votre nom</label>
                      <input type="text" className="form-control" placeholder="Votre nom complet" style={{ borderRadius: 8, padding: '10px 12px' }} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Votre email</label>
                      <input type="email" className="form-control" placeholder="votre@email.com" style={{ borderRadius: 8, padding: '10px 12px' }} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Sujet</label>
                      <select className="form-select" style={{ borderRadius: 8, padding: '10px 12px' }}>
                        <option>Sélectionnez un sujet</option>
                        <option>Support technique</option>
                        <option>Partenariat</option>
                        <option>Feedback</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-semibold small">Message</label>
                      <textarea className="form-control" rows="4" placeholder="Votre message..." style={{ borderRadius: 8, padding: '10px 12px' }}></textarea>
                    </div>
                    <button type="submit" className="btn w-100 fw-semibold" style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A4A)', color: 'white', border: 'none', padding: '10px 16px' }}>
                      Envoyer le message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
