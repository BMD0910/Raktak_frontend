import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authError';

export default function RegisterClientPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
    tos: false
  });

  const step1Complete = useMemo(
    () => Boolean(
      form.firstName.trim()
      && form.lastName.trim()
      && form.email.trim()
      && form.phone.trim()
      && form.city.trim()
    ),
    [form.firstName, form.lastName, form.email, form.phone, form.city]
  );

  const passwordsMatch = useMemo(
    () => form.password.length > 0 && form.password === form.confirmPassword,
    [form.password, form.confirmPassword]
  );

  const passwordScore = useMemo(() => {
    const value = form.password || '';
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score >= 4) return { label: 'Solide', tone: 'good' };
    if (score >= 2) return { label: 'Moyen', tone: 'warn' };
    return { label: 'Faible', tone: 'bad' };
  }, [form.password]);

  const step2Complete = useMemo(
    () => Boolean(form.password.length >= 8 && passwordsMatch && form.tos),
    [form.password.length, passwordsMatch, form.tos]
  );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setError('');
    if (form.password.length < 8) return setError('Mot de passe trop court (8 caractères minimum).');
    if (form.password !== form.confirmPassword) return setError('Les mots de passe ne correspondent pas.');
    if (!form.tos) return setError('Veuillez accepter les conditions.');

    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const registered = await register({ email: form.email.trim(), password: form.password, fullName });
      navigate(registered?.dashboardPath || '/account', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Inscription impossible'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (step === 1) {
      if (!step1Complete) {
        setError('Veuillez compléter tous les champs de la première étape.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    await submit();
  };

  return (
    <div className="auth-page auth-page--studio">
      <div className="auth-shell">
        <div className="auth-topbar">
          <Link to="/" className="logo">
            <div className="logo-mark">R</div>
            <div className="logo-text">
              <span className="logo-name">Raktakk</span>
              <span className="logo-tagline">Création de compte client</span>
            </div>
          </Link>

          <div className="auth-topbar-actions">
            <span className="auth-topbar-pill">Inscription en 2 étapes</span>
            <Link className="btn btn-ghost btn-sm" to="/login">Connexion</Link>
          </div>
        </div>

        <div className="auth-form-panel auth-form-panel--centered">
          <form className="auth-card auth-card--wide auth-card--centered" onSubmit={onSubmit}>
            <div className="auth-form-support">
              <div>
                <h2 className="auth-form-title">Créer mon compte client</h2>
                <p className="auth-form-subtitle">Inscription gratuite et rapide.</p>
              </div>
              <span className="auth-topbar-pill">Étape {step}/2</span>
            </div>

            <div className="auth-stepper" aria-hidden="true">
              <div className={`auth-step ${step >= 1 ? 'is-active' : ''}`} />
              <div className={`auth-step ${step >= 2 ? 'is-active' : ''}`} />
            </div>

            {step === 1 ? (
              <div className="auth-form-sections">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} autoComplete="given-name" placeholder="Aminata" /></div>
                  <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} autoComplete="family-name" placeholder="Diop" /></div>
                </div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" placeholder="nom@exemple.com" inputMode="email" /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+221 ..." autoComplete="tel" inputMode="tel" /></div>
                  <div className="form-group"><label className="form-label">Ville</label><input className="form-input" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Dakar" /></div>
                </div>
                <div className="auth-field-hint">Ces informations servent à personnaliser votre espace client.</div>
                <button className="btn btn-primary w-full" type="submit" disabled={!step1Complete}>Continuer →</button>
              </div>
            ) : (
              <div className="auth-form-sections">
                <div className="form-group">
                  <label className="form-label">Mot de passe</label>
                  <input className="form-input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" placeholder="8 caractères minimum" />
                  <div className="auth-password-meter">
                    <div className={`auth-password-meter-bar auth-password-meter-bar--${passwordScore.tone}`} data-tone={passwordScore.tone} />
                    <span className="auth-field-hint">Niveau de sécurité : {passwordScore.label}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input className="form-input" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} autoComplete="new-password" placeholder="Répétez le mot de passe" />
                  {form.confirmPassword ? (
                    <div className={`auth-field-hint ${passwordsMatch ? 'is-ok' : 'is-error'}`}>
                      {passwordsMatch ? 'Les mots de passe correspondent.' : 'Les mots de passe ne correspondent pas.'}
                    </div>
                  ) : null}
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                  <input type="checkbox" checked={form.tos} onChange={(e) => update('tos', e.target.checked)} />
                  <span style={{ fontSize: '.9rem', color: '#374151', lineHeight: 1.5 }}>
                    J'accepte les <Link to="/terms" className="auth-link">CGU</Link> et la <Link to="/privacy" className="auth-link">Politique de confidentialité</Link>.
                  </span>
                </label>
                <div className="auth-field-hint">En validant, vous créez votre compte client personnel sur la plateforme.</div>
                {error ? <div className="auth-alert" style={{ marginBottom: 12 }}>{error}</div> : null}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" type="button" onClick={() => setStep(1)}>← Retour</button>
                  <button className="btn btn-primary" type="submit" style={{ flex: 1, minWidth: 180 }} disabled={loading || !step2Complete}>{loading ? 'Création...' : 'Créer mon compte'}</button>
                </div>
              </div>
            )}

            <p className="auth-footer">
              Déjà un compte ? <Link to="/login" className="auth-link">Connexion</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
