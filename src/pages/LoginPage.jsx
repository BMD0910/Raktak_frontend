import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authError';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => Boolean(email.trim() && password.trim() && !loading), [email, password, loading]);

  useEffect(() => {
    const saved = localStorage.getItem('raktakk_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await login(normalizedEmail, password);
      if (rememberMe) localStorage.setItem('raktakk_remember_email', normalizedEmail);
      else localStorage.removeItem('raktakk_remember_email');

      navigate(data.dashboardPath || '/account', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Connexion impossible'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--studio">
      <div className="auth-shell">
        <div className="auth-topbar">
          <Link to="/" className="logo">
            <div className="logo-mark">R</div>
            <div className="logo-text">
              <span className="logo-name">Raktakk</span>
              <span className="logo-tagline">Plateforme professionnelle</span>
            </div>
          </Link>

          <div className="auth-topbar-actions">
            <span className="auth-topbar-pill">Connexion sécurisée</span>
            <Link to="/register-client" className="btn btn-ghost btn-sm">Créer un compte</Link>
          </div>
        </div>

        <div className="auth-form-panel auth-form-panel--centered">
          <div className="auth-card auth-card--wide auth-card--centered">
            <div className="auth-form-support">
              <div>
                <h2 className="auth-form-title">Connexion</h2>
                <p className="auth-form-subtitle">Accédez à votre espace Raktakk</p>
              </div>
              <span className="auth-topbar-pill">Retour rapide</span>
            </div>

            <div className="auth-social-grid">
              <a className="auth-social-btn" href={authService.googleLoginUrl()}>
                Continuer avec Google
              </a>
            </div>

            <div className="auth-sep">ou avec votre email</div>

            <form onSubmit={onSubmit}>
              <div className="auth-form-sections">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    inputMode="email"
                    placeholder="nom@entreprise.com"
                    required
                  />
                  <div className="auth-field-hint">Utilisez l’adresse associée à votre compte Raktakk.</div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>Mot de passe</span>
                    <Link to="/reset-password" className="auth-link" style={{ fontSize: '.85rem' }}>Mot de passe oublié ?</Link>
                  </label>
                  <div className="auth-password">
                    <input
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      style={{ paddingRight: 92 }}
                    />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                      {showPassword ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  <div className="auth-field-hint">Votre mot de passe reste confidentiel et n’est jamais affiché par défaut.</div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span style={{ fontSize: '.9rem', color: '#374151' }}>Se souvenir de moi</span>
                </label>
              </div>

              {error ? <div className="auth-alert" style={{ marginBottom: 14, marginTop: 8 }}>{error}</div> : null}

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={!canSubmit}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="auth-footer">
              Pas encore de compte ? <Link to="/register-client" className="auth-link">S'inscrire gratuitement</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
