import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAsyncData } from '../hooks/useAsyncData';
import { subscriptionPlanService } from '../services/subscriptionPlanService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

const PLAN_META = {
  BASIC: {
    eyebrow: 'Découverte',
    title: 'Plan Gratuit',
    description: 'Parfait pour tester la plateforme et découvrir les opportunités avant de passer à un plan plus ambitieux.',
    audience: 'Idéal pour les nouveaux prestataires',
    accent: 'green',
    icon: 'seedling',
    benefits: [
      'Profil basique activé immédiatement',
      'Jusqu’à 10 leads par mois',
      'Accès à la vitrine de la plateforme'
    ]
  },
  PRO: {
    eyebrow: 'Recommandé',
    title: 'Plan Pro',
    description: 'Le meilleur équilibre pour gagner en visibilité, recevoir plus de demandes et construire votre réputation.',
    audience: 'Idéal pour les prestataires en croissance',
    accent: 'brand',
    icon: 'rocket',
    benefits: [
      'Profil complet avec mise en avant',
      'Jusqu’à 50 leads par mois',
      'Priorité sur la recherche et les recommandations'
    ]
  },
  BUSINESS: {
    eyebrow: 'Performance',
    title: 'Plan Business',
    description: 'La solution premium pour les structures qui veulent maximiser leur exposition et leur volume de prospects.',
    audience: 'Idéal pour les équipes et agences',
    accent: 'blue',
    icon: 'chart-line',
    benefits: [
      'Leads illimités',
      'Mise en avant prioritaire',
      'Volume maximal pour accélérer la croissance'
    ]
  }
};

const PAYMENT_OPTIONS = [
  { value: 'WAVE', label: 'Wave', description: 'Paiement rapide et simple.' },
  { value: 'ORANGE_QR', label: 'Orange Money (QR)', description: 'Scannez et payez en quelques secondes.' },
  { value: 'ORANGE_MAXIT', label: 'Orange Money (MaxIt)', description: 'Compatible avec MaxIt.' },
  { value: 'ORANGE_OM', label: 'Orange Money (Standard)', description: 'Mode Orange Money classique.' }
];

function formatFcfa(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function BecomeVendorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, becomeVendor, refreshVendorStatus } = useAuth();
  const { data: plans, loading, error } = useAsyncData(() => subscriptionPlanService.getPublicPlans(), []);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!selectedPlan && plans?.length) {
      const planFromQuery = String(searchParams.get('plan') || '').trim().toUpperCase();
      const matchedPlan = planFromQuery ? plans.find((plan) => plan.code === planFromQuery) : null;
      setSelectedPlan(matchedPlan?.code || plans[0].code);
    }
  }, [plans, selectedPlan, searchParams]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}><ErrorState message={error} /></div>;
  }

  if (profile?.isVendor && profile?.subscriptionActive && profile?.profileCompleted) {
    return (
      <section style={{ paddingTop: 'var(--header-h)' }}>
        <div className="container" style={{ paddingTop: 24 }}>
          <div className="card p-32">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div className="dashboard-icon" style={{ width: 48, height: 48 }}><FaIcon name="check" /></div>
              <div>
                <h1 className="display-sm" style={{ marginBottom: 4 }}>Votre compte prestataire est déjà prêt</h1>
                <p className="text-muted" style={{ marginBottom: 0 }}>Vous êtes déjà abonné et votre profil est complet.</p>
              </div>
            </div>
            <Link className="btn btn-primary" to="/dashboard/vendor">Aller au tableau de bord</Link>
          </div>
        </div>
      </section>
    );
  }

  const selectedPlanObj = (plans || []).find((plan) => plan.code === selectedPlan) || null;
  const selectedPlanMeta = PLAN_META[selectedPlanObj?.code] || PLAN_META.PRO;
  const selectedFeatures = Array.isArray(selectedPlanObj?.features) ? selectedPlanObj.features : [];
  const selectedPrice = formatFcfa(selectedPlanObj?.priceFcfa);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setMessage('');
    try {
      const resp = await becomeVendor({ planCode: selectedPlan, paymentMethod });
      if (resp?.free || resp?.subscriptionActive) {
        setMessage('Abonnement gratuit activé. Complétez maintenant votre profil prestataire.');
        await refreshVendorStatus().catch(() => {});
        setTimeout(() => navigate('/vendor/setup-profile', { replace: true }), 900);
        return;
      }
      if (resp?.payment_url) {
        window.location.href = resp.payment_url;
        return;
      }
      if (resp?.qr_base64 || resp?.provider_data) {
        setMessage('Paiement initié. Scannez le QR ou terminez le paiement Orange.');
        await refreshVendorStatus().catch(() => {});
        return;
      }
      setFormError('Impossible d’initier le paiement de l’abonnement.');
    } catch (err) {
      setFormError(err?.userMessage || err?.response?.data?.message || 'Impossible de souscrire à l’abonnement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="vendor-subscribe-page" style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 36 }}>
        <div className="vendor-subscribe-hero">
          <div className="vendor-subscribe-hero-copy">
            <span className="vendor-subscribe-badge"><FaIcon name="sparkles" /> Devenir prestataire</span>
            <h1 className="display-sm" style={{ marginTop: 12, marginBottom: 12 }}>Choisissez l’abonnement qui correspond à votre activité</h1>
            <p className="vendor-subscribe-lead">Le plan <strong>{selectedPlanMeta.eyebrow}</strong> est pré-sélectionné. Vous pouvez comparer les offres, lire les détails de chaque formule et passer au paiement en toute simplicité.</p>
            <div className="vendor-subscribe-pills">
              <span><FaIcon name="bolt" /> Activation rapide</span>
              <span><FaIcon name="shield-heart" /> Paiement sécurisé</span>
              <span><FaIcon name="circle-check" /> Profil prestataire complet</span>
            </div>
          </div>
          <div className="vendor-subscribe-focus card">
            <div className="vendor-subscribe-focus-top">
              <span className={`vendor-plan-chip is-${selectedPlanMeta.accent}`}>{selectedPlanMeta.eyebrow}</span>
              <strong>{selectedPlanObj?.name || selectedPlanMeta.title}</strong>
              <div className="vendor-subscribe-price">{selectedPrice}</div>
            </div>
            <p>{selectedPlanMeta.description}</p>
            <div className="vendor-subscribe-audience">{selectedPlanMeta.audience}</div>
          </div>
        </div>

        <div className="vendor-subscribe-grid">
          <div className="vendor-subscribe-main">
            <div className="vendor-subscribe-section card">
              <div className="vendor-subscribe-section-head">
                <div>
                  <h2>Comparer les plans</h2>
                  <p>Sélectionnez une formule et visualisez immédiatement ses avantages.</p>
                </div>
                <Link className="btn btn-ghost btn-sm" to="/pricing">Voir les tarifs publics</Link>
              </div>

              <div className="vendor-plan-grid">
                {(plans || []).map((plan) => {
                  const meta = PLAN_META[plan.code] || PLAN_META.PRO;
                  const isSelected = selectedPlan === plan.code;
                  const planFeatures = Array.isArray(plan.features) ? plan.features : [];
                  return (
                    <button
                      key={plan.code}
                      type="button"
                      className={`vendor-plan-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedPlan(plan.code)}
                    >
                      <div className="vendor-plan-card-head">
                        <span className={`vendor-plan-chip is-${meta.accent}`}>{meta.eyebrow}</span>
                        {isSelected ? <span className="vendor-plan-selected"><FaIcon name="circle-check" /> Sélectionné</span> : null}
                      </div>
                      <div className="vendor-plan-card-title">{plan.name}</div>
                      <div className="vendor-plan-card-price">{formatFcfa(plan.priceFcfa)}</div>
                      <p className="vendor-plan-card-desc">{plan.description}</p>
                      <ul className="vendor-plan-card-features">
                        {meta.benefits.concat(planFeatures.slice(0, 2)).slice(0, 4).map((feature, index) => (
                          <li key={`${plan.code}-${index}`}><FaIcon name="circle-check" /> {feature}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="vendor-subscribe-section card">
              <div className="vendor-subscribe-section-head">
                <div>
                  <h2>Détails du plan sélectionné</h2>
                  <p>Tout ce que vous obtenez avec cette formule.</p>
                </div>
              </div>
              <div className="vendor-plan-detail">
                <div className="vendor-plan-detail-meta">
                  <span className={`vendor-plan-chip is-${selectedPlanMeta.accent}`}>{selectedPlanMeta.eyebrow}</span>
                  <h3>{selectedPlanObj?.name || selectedPlanMeta.title}</h3>
                  <p>{selectedPlanMeta.description}</p>
                </div>
                <div className="vendor-plan-detail-list">
                  <div className="vendor-plan-detail-block">
                    <span>Ce plan comprend</span>
                    <ul>
                      {selectedFeatures.length ? selectedFeatures.map((feature) => (<li key={feature}><FaIcon name="check" /> {feature}</li>)) : (<li><FaIcon name="check" /> Profitez d’un abonnement prêt à l’emploi.</li>)}
                    </ul>
                  </div>
                  <div className="vendor-plan-detail-block">
                    <span>Parfait pour</span>
                    <p>{selectedPlanMeta.audience}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="vendor-subscribe-side card">
            <div className="vendor-side-title">
              <h2>Paiement et activation</h2>
              <p>Finalisez votre choix et lancez l’abonnement.</p>
            </div>

            <form onSubmit={submit} className="vendor-subscribe-form">
              <label className="vendor-field">
                <span>Méthode de paiement</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <div className="vendor-payment-hint">
                {PAYMENT_OPTIONS.find((option) => option.value === paymentMethod)?.description}
              </div>

              <div className="vendor-summary-box">
                <div>
                  <span>Plan sélectionné</span>
                  <strong>{selectedPlanObj?.name || selectedPlanMeta.title}</strong>
                </div>
                <div>
                  <span>Montant</span>
                  <strong>{selectedPrice}</strong>
                </div>
                <div>
                  <span>Audience</span>
                  <strong>{selectedPlanMeta.audience}</strong>
                </div>
              </div>

              <div className="vendor-subscribe-notes">
                <div><FaIcon name="circle-info" /> Les plans gratuits sont activés immédiatement.</div>
                <div><FaIcon name="lock" /> Les plans payants demandent une validation de paiement.</div>
                <div><FaIcon name="rocket" /> Vous serez redirigé vers la configuration du profil après activation.</div>
              </div>

              {message ? <div className="vendor-subscribe-alert is-success">{message}</div> : null}
              {formError ? <div className="vendor-subscribe-alert is-error">{formError}</div> : null}

              <button className="btn btn-primary btn-lg w-100" type="submit" disabled={submitting || !selectedPlan}>
                {submitting ? 'Envoi...' : `S’abonner à ${selectedPlanObj?.name || selectedPlanMeta.title}`}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}
