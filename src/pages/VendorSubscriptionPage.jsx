import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAsyncData } from '../hooks/useAsyncData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { subscriptionPlanService } from '../services/subscriptionPlanService';
import { marketplaceService } from '../services/marketplaceService';

export default function VendorSubscriptionPage() {
  const { profile, refreshVendorStatus } = useAuth();
  const { data: plans, loading, error } = useAsyncData(() => subscriptionPlanService.getPublicPlans(), []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');
  const [qrModal, setQrModal] = useState(null);

  const currentPlan = useMemo(
    () => (plans || []).find((plan) => plan.code === profile?.subscriptionPlanCode) || null,
    [plans, profile?.subscriptionPlanCode]
  );

  const changePlan = async (plan) => {
    // Vérifier si c'est une rétrogradation (payant → gratuit)
    const currentPrice = Number(currentPlan?.priceFcfa || 0);
    const newPrice = Number(plan.priceFcfa || 0);
    const isDowngrade = currentPrice > 0 && newPrice === 0;

    if (isDowngrade) {
      setFormError('Impossible de rétrograder vers un plan gratuit. Vous ne pouvez que monter en grade.');
      return;
    }

    setSaving(true);
    setMessage('');
    setFormError('');
    try {
      if (Number(plan.priceFcfa || 0) === 0) {
        // free plan, update directly
        await marketplaceService.updateVendorSubscription({ planCode: plan.code });
        await refreshVendorStatus();
        setMessage('Abonnement mis à jour avec succès');
      } else {
        // paid plan: initiate payment
        const resp = await marketplaceService.initiateSubscription({ planCode: plan.code, paymentMethod });
        if (resp.payment_url) {
          window.location.href = resp.payment_url;
          return;
        } else if (resp.qr_base64 || resp.provider_data) {
          setQrModal({
            qr: resp.qr_base64 || resp.provider_data?.qr || null,
            txId: resp.transaction_id,
            provider: resp.provider_data || null
          });
          return;
        } else {
          setFormError('Impossible de créer le paiement');
        }
      }
    } catch (err) {
      setFormError(err?.userMessage || err?.response?.data?.message || 'Impossible de modifier l’abonnement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="card p-24">
      <h2 style={{ marginBottom: 6 }}>Mon abonnement</h2>
      <p style={{ marginBottom: 18, color: 'var(--text-muted)' }}>Consultez les détails de votre formule et changez de type d’abonnement quand vous le souhaitez.</p>

      <div className="card p-20" style={{ marginBottom: 18, borderColor: 'var(--border-light)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>Abonnement actuel</div>
            <h3 style={{ marginBottom: 6 }}>{currentPlan?.name || profile?.subscriptionPlanName || 'Aucun abonnement'}</h3>
            <p style={{ marginBottom: 0, color: 'var(--text-secondary)' }}>{currentPlan?.description || '—'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{Number(currentPlan?.priceFcfa || profile?.subscriptionPlanPriceFcfa || 0).toLocaleString('fr-FR')} FCFA</div>
            <div style={{ marginTop: 8, color: profile?.subscriptionActive ? 'var(--brand-teal)' : '#b45309', fontWeight: 700 }}>{profile?.subscriptionActive ? 'Actif' : 'Inactif'}</div>
          </div>
        </div>
      </div>

      {message ? <p style={{ color: 'var(--brand-teal)', marginBottom: 12 }}>{message}</p> : null}
      {formError ? <p style={{ color: '#dc2626', marginBottom: 12 }}>{formError}</p> : null}

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 700, marginRight: 8 }}>Méthode de paiement:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="WAVE">Wave</option>
            <option value="ORANGE_QR">Orange Money (QR)</option>
            <option value="ORANGE_MAXIT">Orange Money (MaxIt)</option>
            <option value="ORANGE_OM">Orange Money (Standard)</option>
          </select>
        </div>
        {(plans || []).map((plan) => {
          const isCurrent = plan.code === profile?.subscriptionPlanCode;
          const currentPrice = Number(currentPlan?.priceFcfa || 0);
          const newPrice = Number(plan.priceFcfa || 0);
          const isDowngrade = currentPrice > 0 && newPrice === 0;
          const canChange = !isCurrent && !isDowngrade;
          
          return (
            <article key={plan.code} className="card p-20" style={{ borderColor: isCurrent ? 'var(--brand-primary)' : 'var(--border-light)', background: isCurrent ? 'rgba(14,165,233,0.06)' : 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: 8 }}>{plan.name}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 10 }}>{plan.description}</p>
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)' }}>
                    {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                </div>
                <div style={{ textAlign: 'right', minWidth: 160 }}>
                  <div style={{ fontWeight: 900, fontSize: '1.15rem' }}>{Number(plan.priceFcfa || 0).toLocaleString('fr-FR')} FCFA</div>
                  <div style={{ marginTop: 8, fontSize: '.82rem', fontWeight: 700, color: isCurrent ? 'var(--brand-primary)' : 'var(--text-muted)' }}>{isCurrent ? 'Formule actuelle' : isDowngrade ? 'Déclassement impossible' : 'Disponible'}</div>
                  <button 
                    className="btn btn-primary" 
                    type="button" 
                    disabled={saving || !canChange} 
                    onClick={() => changePlan(plan)} 
                    title={isDowngrade ? 'Impossible de rétrograder vers un plan gratuit' : ''}
                    style={{ marginTop: 12, opacity: isDowngrade ? 0.5 : 1 }}
                  >
                    {isCurrent ? 'Déjà active' : isDowngrade ? 'Déclassement bloqué' : 'Choisir cette formule'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {qrModal ? (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 18, borderRadius: 8, maxWidth: 520, width: '95%' }}>
            <h3 style={{ marginTop: 0 }}>Paiement Orange</h3>
            {qrModal.qr ? (
              <div style={{ textAlign: 'center' }}>
                <img alt="QR code" src={qrModal.qr.startsWith('data:') ? qrModal.qr : `data:image/png;base64,${qrModal.qr}`} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8 }}>{JSON.stringify(qrModal.provider, null, 2)}</pre>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn" type="button" onClick={() => setQrModal(null)}>Fermer</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
