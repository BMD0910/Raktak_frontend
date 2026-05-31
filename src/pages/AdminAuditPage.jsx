import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { adminService } from '../services/adminService';

export default function AdminAuditPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [filters, setFilters] = useState({
    action: '',
    target_type: '',
    admin_id: '',
    fromLocal: '',
    toLocal: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const apiFilters = {
      ...filters,
      from: filters.fromLocal ? new Date(filters.fromLocal).toISOString() : '',
      to: filters.toLocal ? new Date(filters.toLocal).toISOString() : ''
    };
    adminService.getAuditLogs(apiFilters)
      .then((result) => {
        if (!mounted) return;
        setLogs(result.logs || []);
        setPagination(result.pagination || { page: 1, pages: 1, total: 0, limit: filters.limit });
      })
      .catch((e) => { if (mounted) setError(e.userMessage || e.message || 'Erreur'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > Math.max(1, pagination.pages || 1)) return;
    setFilters({ ...filters, page: nextPage });
  };

  const handleExport = () => {
    adminService.exportAuditToCSV(logs);
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div className="container-fluid">
      <h1 className="display-sm">Historique des actions admin</h1>

      <div className="card p-3 mt-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label">Action</label>
            <select value={filters.action} onChange={(e) => handleFilterChange('action', e.target.value)} className="form-select">
              <option value="">Toutes</option>
              <option value="suspend">Suspendre</option>
              <option value="reactivate">Réactiver</option>
              <option value="deactivate">Désactiver</option>
              <option value="create">Créer</option>
              <option value="update">Modifier</option>
              <option value="delete">Supprimer</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label">Type</label>
            <select value={filters.target_type} onChange={(e) => handleFilterChange('target_type', e.target.value)} className="form-select">
              <option value="">Tous</option>
              <option value="user">Utilisateur</option>
              <option value="service">Service</option>
              <option value="request">Demande</option>
              <option value="order">Commande</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label">Admin ID</label>
            <input type="number" min="1" value={filters.admin_id} onChange={(e) => handleFilterChange('admin_id', e.target.value)} placeholder="Ex: 1" className="form-control" />
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label">Du</label>
            <input type="datetime-local" value={filters.fromLocal} onChange={(e) => handleFilterChange('fromLocal', e.target.value)} className="form-control" />
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label">Au</label>
            <input type="datetime-local" value={filters.toLocal} onChange={(e) => handleFilterChange('toLocal', e.target.value)} className="form-control" />
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label">Par page</label>
            <select value={filters.limit} onChange={(e) => handleFilterChange('limit', Number(e.target.value))} className="form-select">
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-2 d-grid">
            <button className="btn btn-primary" onClick={handleExport}>📥 Exporter CSV</button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <LoadingSpinner />
        ) : logs.length === 0 ? (
          <div className="card p-3">Aucun historique</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Action</th>
                  <th>Type</th>
                  <th>Cible ID</th>
                  <th>Admin ID</th>
                  <th>Date</th>
                  <th>Motif</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td><strong>{l.action}</strong></td>
                    <td>{l.target_type}</td>
                    <td>{l.target_id}</td>
                    <td>{l.admin_id || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(l.created_at).toLocaleString()}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <div className="text-muted">Total: {pagination.total}</div>
              <div className="d-flex gap-2 align-items-center">
                <button className="btn btn-outline-secondary" disabled={pagination.page <= 1} onClick={() => handlePageChange((pagination.page || 1) - 1)}>Préc.</button>
                <span className="px-3 py-2 rounded" style={{ background: 'var(--bg-muted)' }}>{pagination.page} / {Math.max(1, pagination.pages || 1)}</span>
                <button className="btn btn-outline-secondary" disabled={(pagination.page || 1) >= Math.max(1, pagination.pages || 1)} onClick={() => handlePageChange((pagination.page || 1) + 1)}>Suiv.</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
