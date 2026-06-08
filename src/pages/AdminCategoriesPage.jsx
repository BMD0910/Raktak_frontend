import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import FaIcon from '../components/common/FaIcon';

const emptyCategory = {
  id: null,
  name: '',
  slug: '',
  icon: 'folder',
  displayOrder: 1,
  active: true
};

const emptySubcategory = {
  id: null,
  categoryId: '',
  name: '',
  slug: '',
  active: true
};

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [subcategoryForm, setSubcategoryForm] = useState(emptySubcategory);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingSubcategory, setSavingSubcategory] = useState(false);
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, subs] = await Promise.all([
        adminService.getCategories(),
        adminService.getSubcategories()
      ]);
      setCategories(cats);
      setSubcategories(subs);
      if (!selectedCategoryId && cats.length > 0) {
        setSelectedCategoryId(String(cats[0].id));
      }
    } catch (e) {
      setError(e?.userMessage || e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(selectedCategoryId)) || null,
    [categories, selectedCategoryId]
  );

  const filteredSubcategories = useMemo(
    () => subcategories.filter((subcategory) => !selectedCategoryId || String(subcategory.categoryId) === String(selectedCategoryId)),
    [subcategories, selectedCategoryId]
  );

  const updateCategory = (key, value) => {
    setCategoryForm((prev) => ({ ...prev, [key]: value }));
    setFeedback('');
  };

  const updateSubcategory = (key, value) => {
    setSubcategoryForm((prev) => ({ ...prev, [key]: value }));
    setFeedback('');
  };

  const resetCategory = () => setCategoryForm(emptyCategory);
  const resetSubcategory = () => setSubcategoryForm({ ...emptySubcategory, categoryId: selectedCategoryId || '' });

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    setSavingCategory(true);
    setFeedback('');
    try {
      await adminService.saveCategory(categoryForm);
      resetCategory();
      await load();
      setFeedback('Catégorie enregistrée avec succès.');
    } catch (e) {
      setFeedback(e?.userMessage || e?.message || 'Impossible d’enregistrer la catégorie.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveSubcategory = async (event) => {
    event.preventDefault();
    setSavingSubcategory(true);
    setFeedback('');
    try {
      await adminService.saveSubcategory({ ...subcategoryForm, categoryId: Number(subcategoryForm.categoryId) });
      resetSubcategory();
      await load();
      setFeedback('Sous-catégorie enregistrée avec succès.');
    } catch (e) {
      setFeedback(e?.userMessage || e?.message || 'Impossible d’enregistrer la sous-catégorie.');
    } finally {
      setSavingSubcategory(false);
    }
  };

  const startEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || 'folder',
      displayOrder: Number(category.displayOrder || 1),
      active: Boolean(category.active)
    });
  };

  const startEditSubcategory = (subcategory) => {
    setSubcategoryForm({
      id: subcategory.id,
      categoryId: String(subcategory.categoryId || selectedCategoryId || ''),
      name: subcategory.name || '',
      slug: subcategory.slug || '',
      active: Boolean(subcategory.active)
    });
  };

  const toggleCategory = async (category) => {
    setFeedback('');
    try {
      await adminService.toggleCategory(category.id, !category.active);
      await load();
      setFeedback(category.active ? 'Catégorie désactivée.' : 'Catégorie activée.');
    } catch (e) {
      setFeedback(e?.userMessage || e?.message || 'Action impossible.');
    }
  };

  const toggleSubcategory = async (subcategory) => {
    setFeedback('');
    try {
      await adminService.toggleSubcategory(subcategory.id, !subcategory.active);
      await load();
      setFeedback(subcategory.active ? 'Sous-catégorie désactivée.' : 'Sous-catégorie activée.');
    } catch (e) {
      setFeedback(e?.userMessage || e?.message || 'Action impossible.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card" style={{ padding: 20, border: '1px solid var(--border-light)', background: 'linear-gradient(135deg, rgba(255,90,31,0.08), rgba(13,27,42,0.02))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,90,31,0.12)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 12, marginBottom: 12 }}>
              Admin • Catégories et sous-catégories
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 900, marginBottom: 8 }}>Gestion des catégories</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0, lineHeight: 1.6 }}>
              Créez, modifiez et activez les catégories utilisées partout dans la plateforme, puis gérez leurs sous-catégories.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={load}>Rafraîchir</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
          <Metric label="Catégories" value={categories.length} icon="folder" />
          <Metric label="Actives" value={categories.filter((item) => item.active).length} icon="circle-check" />
          <Metric label="Sous-catégories" value={subcategories.length} icon="layer-group" />
          <Metric label="Sous-catégories actives" value={subcategories.filter((item) => item.active).length} icon="check-double" />
        </div>
      </div>

      {feedback ? <div className="card" style={{ padding: 12, borderColor: '#d1fae5', background: '#f0fdf4', color: '#166534' }}>{feedback}</div> : null}

      <div className="dash-panel">
        <div className="panel-header" style={{ alignItems: 'center' }}>
          <span className="panel-title">Catégories</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={resetCategory}>Nouvelle catégorie</button>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSaveCategory} className="card" style={{ padding: 16, marginBottom: 16, border: '1px solid var(--border-light)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input className="form-input" value={categoryForm.name} onChange={(e) => updateCategory('name', e.target.value)} placeholder="Ex: Marketing digital" required />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input className="form-input" value={categoryForm.slug} onChange={(e) => updateCategory('slug', e.target.value)} placeholder="marketing-digital" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Icône</label>
                <input className="form-input" value={categoryForm.icon} onChange={(e) => updateCategory('icon', e.target.value)} placeholder="folder" />
              </div>
              <div className="form-group">
                <label className="form-label">Ordre</label>
                <input className="form-input" type="number" min="0" value={categoryForm.displayOrder} onChange={(e) => updateCategory('displayOrder', Number(e.target.value))} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input type="checkbox" checked={Boolean(categoryForm.active)} onChange={(e) => updateCategory('active', e.target.checked)} />
              <span>Catégorie active</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={resetCategory}>Réinitialiser</button>
              <button type="submit" className="btn btn-primary" disabled={savingCategory}>{savingCategory ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>

          {categories.length === 0 ? (
            <EmptyState title="Aucune catégorie" message="Ajoutez la première catégorie pour l’afficher dans la plateforme." />
          ) : (
            <div className="grid gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {categories.map((category) => (
                <article key={category.id} className="card" style={{ padding: 16, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,90,31,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                        <FaIcon name={category.icon || 'folder'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{category.name}</div>
                        <div className="text-muted small">/{category.slug} · {category.subcategoriesCount || 0} sous-catégories</div>
                      </div>
                    </div>
                    <span className="badge" style={{ background: category.active ? '#dcfce7' : '#fee2e2', color: category.active ? '#166534' : '#991b1b' }}>{category.active ? 'Actif' : 'Inactif'}</span>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => startEditCategory(category)}>Modifier</button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => toggleCategory(category)}>{category.active ? 'Désactiver' : 'Activer'}</button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => setSelectedCategoryId(String(category.id))}>Voir sous-catégories</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dash-panel">
        <div className="panel-header" style={{ alignItems: 'center' }}>
          <span className="panel-title">Sous-catégories{selectedCategory ? ` de ${selectedCategory.name}` : ''}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="form-input" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} style={{ minWidth: 220 }}>
              <option value="">Toutes les catégories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetSubcategory}>Nouvelle sous-catégorie</button>
          </div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSaveSubcategory} className="card" style={{ padding: 16, marginBottom: 16, border: '1px solid var(--border-light)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Catégorie parente</label>
                <select className="form-input" value={subcategoryForm.categoryId} onChange={(e) => updateSubcategory('categoryId', e.target.value)} required>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input className="form-input" value={subcategoryForm.name} onChange={(e) => updateSubcategory('name', e.target.value)} placeholder="Ex: Réseaux sociaux" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input className="form-input" value={subcategoryForm.slug} onChange={(e) => updateSubcategory('slug', e.target.value)} placeholder="reseaux-sociaux" />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={Boolean(subcategoryForm.active)} onChange={(e) => updateSubcategory('active', e.target.checked)} />
                  <span>Sous-catégorie active</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={resetSubcategory}>Réinitialiser</button>
              <button type="submit" className="btn btn-primary" disabled={savingSubcategory}>{savingSubcategory ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>

          {filteredSubcategories.length === 0 ? (
            <EmptyState title="Aucune sous-catégorie" message="Ajoutez une sous-catégorie pour la catégorie sélectionnée." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredSubcategories.map((subcategory) => (
                <div key={subcategory.id} className="card" style={{ padding: 14, border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{subcategory.name}</div>
                    <div className="text-muted small">/{subcategory.slug} · {subcategory.categoryName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge" style={{ background: subcategory.active ? '#dcfce7' : '#fee2e2', color: subcategory.active ? '#166534' : '#991b1b' }}>{subcategory.active ? 'Actif' : 'Inactif'}</span>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => startEditSubcategory(subcategory)}>Modifier</button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => toggleSubcategory(subcategory)}>{subcategory.active ? 'Désactiver' : 'Activer'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="card" style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaIcon name={icon} /> {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{value}</div>
    </div>
  );
}