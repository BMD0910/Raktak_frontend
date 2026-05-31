import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import FaIcon from '../components/common/FaIcon';

const STATUS_META = {
  PENDING: { label: 'En attente', tone: 'warning', icon: 'hourglass-half' },
  ACCEPTED: { label: 'Acceptée', tone: 'info', icon: 'check' },
  COMPLETED: { label: 'Complétée', tone: 'success', icon: 'circle-check' },
  REJECTED: { label: 'Refusée', tone: 'danger', icon: 'times' }
};

const TAB_ICONS = {
  pending: 'hourglass-half',
  accepted: 'check',
  completed: 'circle-check',
  rejected: 'times'
};

export default function VendorOrdersPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { data: orders = [], loading: ordersLoading, error: ordersError, refetch } = useAsyncData(
    () => orderService.getVendorOrders?.() || Promise.resolve([]),
    []
  );

  const ordersArray = Array.isArray(orders) ? orders : [];

  const pendingOrders = ordersArray.filter(o => o.status === 'PENDING');
  const acceptedOrders = ordersArray.filter(o => o.status === 'ACCEPTED');
  const completedOrders = ordersArray.filter(o => o.status === 'COMPLETED');
  const rejectedOrders = ordersArray.filter(o => o.status === 'REJECTED');

  const currentOrders = {
    pending: pendingOrders,
    accepted: acceptedOrders,
    completed: completedOrders,
    rejected: rejectedOrders
  };

  const handleAccept = async (orderId) => {
    setLoading(true);
    try {
      await orderService.accept?.(orderId);
      setError(null);
      await refetch?.();
      setActiveTab('accepted');
    } catch (err) {
      setError(err.userMessage || err.message || 'Erreur lors de l\'acceptation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (orderId) => {
    setLoading(true);
    try {
      await orderService.reject?.(orderId);
      setError(null);
      refetch?.();
    } catch (err) {
      setError(err.userMessage || err.message || 'Erreur lors du refus');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (orderId) => {
    setLoading(true);
    try {
      await orderService.complete?.(orderId);
      setError(null);
      refetch?.();
    } catch (err) {
      setError(err.userMessage || err.message || 'Erreur lors de la clôture');
    } finally {
      setLoading(false);
    }
  };

  if (ordersLoading) return <LoadingSpinner />;
  if (ordersError) return <ErrorState message={ordersError} />;

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'pending', label: 'En attente', count: pendingOrders.length },
    { id: 'accepted', label: 'Acceptées', count: acceptedOrders.length },
    { id: 'completed', label: 'Complétées', count: completedOrders.length },
    { id: 'rejected', label: 'Refusées', count: rejectedOrders.length }
  ];

  const displayOrders = currentOrders[activeTab];

  return (
    <section className="vendor-orders-page" style={{ paddingTop: 'calc(var(--header-h) + 24px)', paddingBottom: 48 }}>
      <div className="container">
        <div className="vendor-orders-hero card">
          <div className="vendor-orders-hero-copy">
            <div className="vendor-orders-hero-badge">
              <FaIcon name="clipboard-list" />
              Espace prestataire
            </div>
            <h1>Demandes de service</h1>
            <p>
              Suivez vos demandes entrantes, priorisez rapidement les requêtes actives et accédez à la conversation au bon moment.
            </p>
          </div>

        </div>

        {error && (
          <div className="vendor-orders-alert card">
            <FaIcon name="triangle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        <div className="vendor-orders-tabs card">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`vendor-tab-pill ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              <FaIcon name={TAB_ICONS[tab.id]} />
              <span>{tab.label}</span>
              <em>{tab.count}</em>
            </button>
          ))}
        </div>

        {displayOrders.length === 0 ? (
          <div className="vendor-orders-empty">
            <EmptyState
              title="Aucune demande"
              message={`Vous n'avez aucune demande ${
                activeTab === 'pending' ? 'en attente' :
                activeTab === 'accepted' ? 'acceptée' :
                activeTab === 'completed' ? 'complétée' : 'refusée'
              }.`}
            />
          </div>
        ) : (
          <div className="client-requests-list">
            {displayOrders.map(order => (
              <article key={order.id} className="vendor-order-card">
                <div className="vendor-order-card-accent" />
                <div className="vendor-order-card-body">
                  <div className="vendor-order-card-main">
                    <div className="vendor-order-card-top">
                      <div>
                        <h3>{order.serviceName || 'Service'}</h3>
                        <p><FaIcon name="user" /> {order.clientName || 'Client'}</p>
                      </div>
                      <div className={`vendor-order-status ${order.status === 'PENDING' ? 'status-warning' : order.status === 'ACCEPTED' ? 'status-info' : order.status === 'COMPLETED' ? 'status-success' : 'status-danger'}`}>
                        <FaIcon name={STATUS_META[order.status]?.icon || 'hourglass-half'} />
                        {STATUS_META[order.status]?.label || order.status}
                      </div>
                    </div>

                    <p className="vendor-order-card-description">{order.description || 'Pas de description'}</p>

                    <div className="vendor-order-card-meta">
                      <div>
                        <span><FaIcon name="calendar" /> Créée</span>
                        <strong>{formatDate(order.createdAt)}</strong>
                      </div>
                      <div>
                        <span><FaIcon name="coins" /> Prix</span>
                        <strong>{order.price || order.servicePrice ? `${order.price || order.servicePrice}€` : 'Sur devis'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="vendor-order-card-actions">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={loading}
                        className="btn btn-primary btn-sm vendor-action-btn"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        disabled={loading}
                        className="btn btn-ghost btn-sm vendor-action-btn is-danger"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <>
                      <Link className="btn btn-primary btn-sm vendor-action-btn" to={`/dashboard/vendor/conversation?orderId=${order.id}`}>
                        Discuter
                      </Link>
                      <button
                        onClick={() => handleComplete(order.id)}
                        disabled={loading}
                        className="btn btn-ghost btn-sm vendor-action-btn"
                      >
                        Terminer
                      </button>
                    </>
                  )}
                  {order.status === 'COMPLETED' && (
                    <Link
                      to={`/dashboard/vendor/conversation?orderId=${order.id}`}
                      className="btn btn-ghost btn-sm vendor-action-btn"
                    >
                      Voir la conversation
                    </Link>
                  )}
                  {order.status === 'REJECTED' && (
                    <button disabled className="btn btn-ghost btn-sm vendor-action-btn is-muted">Demande refusée</button>
                  )}
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
