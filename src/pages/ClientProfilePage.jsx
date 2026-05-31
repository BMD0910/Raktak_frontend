import { useEffect, useState } from 'react';
import { useAsyncData } from '../hooks/useAsyncData';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

export default function ClientProfilePage() {
  const { data, loading, error } = useAsyncData(() => userService.getUserProfile(), []);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', avatar: 'user' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!data) return;
    setForm({
      fullName: data.fullName || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar: data.avatar || 'user'
    });
  }, [data]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setSaving(true);
    try {
      await userService.saveUserProfile(form);
      setFeedback('Profil enregistré avec succès.');
    } catch (_) {
      setFeedback('Échec de la sauvegarde du profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 28px)', paddingBottom: 32 }}>
      <div className="card p-24" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Mon profil</h1>
        <p style={{ color: 'var(--text-muted)' }}>Mettez à jour vos informations client.</p>
      </div>

      <form className="card p-24" onSubmit={onSubmit}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '2rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
            {form.avatar && typeof form.avatar === 'string' && form.avatar.startsWith('http') ? (
              <img src={form.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <FaIcon name={form.avatar || 'user'} style={{ fontSize: '1.6rem' }} />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input className="form-input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+221 ..." />
          </div>
          <div className="form-group">
            <label className="form-label">Avatar (icon name ou URL)</label>
            <input className="form-input" value={form.avatar} onChange={(e) => update('avatar', e.target.value)} placeholder="user ou URL" />
          </div>
        </div>

        {feedback ? (
          <p style={{ color: feedback.includes('succès') ? '#047857' : '#b91c1c', marginBottom: 12 }}>{feedback}</p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
