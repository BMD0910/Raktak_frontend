import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { adminService } from '../services/adminService';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    siteName: '',
    supportEmail: '',
    supportPhone: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    auditRetentionDays: 90,
    allowNewRegistrations: true,
    allowNewVendorApplications: true
  });

  useEffect(() => {
    let mounted = true;
    adminService.getSettings()
      .then((data) => {
        if (!mounted) return;
        const next = {
          siteName: data.siteName || '',
          supportEmail: data.supportEmail || '',
          supportPhone: data.supportPhone || '',
          maintenanceMode: Boolean(data.maintenanceMode),
          maintenanceMessage: data.maintenanceMessage || '',
          auditRetentionDays: data.auditRetentionDays ?? 90,
          allowNewRegistrations: data.allowNewRegistrations ?? true,
          allowNewVendorApplications: data.allowNewVendorApplications ?? true
        };
        setForm(next);
        setInitial(next);
      })
      .catch((e) => setError(e?.userMessage || e?.message || 'Erreur de chargement'))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial || {}), [form, initial]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const saved = await adminService.saveSettings(form);
      const next = {
        siteName: saved.siteName || '',
        supportEmail: saved.supportEmail || '',
        supportPhone: saved.supportPhone || '',
        maintenanceMode: Boolean(saved.maintenanceMode),
        maintenanceMessage: saved.maintenanceMessage || '',
        auditRetentionDays: saved.auditRetentionDays ?? 90,
        allowNewRegistrations: saved.allowNewRegistrations ?? true,
        allowNewVendorApplications: saved.allowNewVendorApplications ?? true
      };
      setForm(next);
      setInitial(next);
      setSuccess('Paramètres enregistrés avec succès.');
    } catch (e) {
      setError(e?.userMessage || e?.message || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initial) setForm(initial);
    setSuccess('');
    setError('');
  };

  if (loading) return <LoadingSpinner />;
  if (error && !initial) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="display-sm">Paramètres Admin</h1>
      <p style={{ marginTop: 8, marginBottom: 18, color: 'var(--text-muted)' }}>Configuration globale de la plateforme.</p>

      {error ? <div className="card p-12" style={{ marginBottom: 12, borderColor: '#fca5a5', color: '#b91c1c' }}>{error}</div> : null}
      {success ? <div className="card p-12" style={{ marginBottom: 12, borderColor: '#86efac', color: '#166534' }}>{success}</div> : null}

      <div className="card p-16" style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Field label="Nom de la plateforme">
            <input value={form.siteName} onChange={(e) => update('siteName', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email support">
            <input type="email" value={form.supportEmail} onChange={(e) => update('supportEmail', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Téléphone support">
            <input value={form.supportPhone} onChange={(e) => update('supportPhone', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Rétention logs (jours)">
            <input type="number" min="7" max="3650" value={form.auditRetentionDays} onChange={(e) => update('auditRetentionDays', Number(e.target.value))} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Toggle label="Autoriser les inscriptions" checked={form.allowNewRegistrations} onChange={(v) => update('allowNewRegistrations', v)} />
          <Toggle label="Autoriser les demandes vendeurs" checked={form.allowNewVendorApplications} onChange={(v) => update('allowNewVendorApplications', v)} />
          <Toggle label="Mode maintenance" checked={form.maintenanceMode} onChange={(v) => update('maintenanceMode', v)} />
        </div>

        <Field label="Message maintenance">
          <textarea value={form.maintenanceMessage} onChange={(e) => update('maintenanceMessage', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </Field>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={handleReset} disabled={!dirty || saving}>Réinitialiser</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--border-light)', borderRadius: 12, background: 'var(--bg-surface)' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ fontWeight: 600 }}>{label}</span>
    </label>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border-light)',
  background: 'var(--bg-surface)',
  color: 'inherit'
};
