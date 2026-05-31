import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { adminService } from '../services/adminService';
import FaIcon from '../components/common/FaIcon';

export default function AdminClientsList() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailClient, setDetailClient] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminService.getUsersPaged({ page, limit, role: 'client' }).then((res) => {
      if (!mounted) return;
      setClients(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0, limit });
    }).catch((e) => setError(e?.userMessage || e?.message || 'Erreur')).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [page, limit]);

  const onOpenModal = (user) => {
    setSelected(user);
    setReason('');
    setModalOpen(true);
  };

  const onCancel = () => {
    setModalOpen(false);
    setSelected(null);
    setReason('');
  };

  const onConfirm = async () => {
    if (!selected) return;
    const target = selected.account_status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(selected.id, target, { reason });
      setClients(clients.map(v => v.id === selected.id ? { ...v, account_status: target } : v));
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      alert(err?.userMessage || err?.message || 'Erreur');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const filtered = clients.filter((c) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'suspended') return c.account_status === 'suspended' || c.account_status === 'inactive';
    if (statusFilter === 'active') return c.account_status === 'active';
    return true;
  });

  const searched = filtered.filter((client) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return [client.full_name, client.email, client.city, client.country, client.plan, client.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  const statusMeta = (status) => {
    const active = status === 'active';
    return active
      ? { label: 'Non suspendu', className: 'bg-success', icon: 'check' }
      : { label: 'Suspendu', className: 'bg-danger', icon: 'ban' };
  };

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 20px)', paddingBottom: 24 }}>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h1 className="h4 mb-1">Liste des clients</h1>
          <p className="text-muted mb-0">Gestion et consultation des comptes clients.</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          <div className="input-group" style={{ minWidth: 260 }}>
            <span className="input-group-text"><FaIcon name="magnifying-glass" /></span>
            <input
              type="search"
              className="form-control"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm ? (
              <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
                <FaIcon name="times" />
              </button>
            ) : null}
          </div>
          <label htmlFor="client-status-filter" className="fw-semibold">Filtrer</label>
          <select
            id="client-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ minWidth: 170 }}
          >
            <option value="all">Tous</option>
            <option value="active">Non suspendus</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>
      </div>

      {searched.length === 0 ? (
        <div className="alert alert-info">Aucun client trouvé.</div>
      ) : (
        <div className="row g-3">
          {searched.map(v => {
            const meta = statusMeta(v.account_status);
            return (
              <div className="col-12 col-lg-6" key={v.id}>
                <div className="card h-100 p-0 overflow-hidden">
                  <div className="card-header" style={{ padding: '16px 16px 12px', marginBottom: 0 }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 52, height: 52, background: 'rgba(255,90,31,0.08)', color: 'var(--brand-primary)', fontSize: 20 }}>
                        <FaIcon name={v.account_status === 'active' ? 'user' : 'triangle-exclamation'} />
                      </div>
                      <div>
                        <div className="fw-bold">{v.full_name || v.email}</div>
                        <div className="text-muted small">{v.email} {v.city ? `• ${v.city}` : ''}</div>
                      </div>
                    </div>
                    <span className={`badge ${meta.className}`}><FaIcon name={meta.icon} className="me-1" />{meta.label}</span>
                  </div>

                  <div className="card-body" style={{ padding: '0 16px 16px' }}>
                    <div className="row g-2 small">
                      <div className="col-6"><span className="text-muted d-block">Téléphone</span><strong>{v.phone || '-'}</strong></div>
                      <div className="col-6"><span className="text-muted d-block">Pays</span><strong>{v.country || '-'}</strong></div>
                      <div className="col-6"><span className="text-muted d-block">Plan</span><strong>{v.plan || '-'}</strong></div>
                      <div className="col-6"><span className="text-muted d-block">Ville</span><strong>{v.city || '-'}</strong></div>
                    </div>
                  </div>

                  <div className="card-footer" style={{ padding: '12px 16px 16px', marginTop: 0 }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setDetailClient(v)}>
                      <FaIcon name="circle-info" className="me-1" /> Détail
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onOpenModal(v)}>
                      <FaIcon name={v.account_status === 'active' ? 'ban' : 'rotate-right'} className="me-1" />
                      {v.account_status === 'active' ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
        <div className="text-muted">Total: {pagination.total}</div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm" disabled={pagination.page <= 1} onClick={() => setPage(page - 1)}>Préc.</button>
          <div className="px-3 py-2 rounded-3" style={{ background: 'var(--bg-subtle)' }}>{pagination.page} / {pagination.pages}</div>
          <button className="btn btn-outline-secondary btn-sm" disabled={pagination.page >= pagination.pages} onClick={() => setPage(page + 1)}>Suiv.</button>
        </div>
      </div>

      <ConfirmModal open={modalOpen} title={selected ? (selected.account_status === 'active' ? 'Désactiver le compte' : 'Réactiver le compte') : 'Confirmer'} onCancel={onCancel} onConfirm={onConfirm}>
        <div>
          <div style={{ marginBottom: 8 }}><strong>{selected?.email}</strong></div>
          <label style={{ display: 'block', marginBottom: 6 }}>Motif (optionnel)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} style={{ width: '100%' }} />
        </div>
      </ConfirmModal>

      {detailClient && (
        <ConfirmModal
          open={Boolean(detailClient)}
          title="Détails du client"
          onCancel={() => setDetailClient(null)}
          onConfirm={() => setDetailClient(null)}
          confirmText="Fermer"
          cancelText=""
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>Nom:</strong> {detailClient.full_name || '-'}</div>
            <div><strong>Email:</strong> {detailClient.email || '-'}</div>
            <div><strong>Téléphone:</strong> {detailClient.phone || '-'}</div>
            <div><strong>Ville:</strong> {detailClient.city || '-'}</div>
            <div><strong>Pays:</strong> {detailClient.country || '-'}</div>
            <div><strong>Plan:</strong> {detailClient.plan || '-'}</div>
            <div><strong>Statut:</strong> {detailClient.account_status || '-'}</div>
            <div><strong>Motif suspension:</strong> {detailClient.deactivation_reason || 'Non renseigné'}</div>
            <div><strong>Contact désactivation:</strong> {detailClient.deactivation_contact || 'Non renseigné'}</div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
