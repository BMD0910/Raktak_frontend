import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { marketplaceService } from '../services/marketplaceService';
import { canCreateService } from '../utils/vendorAccess';
import { useAsyncData } from '../hooks/useAsyncData';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';

export default function CreateServicePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useAsyncData(() => productService.categories(), []);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    deliveryTime: '',
    featured: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  if (categoriesLoading) return <LoadingSpinner />;
  if (categoriesError) return <ErrorState message={categoriesError} />;

  if (!canCreateService(profile)) {
    return (
      <div className="card p-32">
        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Créer un service</h2>
        <p style={{ color: '#b45309', marginBottom: 12 }}>Votre abonnement et votre profil prestataire doivent être complétés avant de publier un service.</p>
        <button className="btn btn-primary" type="button" onClick={() => navigate('/vendor/setup-profile', { replace: true })}>Compléter mon profil</button>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await marketplaceService.createService({
        ...form,
        price: Number(form.price),
        deliveryTime: Number(form.deliveryTime)
      });
      setMessage('Service créé avec succès');
      setForm({ title: '', description: '', price: '', category: '', imageUrl: '', deliveryTime: '', featured: false });
      setTimeout(() => navigate('/services', { replace: true }), 600);
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.message || 'Création impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-32">
      <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Créer un service</h2>
      <form onSubmit={submit}>
        <div className="form-group"><label className="form-label">Titre</label><input className="form-input" value={form.title} onChange={(e) => update('title', e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input form-textarea" value={form.description} onChange={(e) => update('description', e.target.value)} required /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Prix</label><input className="form-input" type="number" min="1" value={form.price} onChange={(e) => update('price', e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Délai (jours)</label><input className="form-input" type="number" min="1" value={form.deliveryTime} onChange={(e) => update('deliveryTime', e.target.value)} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <select className="form-input" value={form.category} onChange={(e) => update('category', e.target.value)} required>
              <option value="">Choisir une catégorie</option>
              {(categories || []).map((category) => <option key={category.id} value={category.name}>{category.icon} {category.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} /></div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} />
          <span>Mettre en avant</span>
        </label>
        {message ? <p style={{ color: 'var(--brand-teal)', marginBottom: 10 }}>{message}</p> : null}
        {error ? <p style={{ color: '#dc2626', marginBottom: 10 }}>{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Publication...' : 'Publier le service'}</button>
      </form>
    </div>
  );
}
