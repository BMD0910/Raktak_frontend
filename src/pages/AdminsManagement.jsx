import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FaIcon from '../components/common/FaIcon';
import { adminService } from '../services/adminService';

export default function AdminsManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [createForm, setCreateForm] = useState({ email: '', fullName: '', password: '' });
  const [editForm, setEditForm] = useState({ id: '', email: '', fullName: '', password: '', enabled: true });
  const [deleteReason, setDeleteReason] = useState('');

  // Load admins on mount only
  useEffect(() => {
    loadAdmins(1);
  }, []);

  const loadAdmins = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const limit = 10;
      const data = await adminService.getAdmins(pageNum - 1, limit);
      
      // Vérifier la structure de la réponse
      if (!data || !data.data) {
        throw new Error('Structure de réponse invalide');
      }
      
      setAdmins(Array.isArray(data.data) ? data.data : []);
      setPagination({
        page: pageNum,
        limit: limit,
        total: data.pagination?.total || 0,
        pages: Math.max(data.pagination?.pages || 1, 1)
      });
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des administrateurs');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.email || !createForm.fullName || !createForm.password) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await adminService.createAdmin({
        email: createForm.email,
        fullName: createForm.fullName,
        password: createForm.password
      });
      setSuccess('Admin créé avec succès');
      setShowCreateModal(false);
      setCreateForm({ email: '', fullName: '', password: '' });
      loadAdmins(1);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la création de l\'admin';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.fullName) {
      setError('Le nom est requis');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await adminService.updateAdmin({
        id: editForm.id,
        email: editForm.email,
        fullName: editForm.fullName,
        password: editForm.password || undefined,
        enabled: editForm.enabled
      });
      setSuccess('Admin modifié avec succès');
      setShowEditModal(false);
      loadAdmins(pagination.page);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification de l\'admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteReason) {
      setError('La raison est obligatoire');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await adminService.deleteAdmin({
        id: selectedAdmin.id,
        reason: deleteReason
      });
      setSuccess('Admin suspendu avec succès');
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedAdmin(null);
      loadAdmins(pagination.page);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suspension de l\'admin');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (admin) => {
    if (admin.isProtected) {
      setError('Cet administrateur ne peut pas être modifié');
      return;
    }
    setSelectedAdmin(admin);
    setEditForm({
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName || admin.full_name || '',
      password: '',
      enabled: admin.enabled
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (admin) => {
    if (admin.isProtected) {
      setError('Cet administrateur ne peut pas être supprimé');
      return;
    }
    setSelectedAdmin(admin);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const isInitialLoading = loading && admins.length === 0;

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 20px)', paddingBottom: 24 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Gestion des Administrateurs</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => loadAdmins(pagination.page || 1)} disabled={loading}>
            {loading ? 'Actualisation...' : 'Rafraîchir'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setCreateForm({ email: '', fullName: '', password: '' }); setError(''); setShowCreateModal(true); }}>
            <FaIcon name="plus" className="me-2" /> Ajouter un Admin
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <div className="me-3">{error}</div>
          <div>
            <button className="btn btn-sm btn-light me-2" onClick={() => setError('')}>Fermer</button>
            <button className="btn btn-sm btn-secondary" onClick={() => loadAdmins(pagination.page || 1)}>Réessayer</button>
          </div>
        </div>
      )}

      <div className="card">
        {isInitialLoading ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <LoadingSpinner label="Chargement des administrateurs..." />
          </div>
        ) : (
        <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nom Complet</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">Aucun administrateur</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div>{admin.email}</div>
                    {admin.isProtected && (
                      <span className="badge bg-warning text-dark mt-1"><FaIcon name="lock" className="me-1" /> Protégé</span>
                    )}
                  </td>
                  <td>{admin.fullName}</td>
                  <td>
                    <span className={`badge ${admin.enabled ? 'bg-success' : 'bg-secondary'}`}>
                      {admin.enabled ? <><FaIcon name="check" className="me-1" /> Actif</> : <><FaIcon name="times" className="me-1" /> Inactif</>}
                    </span>
                  </td>
                  <td>
                    {new Date(admin.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <div className="d-flex">
                      <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEditModal(admin)} disabled={admin.isProtected} title={admin.isProtected ? 'Non modifiable' : 'Modifier'}>
                        <FaIcon name="pen" />
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(admin)} disabled={admin.isProtected} title={admin.isProtected ? 'Non supprimable' : 'Suspendre'}>
                        <FaIcon name="ban" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
         </div>
        )}

        {!isInitialLoading && pagination.pages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-center mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => loadAdmins(Math.max(1, pagination.page - 1))}>← Précédent</button>
              </li>
              <li className="page-item disabled"><span className="page-link">Page {pagination.page} sur {Math.max(pagination.pages || 1, 1)}</span></li>
              <li className={`page-item ${pagination.page >= (pagination.pages || 1) ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => loadAdmins(Math.min(pagination.pages || 1, pagination.page + 1))}>Suivant →</button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay admin-modal-overlay open" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un nouvel administrateur</h2>
              <button type="button" className="modal-close" onClick={() => setShowCreateModal(false)}><FaIcon name="times" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-body">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom Complet *</label>
                <input
                  type="text"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAdmin && (
        <div className="modal-overlay admin-modal-overlay open" onClick={() => setShowEditModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'administrateur</h2>
              <button type="button" className="modal-close" onClick={() => setShowEditModal(false)}><FaIcon name="times" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom Complet *</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.enabled}
                    onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                  />
                  Actif
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="modal-overlay admin-modal-overlay open" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Suspendre l'administrateur</h2>
              <button type="button" className="modal-close" onClick={() => setShowDeleteModal(false)}><FaIcon name="times" /></button>
            </div>
            <form onSubmit={handleDeleteSubmit} className="modal-body">
              <div className="alert alert-warning">
                <FaIcon name="exclamation-triangle" style={{ marginRight: 8 }} /> Vous êtes sur le point de suspendre l'administrateur <strong>{selectedAdmin.fullName || selectedAdmin.full_name || '-'}</strong>.
                Cette action est irréversible sans intervention manuelle.
              </div>
              <div className="form-group">
                <label>Raison de la suspension *</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Expliquez pourquoi cet admin est suspendu..."
                  rows="4"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-danger" disabled={submitting}>
                  {submitting ? 'Suspension...' : 'Suspendre l\'admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
