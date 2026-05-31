import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

function formatFcfa(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

const FEATURE_QUICK_SUGGESTIONS = [
  'Badge premium',
  'Support prioritaire',
  'Leads illimités',
  'Mise en avant',
  'Statistiques avancées'
];

export default function AdminSubscriptionPlansPage() {
  const navigate = useNavigate();
  const {
    data: plansData,
    loading,
    error,
    setData: setPlansData
  } = useAsyncData(() => dashboardService.adminSubscriptionPlans(), []);
  const [plans, setPlans] = useState([]);
  const [featureDrafts, setFeatureDrafts] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (plansData) setPlans(plansData);
  }, [plansData]);

  useEffect(() => {
    setFeatureDrafts((prev) => {
      const next = { ...prev };
      plans.forEach((plan, index) => {
        if (next[index] === undefined) next[index] = '';
      });
      return next;
    });
  }, [plans]);

  const updatePlan = (index, key, value) => {
    setPlans((prev) => prev.map((plan, i) => (i === index ? { ...plan, [key]: value } : plan)));
  };

  const updateFeatureDraft = (index, value) => {
    setFeatureDrafts((prev) => ({ ...prev, [index]: value }));
  };

  const appendFeature = (index, value) => {
    const draft = String(value || '').trim();
    if (!draft) return;
    setPlans((prev) => prev.map((plan, i) => {
      if (i !== index) return plan;
      const current = Array.isArray(plan.features) ? plan.features : [];
      if (current.some((item) => String(item).toLowerCase() === draft.toLowerCase())) return plan;
      return { ...plan, features: [...current, draft] };
    }));
  };

  const addFeature = (index) => {
    const draft = String(featureDrafts[index] || '').trim();
    if (!draft) return;
    appendFeature(index, draft);
    updateFeatureDraft(index, '');
  };

  const removeFeature = (planIndex, featureIndex) => {
    setPlans((prev) => prev.map((plan, i) => {
      if (i !== planIndex) return plan;
      const current = Array.isArray(plan.features) ? plan.features : [];
      return { ...plan, features: current.filter((_, idx) => idx !== featureIndex) };
    }));
  };

  const addPlan = () => {
    setPlans((prev) => [...prev, {
      code: '',
      name: '',
      priceFcfa: 0,
      description: '',
      features: [],
      active: true,
      displayOrder: prev.length + 1
    }]);
  };

  const savePlans = async () => {
    setFeedback('');
    setSaving(true);
    try {
      const saved = await dashboardService.updateAdminSubscriptionPlans(
        plans.map((plan, index) => ({
          ...plan,
          displayOrder: index + 1,
          features: Array.isArray(plan.features) ? plan.features : String(plan.features || '').split('\n')
        }))
      );
      setPlans(saved);
      setPlansData(saved);
      setFeedback('Tarifs enregistrés avec succès.');
    } catch (e) {
      setFeedback(e?.userMessage || e?.message || 'Échec de mise à jour des tarifs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const activePlansCount = plans.filter((plan) => Boolean(plan.active)).length;
  const avgPrice = plans.length ? Math.round(plans.reduce((sum, plan) => sum + Number(plan.priceFcfa || 0), 0) / plans.length) : 0;
  const totalFeatures = plans.reduce((sum, plan) => sum + (Array.isArray(plan.features) ? plan.features.length : 0), 0);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card" style={{ padding: 20, border: '1px solid var(--border-light)', background: 'linear-gradient(135deg, rgba(255,90,31,0.08), rgba(13,27,42,0.02))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 780 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,90,31,0.12)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 12, marginBottom: 12 }}>
              Admin • Abonnements prestataires
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 900, marginBottom: 8 }}>Gestion des plans prestataire</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0, lineHeight: 1.6 }}>
              Modifiez les plans, le prix, l’ordre d’affichage et les features visibles côté client. Les changements sont synchronisés avec la page Tarifs.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => navigate('/dashboard/admin')}>Retour dashboard</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
          <div className="card" style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Plans actifs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{activePlansCount}</div>
          </div>
          <div className="card" style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Plans total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{plans.length}</div>
          </div>
          <div className="card" style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Prix moyen</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{formatFcfa(avgPrice)}</div>
          </div>
          <div className="card" style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Features totales</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{totalFeatures}</div>
          </div>
        </div>
      </div>

      <div className="dash-panel">
        <div className="panel-header" style={{ alignItems: 'center' }}>
          <span className="panel-title">Plans configurables</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addPlan}>Ajouter un plan</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={savePlans} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les plans'}
            </button>
          </div>
        </div>
        <div className="panel-body">
          {plans.length === 0 ? (
            <EmptyState title="Aucun plan" message="Ajoutez un premier plan pour les clients prestataires." />
          ) : (
            <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {plans.map((plan, index) => (
                <article key={plan.code || index} className="card" style={{ padding: 18, border: '1px solid var(--border-light)', boxShadow: '0 10px 30px rgba(13,27,42,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(13,27,42,0.06)', fontSize: 12, fontWeight: 700 }}>{plan.code || 'NOUVEAU'}</span>
                        <span style={{ color: Boolean(plan.active) ? '#047857' : '#b91c1c', fontSize: 12, fontWeight: 700 }}>
                          {Boolean(plan.active) ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <input
                        className="form-input"
                        value={plan.name}
                        onChange={(e) => updatePlan(index, 'name', e.target.value)}
                        placeholder="Nom du plan"
                        style={{ fontSize: '1.15rem', fontWeight: 800, padding: '10px 12px' }}
                      />
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPlans((prev) => prev.filter((_, i) => i !== index))}>
                      Supprimer
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Code</label>
                      <input className="form-input" value={plan.code} onChange={(e) => updatePlan(index, 'code', e.target.value.toUpperCase())} placeholder="PRO" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prix (FCFA)</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={plan.priceFcfa}
                        onChange={(e) => updatePlan(index, 'priceFcfa', Number(e.target.value || 0))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre max de services</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={plan.maxServices ?? 0}
                        onChange={(e) => updatePlan(index, 'maxServices', Number(e.target.value || 0))}
                        placeholder="0 = illimité"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max services mis en avant</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={plan.maxFeaturedServices ?? 0}
                        onChange={(e) => updatePlan(index, 'maxFeaturedServices', Number(e.target.value || 0))}
                        placeholder="0 = illimité"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Options du plan</label>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={Boolean(plan.allowFeatured)} onChange={(e) => updatePlan(index, 'allowFeatured', e.target.checked)} />
                          <span>Permettre mise en avant</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={Boolean(plan.allowPremiumBadge)} onChange={(e) => updatePlan(index, 'allowPremiumBadge', e.target.checked)} />
                          <span>Permettre badge premium</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={Boolean(plan.requireCompleteProfile)} onChange={(e) => updatePlan(index, 'requireCompleteProfile', e.target.checked)} />
                          <span>Exiger profil complet</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 12, marginBottom: 12, background: 'rgba(255,90,31,0.06)', border: '1px solid rgba(255,90,31,0.12)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>Aperçu prix</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-primary)' }}>{formatFcfa(plan.priceFcfa)}</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={plan.description}
                      onChange={(e) => updatePlan(index, 'description', e.target.value)}
                      placeholder="Décris les bénéfices de ce plan"
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Features</label>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{(Array.isArray(plan.features) ? plan.features : []).length} feature(s)</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {(Array.isArray(plan.features) ? plan.features : []).length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucune feature pour l’instant.</span>
                      ) : (
                        (Array.isArray(plan.features) ? plan.features : []).map((feature, featureIndex) => (
                          <span
                            key={`${plan.code || index}-${featureIndex}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 999, background: 'rgba(255,90,31,0.08)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 13 }}
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(index, featureIndex)}
                              style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                              aria-label="Supprimer feature"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <input
                          className="form-input"
                          style={{ flex: '1 1 240px' }}
                          value={featureDrafts[index] || ''}
                          onChange={(e) => updateFeatureDraft(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addFeature(index);
                            }
                          }}
                          placeholder="Ajouter une feature"
                        />
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addFeature(index)}>Ajouter</button>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {FEATURE_QUICK_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => appendFeature(index, suggestion)}
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>

                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Entrée, bouton Ajouter ou suggestions rapides pour créer des tags feature.</div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <input type="checkbox" checked={Boolean(plan.active)} onChange={(e) => updatePlan(index, 'active', e.target.checked)} />
                    <span>Plan visible côté client</span>
                  </label>
                </article>
              ))}
            </div>
          )}

          {feedback ? <p style={{ marginTop: 12, color: feedback.includes('succès') ? '#047857' : '#b91c1c' }}>{feedback}</p> : null}

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addPlan}>Ajouter un plan</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={savePlans} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les plans'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
