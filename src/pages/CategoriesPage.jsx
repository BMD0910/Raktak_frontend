import { useNavigate } from 'react-router-dom';
import FaIcon from '../components/common/FaIcon';
import SectionHeader from '../components/common/SectionHeader';
import { productService } from '../services/productService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { data: categories, loading, error } = useAsyncData(() => productService.categories(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={error} /></div>;

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container">
        <SectionHeader icon="layer-group" label="Catégories" title="Toutes les catégories" subtitle="Parcourez nos domaines d'activité." />
        {!categories?.length ? <EmptyState title="Aucune catégorie" message="Aucune catégorie active pour le moment." /> : (
          <div className="cat-grid">
            {categories.map((category) => (
              <button key={category.id} className="cat-card" onClick={() => navigate(`/search?cat=${encodeURIComponent(category.name)}`)}>
                <span className="cat-icon"><FaIcon name={category.icon || 'folder'} /></span>
                <div className="cat-name">{category.name}</div>
                <div className="cat-count">Catégorie active</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
