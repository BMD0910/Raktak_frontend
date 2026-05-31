import { useState } from 'react';
import { sanitizeText, sanitizeEmail } from '../utils/sanitize';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (event) => {
    event.preventDefault();
    setForm({
      name: sanitizeText(form.name),
      email: sanitizeEmail(form.email),
      message: sanitizeText(form.message)
    });
    setSent(true);
  };

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="display-sm" style={{ marginBottom: 10 }}>Contact</h1>
        <p className="text-muted" style={{ marginBottom: 20 }}>Notre équipe vous répond rapidement.</p>
        <form className="card p-32" onSubmit={submit}>
          <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" rows={5} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required /></div>
          {sent ? <p style={{ color: 'var(--brand-teal)', marginBottom: 12 }}>Message envoyé avec succès.</p> : null}
          <button className="btn btn-primary" type="submit">Envoyer</button>
        </form>
      </div>
    </section>
  );
}
