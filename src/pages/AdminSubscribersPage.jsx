import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { adminService } from '../services/adminService';
import FaIcon from '../components/common/FaIcon';

function statusMeta(status) {
  const active = status === 'active';
  return active
    ? { label: 'Actif', className: 'bg-success', icon: 'check' }
    : { label: 'Suspendu', className: 'bg-danger', icon: 'ban' };
}

export default function AdminSubscribersPage() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailSubscriber, setDetailSubscriber] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminService.getUsersPaged({ page, limit, role: 'vendor' }).then((res) => {
      if (!mounted) return;
      setSubscribers(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0, limit });
    }).catch((e) => setError(e?.userMessage || e?.message || 'Erreur')).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [page, limit]);

  const openModal = (subscriber) => {
    setSelected(subscriber);
    setReason('');
    setModalOpen(true);
  };

  const cancelModal = () => {
    setModalOpen(false);
    setSelected(null);
    setReason('');
  };

  const confirmModal = async () => {
    if (!selected) return;
    const target = selected.account_status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(selected.id, target, { reason });
      setSubscribers(subscribers.map((v) => (v.id === selected.id ? { ...v, account_status: target } : v)));
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      alert(err?.userMessage || err?.message || 'Erreur');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const filtered = subscribers.filter((subscriber) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'suspended') return subscriber.account_status === 'suspended' || subscriber.account_status === 'inactive';
    if (statusFilter === 'active') return subscriber.account_status === 'active';
    return true;
  });

  const searched = filtered.filter((subscriber) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return [subscriber.full_name, subscriber.company_name, subscriber.email, subscriber.city, subscriber.country, subscriber.plan, subscriber.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 20px)', paddingBottom: 24 }}>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h1 className="h4 mb-1">Abonnés</h1>
          <p className="text-muted mb-0">Gestion des vendeurs abonnés et de leur statut.</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          <div className="input-group" style={{ minWidth: 260 }}>
            <span className="input-group-text"><FaIcon name="magnifying-glass" /></span>
            <input
              type="search"
              className="form-control"
              placeholder="Rechercher un abonné..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm ? (
              <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
                <FaIcon name="times" />
              </button>
            ) : null}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ minWidth: 170 }}
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>
      </div>

      {searched.length === 0 ? (
        <div className="alert alert-info">Aucun abonné trouvé.</div>
      ) : (
        <div className="row g-3">
          {searched.map((subscriber) => {
            const meta = statusMeta(subscriber.account_status);
            return (
              <div className="col-12 col-lg-6" key={subscriber.id}>
                <div className="card h-100 p-0 overflow-hidden">
                  <div className="card-header" style={{ padding: '16px 16px 12px', marginBottom: 0 }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 52, height: 52, background: 'rgba(255,90,31,0.08)', color: 'var(--brand-primary)', fontSize: 20 }}>
                        <FaIcon name={subscriber.account_status === 'active' ? 'building' : 'triangle-exclamation'} />
                      </div>
                      <div>
                        <div className="fw-bold">{subscriber.full_name || subscriber.company_name || subscriber.email}</div>
                        <div className="text-muted small">{subscriber.email} {subscriber.city ? `• ${subscriber.city}` : ''}</div>
                      </div>
                    </div>
                    <span className={`badge ${meta.className}`}><FaIcon name={meta.icon} className="me-1" />{meta.label}</span>
                  </div>

                  <div className="card-body" style={{ padding: '0 16px 16px' }}>
                    <div className="row g-2 small">
                      <div className="col-6"><span className="text-muted d-block">Téléphone</span><strong>{subscriber.phone || '-'}</strong></div>
                      <div className="col-6"><span className="text-muted d-block">Pays</span><strong>{subscriber.country || '-'}</strong></div>
                      <div className="col-6"><span className="text-muted d-block">Plan</span><strong>{subscriber.plan || '-'}</strong></div>
                      <div className="col-6"><span className="text-muted d-block">Ville</span><strong>{subscriber.city || '-'}</strong></div>
                    </div>
                  </div>

                  <div className="card-footer" style={{ padding: '12px 16px 16px', marginTop: 0 }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setDetailSubscriber(subscriber)}>
                      <FaIcon name="circle-info" className="me-1" /> Détail
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => openModal(subscriber)}>
                      <FaIcon name={subscriber.account_status === 'active' ? 'ban' : 'rotate-right'} className="me-1" />
                      {subscriber.account_status === 'active' ? 'Désactiver' : 'Réactiver'}
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

      <ConfirmModal open={modalOpen} title={selected ? (selected.account_status === 'active' ? 'Désactiver le compte' : 'Réactiver le compte') : 'Confirmer'} onCancel={cancelModal} onConfirm={confirmModal}>
        <div>
          <div style={{ marginBottom: 8 }}><strong>{selected?.email}</strong></div>
          <label style={{ display: 'block', marginBottom: 6 }}>Motif (optionnel)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} style={{ width: '100%' }} />
        </div>
      </ConfirmModal>

      {detailSubscriber && (
        <ConfirmModal
          open={Boolean(detailSubscriber)}
          title="Détails de l'abonné"
          onCancel={() => setDetailSubscriber(null)}
          onConfirm={() => setDetailSubscriber(null)}
          confirmText="Fermer"
          cancelText=""
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>Nom:</strong> {detailSubscriber.full_name || detailSubscriber.company_name || '-'}</div>
            <div><strong>Email:</strong> {detailSubscriber.email || '-'}</div>
            <div><strong>Téléphone:</strong> {detailSubscriber.phone || '-'}</div>
            <div><strong>Ville:</strong> {detailSubscriber.city || '-'}</div>
            <div><strong>Pays:</strong> {detailSubscriber.country || '-'}</div>
            <div><strong>Plan:</strong> {detailSubscriber.plan || '-'}</div>
            <div><strong>Statut:</strong> {detailSubscriber.account_status || '-'}</div>
            <div><strong>Motif suspension:</strong> {detailSubscriber.deactivation_reason || 'Non renseigné'}</div>
            <div><strong>Contact désactivation:</strong> {detailSubscriber.deactivation_contact || 'Non renseigné'}</div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}