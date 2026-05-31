import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../hooks/useAuth';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import SkeletonGrid from '../components/ui/SkeletonGrid';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useAsyncData(() => marketplaceService.getServices(), []);

  const [filters, setFilters] = useState({ q: '', category: '', sort: '' });

  const servicesRaw = data || [];
  const categories = useMemo(() => Array.from(new Set(servicesRaw.map(s => s.category).filter(Boolean))), [servicesRaw]);

  const filtered = useMemo(() => {
    const q = (filters.q || '').trim().toLowerCase();
    let list = servicesRaw.filter((s) => {
      if (filters.category && s.category !== filters.category) return false;
      if (q) {
        const hay = [s.title, s.description, s.vendorName, s.category].join(' ').toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
    if (filters.sort === 'price_asc') list = list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (filters.sort === 'price_desc') list = list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return list;
  }, [servicesRaw, filters]);

  const goToRequest = (service) => {
    const qs = new URLSearchParams({
      serviceId: String(service.id),
      serviceTitle: service.title || '',
      vendorName: service.vendorName || '',
      price: service.price || ''
    }).toString();
    const target = `/new-request?${qs}`;
    if (isAuthenticated) navigate(target);
    else navigate(`/login?redirect=${encodeURIComponent(target)}`);
  };

  if (loading) {
    return (
      <section style={{ paddingTop: 'var(--header-h)' }}>
        <div className="container" style={{ paddingTop: 24 }}>
          <h1 className="display-sm" style={{ marginBottom: 16 }}>Services marketplace</h1>
          <SkeletonGrid cards={6} />
        </div>
      </section>
    );
  }
  if (error) return <ErrorState message={error} />;

  const services = servicesRaw;

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <h1 className="display-sm" style={{ marginBottom: 16 }}>Services marketplace</h1>
        {!services.length ? <EmptyState title="Aucun service" message="Aucun service actif pour le moment." /> : (
          <>
            <div className="card p-3 mb-3">
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Rechercher un service, prestataire ou description..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
                </div>
                <div className="col-6 col-md-3">
                  <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">Toutes catégories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <select className="form-select" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                    <option value="">Trier</option>
                    <option value="price_asc">Prix: bas → haut</option>
                    <option value="price_desc">Prix: haut → bas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="results-grid results-grid--services">
              {filtered.map((service, index) => (
                <article className="service-card card" key={service.id} role="button" onClick={() => goToRequest(service)} style={{ cursor: 'pointer' }}>
                  <div className="service-card-inner">
                    <div className="service-body">
                      <div className="service-head">
                        <h3 className="service-title">{service.title}</h3>
                        {service.featured ? <span className="badge badge-top">Featured</span> : null}
                      </div>
                      <p className="service-meta">{service.category} · {service.deliveryTime} jours</p>
                      <p className="service-desc">{service.description}</p>

                      <div className="service-footer">
                        <div className="vendor">
                          <div className="vendor-info">
                            <div className="vendor-name">{service.vendorName}</div>
                            <div className="vendor-sub">{service.city || ''}</div>
                          </div>
                        </div>
                        <div className="price-cta">
                          <div className="price">{service.price} FCFA</div>
                          <button className="btn btn-primary btn-sm" type="button" onClick={(e) => { e.stopPropagation(); goToRequest(service); }}>Demander</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
