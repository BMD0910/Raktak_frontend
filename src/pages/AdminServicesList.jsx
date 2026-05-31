import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import ConfirmModal from '../components/ui/ConfirmModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import FaIcon from '../components/common/FaIcon';

export default function AdminServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'suspend' | 'reactivate'
  const [selectedService, setSelectedService] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, [page, statusFilter, categoryFilter, searchTerm]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getServices({
        page,
        limit,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        search: searchTerm || undefined
      });
      setServices(result.data || []);
      setTotal(result.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = (service) => {
    setSelectedService(service);
    setModalAction('suspend');
    setReason('');
    setModalOpen(true);
  };

  const handleReactivate = (service) => {
    setSelectedService(service);
    setModalAction('reactivate');
    setReason('');
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedService) return;
    if (modalAction === 'suspend' && !reason.trim()) {
      alert('Le motif est obligatoire pour désactiver un service');
      return;
    }
    
    try {
      setSubmitting(true);
      const newStatus = modalAction === 'suspend' ? 'suspended' : 'active';
      const reasonText = modalAction === 'suspend' ? reason : `Réactivation par admin - ${reason || 'Sans motif'}`;
      
      await adminService.updateServiceStatus(selectedService.id, newStatus, reasonText);
      
      setModalOpen(false);
      setReason('');
      setSelectedService(null);
      loadServices();
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <h1 className="h4">Gestion des services</h1>
          <p className="text-muted mb-0">Modération et statut des services des prestataires</p>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <div className="input-group">
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="form-control"
              aria-label="Recherche services"
            />
            <button className="btn btn-outline-secondary" type="button" onClick={() => setPage(1)}>
              <FaIcon name="search" />
            </button>
          </div>
        </div>

        <div className="col-md-3 mb-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="form-select">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div className="col-md-3 mb-2 text-md-end">
          <small className="text-muted">Total: {total.toLocaleString('fr-FR')}</small>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="alert alert-info">Aucun service trouvé</div>
      ) : (
        <>
          <div className="table-responsive mb-3">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Prestataire</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Raison</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id}>
                    <td style={{ minWidth: 240 }}>{service.title}</td>
                    <td>
                      <div className="fw-semibold">{service.full_name}</div>
                      <div className="text-muted small">{service.email}</div>
                    </td>
                    <td>{service.category_name || '-'}</td>
                    <td>
                      {service.status === 'active' ? (
                        <span className="badge bg-success"><FaIcon name="check" style={{ marginRight: 6 }} /> Actif</span>
                      ) : service.status === 'suspended' ? (
                        <span className="badge bg-warning text-dark"><FaIcon name="ban" style={{ marginRight: 6 }} /> Suspendu</span>
                      ) : (
                        <span className="badge bg-secondary"><FaIcon name="times" style={{ marginRight: 6 }} /> Inactif</span>
                      )}
                    </td>
                    <td className="small text-truncate" style={{ maxWidth: 220 }}>{service.deactivation_reason || '-'}</td>
                    <td className="text-end">
                      {service.status === 'suspended' || service.status === 'inactive' ? (
                        <button className="btn btn-sm btn-outline-success" onClick={() => handleReactivate(service)}>
                          <FaIcon name="redo" /> Réactiver
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleSuspend(service)}>
                          <FaIcon name="ban" /> Suspendre
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav aria-label="pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</button>
                </li>
                <li className="page-item disabled"><span className="page-link">Page {page}/{totalPages}</span></li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Suivant</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <ConfirmModal
        open={modalOpen}
        title={modalAction === 'suspend' ? 'Suspendre le service' : 'Réactiver le service'}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      >
        {modalAction === 'suspend' ? (
          <>
            <p className="mb-2">Êtes-vous sûr de vouloir suspendre le service <strong>{selectedService?.title}</strong> ?</p>
            <label className="form-label" htmlFor="service-suspend-reason">Motif de suspension</label>
            <textarea
              id="service-suspend-reason"
              placeholder="Motif de suspension (obligatoire)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-control"
              rows={4}
              required
            />
            <p className="small text-muted mt-2 mb-0">Ce motif sera visible par le prestataire dans le détail du service.</p>
          </>
        ) : (
          <p>Êtes-vous sûr de vouloir réactiver le service <strong>{selectedService?.title}</strong> ?</p>
        )}
      </ConfirmModal>
    </div>
  );
}

