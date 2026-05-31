import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VendorCard from '../components/common/VendorCard';
import FaIcon from '../components/common/FaIcon';
import { sanitizeQuery } from '../utils/sanitize';
import { useAsyncData } from '../hooks/useAsyncData';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');
  const selectedCategory = searchParams.get('cat') || '';
  const selectedCity = searchParams.get('city') || '';

  const { data: categories, loading: categoriesLoading, error: categoriesError } = useAsyncData(
    () => productService.categories(),
    []
  );

  const { data: vendors, loading: vendorsLoading, error: vendorsError } = useAsyncData(
    () => productService.vendors({ q: searchParams.get('q') || undefined, category: selectedCategory || undefined, city: selectedCity || undefined }),
    [searchParams.toString()]
  );

  const filtered = useMemo(() => {
    const query = sanitizeQuery(searchParams.get('q') || '').toLowerCase();
    return (vendors || []).filter((vendor) => {
      const matchesQuery = !query || [vendor.name, vendor.category, ...vendor.services].join(' ').toLowerCase().includes(query);
      return matchesQuery;
    });
  }, [searchParams, vendors]);

  if (categoriesLoading || vendorsLoading) return <LoadingSpinner />;
  if (categoriesError || vendorsError) return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={categoriesError || vendorsError} /></div>;

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const clean = sanitizeQuery(localQuery);
    if (clean) params.set('q', clean);
    else params.delete('q');
    setSearchParams(params);
  };

  return (
    <div className="search-page">
      <header className="py-4" style={{ background: 'var(--brand-primary)', color: '#fff' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="h3 mb-2">Résultats de recherche</h1>
              <p className="text-white-50 mb-0">Trouvez un service ou un prestataire près de chez vous.</p>
            </div>
            <div className="col-md-4">
              <form className="d-flex" onSubmit={submit}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-0"><FaIcon name="magnifying-glass" style={{ color: 'var(--brand-primary)' }} /></span>
                  <input type="text" className="form-control" value={localQuery} onChange={(event) => setLocalQuery(event.target.value)} placeholder="Rechercher un service, une entreprise..." />
                  <button className="btn btn-outline-light" type="submit" style={{ borderColor: 'rgba(255,255,255,.15)' }}>Rechercher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4">
        <div className="row">
          <aside className="col-lg-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Filtres</h6>
                <div className="mb-2"><small className="text-muted">Catégorie</small></div>
                <div className="list-group list-group-flush">
                  {(categories || []).map((category) => (
                    <label key={category.id} className="list-group-item list-group-item-action d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input
                        className="form-check-input me-2"
                        type="radio"
                        name="cat"
                        checked={selectedCategory === category.name}
                        onChange={() => {
                          const p = new URLSearchParams(searchParams);
                          p.set('cat', category.name);
                          setSearchParams(p);
                        }}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="results-count">Affichage de <strong>{filtered.length}</strong> résultats</div>
            </div>

            {!filtered.length ? <EmptyState title="Aucun résultat" message="Aucun prestataire ne correspond à votre recherche." /> : (
              <div className="row g-3">
                {filtered.map((vendor) => (
                  <div key={vendor.id} className="col-12 col-md-6 col-lg-4">
                    <VendorCard vendor={vendor} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
