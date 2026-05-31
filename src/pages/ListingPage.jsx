import { useMemo, useState } from 'react';
import VendorCard from '../components/common/VendorCard';
import SectionHeader from '../components/common/SectionHeader';
import FaIcon from '../components/common/FaIcon';
import { productService } from '../services/productService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

export default function ListingPage() {
  const [sortBy, setSortBy] = useState('rating');
  const { data: vendors, loading, error } = useAsyncData(() => productService.vendors(), []);

  const sortedVendors = useMemo(() => {
    const base = [...(vendors || [])];
    if (sortBy === 'reviews') return base.sort((a, b) => b.reviews - a.reviews);
    if (sortBy === 'views') return base.sort((a, b) => b.views - a.views);
    return base.sort((a, b) => b.rating - a.rating);
  }, [sortBy, vendors]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={error} /></div>;

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <SectionHeader icon="building" label="Annuaire" title="Tous les prestataires" subtitle="Découvrez les profils disponibles." />
          <div className="input-group" style={{ maxWidth: 260 }}>
            <span className="input-group-text"><FaIcon name="arrow-down-wide-short" style={{ color: 'var(--brand-primary)' }} /></span>
            <select className="form-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="rating">Mieux notés</option>
              <option value="reviews">Plus d'avis</option>
              <option value="views">Plus vus</option>
            </select>
          </div>
        </div>
        {!sortedVendors.length ? <EmptyState title="Aucun prestataire" message="Aucun résultat disponible." /> : (
          <div className="row g-3">
            {sortedVendors.map((vendor) => (
              <div key={vendor.id} className="col-12 col-md-6 col-lg-4">
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
