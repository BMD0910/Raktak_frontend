import { useMemo, useState } from 'react';
import { productService } from '../services/productService';
import { useAsyncData } from '../hooks/useAsyncData';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FaIcon from '../components/common/FaIcon';
import VendorCard from '../components/common/VendorCard';

export default function VendorsPage() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const { data, loading, error } = useAsyncData(() => productService.vendors(), []);

  const vendors = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const categories = useMemo(() => {
    return [...new Set(vendors.map((vendor) => vendor.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [vendors]);

  const cities = useMemo(() => {
    return [...new Set(vendors.map((vendor) => vendor.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const matchesQuery = !q || [vendor.name, vendor.category, vendor.city, vendor.country, vendor.description, ...(vendor.services || [])]
        .join(' ')
        .toLowerCase()
        .includes(q);
      const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
      const matchesCity = cityFilter === 'all' || vendor.city === cityFilter;
      return matchesQuery && matchesCategory && matchesCity;
    });
  }, [vendors, query, categoryFilter, cityFilter]);

  const search = (event) => {
    event.preventDefault();
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) return <ErrorState message={error} />;

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
          <div>
            <h1 className="display-sm mb-2">Prestataires vérifiés</h1>
            <p className="text-muted mb-0">Recherchez un prestataire par nom, catégorie ou ville.</p>
          </div>
          <div className="badge bg-light text-dark">
            <FaIcon name="users" className="me-2" />{filteredVendors.length} résultat{filteredVendors.length > 1 ? 's' : ''}
          </div>
        </div>

        <form onSubmit={search} className="card p-3 p-md-4 mb-4 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-5">
              <label className="form-label fw-semibold">Recherche</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><FaIcon name="magnifying-glass" /></span>
                <input
                  className="form-control"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un prestataire..."
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Catégorie</label>
              <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Ville</label>
              <select className="form-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="all">Toutes les villes</option>
                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="col-12 col-lg-1 d-grid">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategoryFilter('all');
                  setCityFilter('all');
                }}
                title="Réinitialiser"
              >
                <FaIcon name="times" />
              </button>
            </div>
          </div>
        </form>

        {!filteredVendors.length ? (
          <EmptyState title="Aucun prestataire" message="Aucun prestataire ne correspond à vos filtres." />
        ) : (
          <div className="row g-4">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="col-12 col-md-6 col-lg-4">
                <VendorCard
                  vendor={{
                    ...vendor,
                    icon: vendor.icon || vendor.emoji || vendor.avatar || 'building',
                    verified: vendor.verified ?? vendor.vendorVerified
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
