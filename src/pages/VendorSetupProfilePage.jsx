import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { marketplaceService } from '../services/marketplaceService';
import { getAuthErrorMessage } from '../utils/authError';

function parseSkills(value) {
  return String(value || '')
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function VendorSetupProfilePage() {
  const navigate = useNavigate();
  const { profile, refreshVendorStatus } = useAuth();
  const [skillsInput, setSkillsInput] = useState('');
  const [form, setForm] = useState({
    profession: profile?.profession || '',
    description: profile?.description || '',
    skills: parseSkills(profile?.skills),
    experience: profile?.experience || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    portfolioUrl: profile?.portfolioUrl || '',
    socialLinks: profile?.socialLinks || '',
    avatar: profile?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = () => ({
    profession: String(form.profession || '').trim(),
    description: String(form.description || '').trim(),
    skills: Array.isArray(form.skills) ? form.skills.map((skill) => String(skill || '').trim()).filter(Boolean) : [],
    experience: String(form.experience || '').trim(),
    phone: String(form.phone || '').trim(),
    location: String(form.location || '').trim(),
    portfolioUrl: String(form.portfolioUrl || '').trim(),
    socialLinks: String(form.socialLinks || '').trim(),
    avatar: String(form.avatar || '').trim()
  });

  const addSkill = () => {
    const next = skillsInput.trim();
    if (!next) return;
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(next) ? prev.skills : [...prev.skills, next]
    }));
    setSkillsInput('');
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill)
    }));
  };

  const handleSkillsKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = buildPayload();
    if (!payload.skills.length) {
      setError('Ajoutez au moins une compétence.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await marketplaceService.setupVendorProfile(payload);
      await refreshVendorStatus();
      setMessage('Profil prestataire complété avec succès');
      setTimeout(() => navigate('/create-service', { replace: true }), 700);
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const details = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(' · ');
        setError(details || getAuthErrorMessage(err, 'Impossible de sauvegarder le profil prestataire'));
      } else {
        setError(getAuthErrorMessage(err, 'Impossible de sauvegarder le profil prestataire'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ maxWidth: 880, paddingTop: 24, paddingBottom: 32 }}>
        <div className="card p-32">
          <h1 className="display-sm" style={{ marginBottom: 10 }}>Compléter le profil prestataire</h1>
          <p className="text-muted" style={{ marginBottom: 20 }}>Renseignez les informations nécessaires pour débloquer la création de services.</p>

          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Profession</label>
                <input className="form-input" value={form.profession} onChange={(e) => update('profession', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Compétences</label>
              <div className="form-row" style={{ alignItems: 'flex-start' }}>
                <input
                  className="form-input"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleSkillsKeyDown}
                  placeholder="Ex: Design graphique"
                />
                <button className="btn btn-secondary" type="button" onClick={addSkill} style={{ minWidth: 120 }}>
                  Ajouter
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0.55rem 0.8rem',
                      borderRadius: 999,
                      background: 'rgba(14, 165, 233, 0.10)',
                      color: 'var(--brand-primary)',
                      border: '1px solid rgba(14, 165, 233, 0.20)'
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Supprimer ${skill}`}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: 16,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expérience</label>
              <textarea className="form-input form-textarea" rows={4} value={form.experience} onChange={(e) => update('experience', e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Localisation</label>
                <input className="form-input" value={form.location} onChange={(e) => update('location', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Avatar</label>
                <input className="form-input" value={form.avatar} onChange={(e) => update('avatar', e.target.value)} placeholder="user ou URL" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio URL</label>
              <input className="form-input" value={form.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label className="form-label">Réseaux sociaux</label>
              <textarea className="form-input form-textarea" rows={3} value={form.socialLinks} onChange={(e) => update('socialLinks', e.target.value)} placeholder="Instagram, LinkedIn, Facebook..." />
            </div>

            {message ? <p style={{ color: 'var(--brand-teal)', marginBottom: 12 }}>{message}</p> : null}
            {error ? <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p> : null}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Valider le profil'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
