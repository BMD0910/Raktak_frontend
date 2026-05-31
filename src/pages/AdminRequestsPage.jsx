import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { adminService } from '../services/adminService';

function statusUnlocalized(status) {
  const map = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Rejetée', cancelled: 'Annulée', completed: 'Complétée' };
  return map[status?.toLowerCase()] || status;
}

function statusColor(status) {
  const map = {
    pending: '#f97316',
    accepted: '#3b82f6',
    rejected: '#b91c1c',
    cancelled: '#6b7280',
    completed: '#16a34a'
  };
  return map[status?.toLowerCase()] || '#6b7280';
}

export default function AdminRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailRequest, setDetailRequest] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminService.getRequestsPaged({ page, limit, status: statusFilter !== 'all' ? statusFilter : null, search: search || null })
      .then((res) => {
        if (!mounted) return;
        setRequests(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0, limit });
      })
      .catch((e) => setError(e?.userMessage || e?.message || 'Erreur'))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [page, limit, statusFilter, search]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const totalPages = Math.max(pagination?.pages || 0, 1);

  const handleExportCSV = () => {
    const headers = ['ID', 'Client', 'Prestataire', 'Service', 'Statut', 'Date créée'];
    const rows = requests.map(r => [r.id, r.client_email, r.vendor_email, r.service_title, r.status, r.created_at]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `demandes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      <h1 className="display-sm">Gestion des demandes</h1>
      <p style={{ marginTop: 8, marginBottom: 18, color: 'var(--text-muted)' }}>Demandes de services des clients</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Recherche</label>
          <input
            type="text"
            placeholder="Client, prestataire, service..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8 }}
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8 }}
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Rejetées</option>
            <option value="completed">Complétées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>📥 Exporter CSV</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {requests.length === 0 ? (
          <div className="card p-16">Aucune demande trouvée.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {requests.map(r => (
              <div key={r.id} className="card p-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Demande #{r.id}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.client_email} → {r.vendor_email}</div>
                  <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>{r.service_title}</div>
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: statusColor(r.status) }}>
                    {statusUnlocalized(r.status)}
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setDetailRequest(r)}>Détail</button>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ color: 'var(--text-muted)' }}>Total: {pagination.total}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" disabled={pagination.page <= 1} onClick={() => setPage(page - 1)}>Préc.</button>
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-muted)' }}>{pagination.page} / {totalPages}</div>
                <button className="btn btn-ghost" disabled={pagination.page >= totalPages} onClick={() => setPage(page + 1)}>Suiv.</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detailRequest && (
        <ConfirmModal
          open={Boolean(detailRequest)}
          title={`Demande #${detailRequest.id}`}
          onCancel={() => setDetailRequest(null)}
          onConfirm={() => setDetailRequest(null)}
          confirmText="Fermer"
          cancelText=""
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <div><strong>Statut:</strong> <span style={{ color: statusColor(detailRequest.status), fontWeight: 700 }}>{statusUnlocalized(detailRequest.status)}</span></div>
            <div><strong>Client:</strong> {detailRequest.client_name} ({detailRequest.client_email})</div>
            <div><strong>Prestataire:</strong> {detailRequest.vendor_name} ({detailRequest.vendor_email})</div>
            <div><strong>Service:</strong> {detailRequest.service_title}</div>
            <div><strong>Description:</strong> {detailRequest.description || 'Non renseignée'}</div>
            <div><strong>Date créée:</strong> {new Date(detailRequest.created_at).toLocaleDateString('fr-FR')}</div>
            <div><strong>Dernière mise à jour:</strong> {new Date(detailRequest.updated_at).toLocaleDateString('fr-FR')}</div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
