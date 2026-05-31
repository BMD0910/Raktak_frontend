import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { marketplaceService } from '../services/marketplaceService';
import { productService } from '../services/productService';

export default function VendorServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const serviceId = Number(id);
  const { data: service, loading, error } = useAsyncData(() => marketplaceService.getMyService(serviceId), [serviceId]);
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useAsyncData(() => productService.categories(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const categoryOptions = useMemo(() => categories || [], [categories]);

  useEffect(() => {
    if (!service) return;
    setForm({
      title: service.title || '',
      description: service.description || '',
      price: String(service.price ?? ''),
      category: service.category || '',
      imageUrl: service.imageUrl || '',
      deliveryTime: String(service.deliveryTime ?? ''),
      featured: Boolean(service.featured),
      active: Boolean(service.active)
    });
  }, [service]);

  if (loading || categoriesLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (categoriesError) return <ErrorState message={categoriesError} />;

  if (!service) {
    return <ErrorState message="Service introuvable." />;
  }

  if (!form) return <LoadingSpinner />;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setFormError('');
    try {
      await marketplaceService.updateMyService(serviceId, {
        ...form,
        price: Number(form.price),
        deliveryTime: Number(form.deliveryTime)
      });
      setMessage('Service mis à jour avec succès');
      setTimeout(() => navigate('/dashboard/vendor/services', { replace: true }), 700);
    } catch (err) {
      setFormError(err?.userMessage || err?.response?.data?.message || 'Impossible de mettre à jour le service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-24">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ marginBottom: 6 }}>{service.title}</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Détail et modification du service</p>
        </div>
        <Link className="btn btn-ghost" to="/dashboard/vendor/services">Retour</Link>
      </div>

      <div className="card p-20" style={{ marginBottom: 18, borderColor: 'var(--border-light)' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Prix:</strong> {Number(service.price || 0).toLocaleString('fr-FR')} FCFA</div>
          <div><strong>Catégorie:</strong> {service.category}</div>
          <div><strong>Délai:</strong> {service.deliveryTime} jours</div>
          <div><strong>Statut:</strong> {service.status === 'suspended' ? 'Suspendu' : service.active ? 'Publié' : 'Inactif'}</div>
          <div><strong>Mis en avant:</strong> {service.featured ? 'Oui' : 'Non'}</div>
          {(service.status === 'suspended' || service.status === 'inactive') && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', borderLeft: '4px solid #dc2626', color: '#991b1b' }}>
              <strong>Service désactivé</strong>
              {service.deactivationReason && (
                <div style={{ marginTop: 6 }}><strong>Motif:</strong> {service.deactivationReason}</div>
              )}
            </div>
          )}
          <p style={{ marginBottom: 0 }}><strong>Description:</strong> {service.description}</p>
        </div>
      </div>

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
              {categoryOptions.map((category) => <option key={category.id} value={category.name}>{category.icon} {category.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} />
            <span>Mettre en avant</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} />
            <span>Actif</span>
          </label>
        </div>

        {message ? <p style={{ color: 'var(--brand-teal)', marginBottom: 10 }}>{message}</p> : null}
        {formError ? <p style={{ color: '#dc2626', marginBottom: 10 }}>{formError}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
      </form>
    </section>
  );
}
