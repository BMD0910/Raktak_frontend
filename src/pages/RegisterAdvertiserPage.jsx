import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authError';

const ADVERTISER_BENEFITS = [
  { icon: '⟡', title: 'Campagnes rapides', text: 'Lancez vos demandes en quelques minutes avec un parcours clair.' },
  { icon: '✓', title: 'Suivi centralisé', text: 'Gardez une vision nette de vos comptes, objectifs et contacts.' },
  { icon: '★', title: 'Support professionnel', text: 'Profitez d’un espace pensé pour les besoins des annonceurs.' }
];

export default function RegisterAdvertiserPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', company: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Les mots de passe ne correspondent pas.');
    if (form.password.length < 8) return setError('Mot de passe trop court.');
    setLoading(true);
    try {
      const registered = await register({ email: form.email.trim(), password: form.password, fullName: form.fullName.trim() || form.company.trim() });
      navigate(registered?.dashboardPath || '/account', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Inscription impossible'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--split">
      <div className="auth-visual">
        <div className="auth-visual-card">
          <Link to="/" className="logo" style={{ color: '#fff', marginBottom: 24, display: 'inline-flex' }}>
            <div className="logo-mark">R</div>
            <span style={{ fontWeight: 900, letterSpacing: '.02em' }}>Raktakk</span>
          </Link>

          <div className="auth-kicker">Compte annonceur</div>
          <h1 className="auth-title">Lancez vos campagnes avec un compte professionnel.</h1>
          <p className="auth-lead">
            Créez votre espace annonceur pour gérer vos demandes, vos paramètres de marque et votre relation avec les prestataires.
          </p>

          <div className="auth-feature-list">
            {ADVERTISER_BENEFITS.map((item) => (
              <div className="auth-feature-item" key={item.title}>
                <div className="auth-feature-icon">{item.icon}</div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-metric-grid">
            <div className="auth-metric"><div className="auth-metric-value">Rapide</div><div className="auth-metric-label">Mise en route</div></div>
            <div className="auth-metric"><div className="auth-metric-value">Pro</div><div className="auth-metric-label">Positionnement</div></div>
            <div className="auth-metric"><div className="auth-metric-value">100%</div><div className="auth-metric-label">Centralisé</div></div>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <form onSubmit={submit} className="auth-card">
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: 8 }}>Créer un compte annonceur</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>Démarrez vos campagnes sur Raktakk.</p>
          </div>

          <div className="form-group"><label className="form-label">Nom complet</label><input className="form-input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required autoComplete="name" /></div>
          <div className="form-group"><label className="form-label">Entreprise</label><input className="form-input" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Nom de société" autoComplete="organization" /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={(e) => update('email', e.target.value)} required autoComplete="email" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Mot de passe</label><input type="password" className="form-input" value={form.password} onChange={(e) => update('password', e.target.value)} required autoComplete="new-password" /></div>
            <div className="form-group"><label className="form-label">Confirmation</label><input type="password" className="form-input" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required autoComplete="new-password" /></div>
          </div>
          {error ? <div className="auth-alert" style={{ marginBottom: 12 }}>{error}</div> : null}
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer le compte annonceur'}</button>
          <p className="auth-footer">Déjà inscrit ? <Link to="/login" className="auth-link">Connexion</Link></p>
        </form>
      </div>
    </div>
  );
}
