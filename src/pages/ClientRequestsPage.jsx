import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { clientRequestService } from '../services/clientRequestService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import FaIcon from '../components/common/FaIcon';

const TABS = [
  { id: 'TOUTES', label: 'Toutes' },
  { id: 'EN_ATTENTE', label: 'En attente' },
  { id: 'EN_COURS', label: 'Acceptées' },
  { id: 'TERMINE', label: 'Terminées' },
  { id: 'REFUSE', label: 'Refusées' }
];

const BADGE_STYLES = {
  PENDING: { background: 'var(--bg-subtle)', color: 'var(--text-secondary)' },
  ACCEPTED: { background: 'rgba(0, 122, 255, .08)', color: 'var(--brand-primary)' },
  COMPLETED: { background: 'rgba(16, 185, 129, .14)', color: '#047857' },
  REJECTED: { background: 'rgba(239, 68, 68, .12)', color: '#b91c1c' },
  CANCELLED: { background: 'rgba(156, 163, 175, .18)', color: '#4b5563' }
};

const STATUS_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  COMPLETED: 'Terminée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée'
};

export default function ClientRequestsPage() {
  const [activeTab, setActiveTab] = useState('TOUTES');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data, loading, error, refetch } = useAsyncData(
    () => clientRequestService.getRequests(),
    []
  );

  const requests = data || [];

  const counts = {
    TOUTES: requests.length,
    EN_ATTENTE: requests.filter((request) => request.status === 'PENDING').length,
    EN_COURS: requests.filter((request) => request.status === 'ACCEPTED').length,
    TERMINE: requests.filter((request) => request.status === 'COMPLETED').length,
    REFUSE: requests.filter((request) => request.status === 'REJECTED' || request.status === 'CANCELLED').length
  };

  const handleCancel = async (orderId) => {
    setActionLoading(true);
    setActionError('');
    try {
      await clientRequestService.cancelRequest(orderId);
      await refetch?.();
    } catch (err) {
      setActionError(err?.userMessage || err?.message || 'Impossible d’annuler la demande.');
    } finally {
      setActionLoading(false);
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

  const currentRequests = activeTab === 'TOUTES'
    ? requests
    : requests.filter((request) => {
        if (activeTab === 'EN_ATTENTE') return request.status === 'PENDING';
        if (activeTab === 'EN_COURS') return request.status === 'ACCEPTED';
        if (activeTab === 'TERMINE') return request.status === 'COMPLETED';
        if (activeTab === 'REFUSE') return request.status === 'REJECTED' || request.status === 'CANCELLED';
        return true;
      });

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section className="client-requests-page" style={{ paddingTop: 'calc(var(--header-h) + 24px)', paddingBottom: 48 }}>
      <div className="container">
        <div className="client-requests-hero card">
          <div className="client-requests-hero-content">
            <div className="client-requests-hero-badge">
              <FaIcon name="clipboard-list" />
              Espace client
            </div>
            <h1>Mes demandes</h1>
            <p>
              Consultez vos demandes en cours, suivez leur évolution et accédez à la conversation dès qu’un prestataire les accepte.
            </p>
          </div>

        </div>

        {actionError ? (
          <div className="vendor-orders-alert card">
            <FaIcon name="triangle-exclamation" />
            <span>{actionError}</span>
          </div>
        ) : null}

        <div
          className="client-requests-tabs card"
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: 8, overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`client-tab-pill ${activeTab === tab.id ? 'is-active' : ''}`}
              style={{ flex: '0 0 auto', width: 'auto', minWidth: 'max-content' }}
              onClick={() => setActiveTab(tab.id)}
            >
              <FaIcon name={tab.id === 'TOUTES' ? 'layer-group' : tab.id === 'EN_ATTENTE' ? 'hourglass-half' : tab.id === 'EN_COURS' ? 'check' : tab.id === 'TERMINE' ? 'circle-check' : 'times'} />
              <span>{tab.label}</span>
              <em>({counts[tab.id] || 0})</em>
            </button>
          ))}
        </div>

        {currentRequests.length === 0 ? (
          <div className="vendor-orders-empty">
            <EmptyState title="Aucune demande" message="Aucune demande pour ce statut pour le moment." />
          </div>
        ) : (
          <div className="client-requests-list">
            {currentRequests.map((request) => (
              <article key={request.id} className="request-card">
                <div className="request-card-accent" />
                <div className="request-card-body">
                  <div className="request-card-main">
                    <div className="request-card-title-row">
                      <div>
                        <h3>{request.serviceName || 'Service'}</h3>
                        <p><FaIcon name="building" /> {request.vendorName || 'Prestataire'}</p>
                      </div>
                      <div className="request-status-chip" style={{ ...BADGE_STYLES[request.status] }}>
                        {STATUS_LABELS[request.status] || request.status}
                      </div>
                    </div>

                    <p className="request-card-description">{request.description || 'Aucune description'}</p>

                    <div className="request-card-meta">
                      <div>
                        <span><FaIcon name="calendar" /> Créée</span>
                        <strong>{formatDate(request.createdAt)}</strong>
                      </div>
                      <div>
                        <span><FaIcon name="coins" /> Mise à jour</span>
                        <strong>{formatDate(request.updatedAt)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="request-card-actions">
                    {request.status === 'PENDING' ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm request-action-btn"
                        onClick={() => handleCancel(request.id)}
                        disabled={actionLoading}
                      >
                        Annuler
                      </button>
                    ) : null}

                    {request.status === 'ACCEPTED' || request.status === 'COMPLETED' ? (
                      <Link className="btn btn-primary btn-sm request-action-btn" to={`/account/conversation?orderId=${request.id}`}>
                        Voir la conversation
                      </Link>
                    ) : null}

                    {request.status === 'REJECTED' || request.status === 'CANCELLED' ? (
                      <button type="button" className="btn btn-ghost btn-sm request-action-btn is-muted" disabled>
                        Demande refusée
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
