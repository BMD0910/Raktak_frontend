import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { marketplaceService } from '../services/marketplaceService';
import { useNavigate } from 'react-router-dom';
import FaIcon from '../components/common/FaIcon';

function parseSkills(value) {
  return String(value || '')
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function VendorProfilePage() {
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
  const addSkill = () => {
    const next = skillsInput.trim();
    if (!next) return;
    setForm((prev) => ({ ...prev, skills: prev.skills.includes(next) ? prev.skills : [...prev.skills, next] }));
    setSkillsInput('');
  };
  const removeSkill = (skill) => setForm((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }));
  const handleSkillsKeyDown = (event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await marketplaceService.updateVendorProfile(form);
      await refreshVendorStatus();
      setMessage('Profil mis à jour avec succès');
      setTimeout(() => navigate('/dashboard/vendor', { replace: true }), 700);
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.message || 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)', paddingBottom: 32 }}>
      <div className="row">
        <aside className="col-lg-4 mb-3">
          <div className="card p-3 text-center">
            <div className="mb-3">
              {form.avatar && form.avatar.startsWith('http') ? (
                <img src={form.avatar} alt="avatar" className="rounded-circle" style={{ width: 110, height: 110, objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 110, height: 110, background: 'rgba(255,90,31,0.08)', color: 'var(--brand-primary)', fontSize: 36 }}><FaIcon name={form.avatar || 'user'} /></div>
              )}
            </div>
            <h5 className="fw-bold mb-1">{profile?.name || profile?.companyName}</h5>
            <div className="text-muted mb-2">{form.profession}</div>
            <div className="d-flex justify-content-center gap-2 mb-2">
              <FaIcon name="phone" className="me-1" style={{ color: 'var(--brand-primary)' }} /> <small>{form.phone}</small>
            </div>
            <div className="text-muted small mb-2">{form.location}</div>
            <div className="d-grid">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/dashboard/vendor')}>Tableau de bord</button>
            </div>
          </div>
        </aside>

        <main className="col-lg-8">
          <div className="card p-3">
            <h3 className="mb-1">Mon profil prestataire</h3>
            <p className="text-muted mb-3">Consultez et modifiez toutes vos informations publiques.</p>

            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Profession</label>
                  <input className="form-control" value={form.profession} onChange={(e) => update('profession', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Téléphone</label>
                  <input className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} required />
                </div>

                <div className="col-12">
                  <label className="form-label">Compétences</label>
                  <div className="d-flex gap-2">
                    <input className="form-control" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} onKeyDown={handleSkillsKeyDown} placeholder="Ex: Design graphique" />
                    <button className="btn btn-secondary" type="button" onClick={addSkill} style={{ minWidth: 120 }}>Ajouter</button>
                  </div>
                  <div className="mt-3">
                    {form.skills.map((skill) => (
                      <span key={skill} className="badge rounded-pill me-2 mb-2" style={{ background: 'rgba(14,165,233,0.10)', color: 'var(--brand-primary)', border: '1px solid rgba(14,165,233,0.20)', padding: '.5rem .7rem' }}>
                        {skill} <button type="button" onClick={() => removeSkill(skill)} aria-label={`Supprimer ${skill}`} className="btn btn-sm btn-link p-0 ms-2" style={{ color: 'inherit' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Expérience</label>
                  <textarea className="form-control" rows={4} value={form.experience} onChange={(e) => update('experience', e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Localisation</label>
                  <input className="form-control" value={form.location} onChange={(e) => update('location', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Avatar</label>
                  <input className="form-control" value={form.avatar} onChange={(e) => update('avatar', e.target.value)} placeholder="user ou URL" />
                </div>

                <div className="col-12">
                  <label className="form-label">Portfolio URL</label>
                  <input className="form-control" value={form.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)} placeholder="https://..." />
                </div>

                <div className="col-12">
                  <label className="form-label">Réseaux sociaux</label>
                  <textarea className="form-control" rows={3} value={form.socialLinks} onChange={(e) => update('socialLinks', e.target.value)} placeholder="Instagram, LinkedIn, Facebook..." />
                </div>

                <div className="col-12">
                  {message ? <div className="text-success mb-2">{message}</div> : null}
                  {error ? <div className="text-danger mb-2">{error}</div> : null}
                  <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}</button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
