import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';

export default function NewRequestPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();

  const serviceId = Number(params.get('serviceId') || 1);
  const serviceTitle = params.get('serviceTitle') || 'Service';
  const vendorName = params.get('vendorName') || 'Prestataire';
  const price = params.get('price') || 'Sur devis';

  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loginRedirect = useMemo(() => {
    const qs = new URLSearchParams({
      serviceId: String(serviceId),
      serviceTitle,
      vendorName,
      price
    }).toString();
    return `/new-request?${qs}`;
  }, [serviceId, serviceTitle, vendorName, price]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const clean = description.trim();
    if (!clean) {
      setError('La description est requise.');
      return;
    }

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(loginRedirect)}`);
      return;
    }

    setSubmitting(true);
    try {
      await orderService.createOrder(serviceId, clean);
      setSuccess('Demande envoyée avec succès.');
      setTimeout(() => navigate('/account/requests'), 900);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Impossible d’envoyer la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 40, maxWidth: 860 }}>
        <h1 className="display-sm" style={{ marginBottom: 8 }}>Nouvelle demande</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>Décris ton besoin pour ce service.</p>

        <div className="card p-20" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{serviceTitle}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Prestataire: {vendorName}</div>
          <div style={{ color: 'var(--brand-primary)', fontWeight: 700, marginTop: 6 }}>Tarif: {price}</div>
        </div>

        <form className="card p-20" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: J’ai besoin d’une prestation sur 1 mois..."
              required
            />
          </div>

          {error ? <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p> : null}
          {success ? <p style={{ color: 'var(--brand-teal)', marginBottom: 12 }}>{success}</p> : null}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to="/services" className="btn btn-secondary">Annuler</Link>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
