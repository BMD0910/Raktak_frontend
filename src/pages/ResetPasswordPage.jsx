import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 480, background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
        <h1 style={{ fontWeight: 800, marginBottom: 8 }}>Réinitialiser le mot de passe</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Entrez votre email pour recevoir les instructions.</p>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {submitted ? <p style={{ color: 'var(--brand-teal)', marginBottom: 12 }}>Si un compte existe, un email a été envoyé.</p> : null}
        <button className="btn btn-primary w-full" type="submit">Envoyer</button>
        <p style={{ marginTop: 14, color: 'var(--text-muted)' }}>Retour à la <Link to="/login">connexion</Link>.</p>
      </form>
    </div>
  );
}
