import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { conversationService } from '../services/conversationService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import FaIcon from '../components/common/FaIcon';

const QUICK_REPLIES = [
  'Bonjour, merci pour votre message 👋',
  'Pouvez-vous préciser votre disponibilité ?',
  'Parfait, je valide et je reviens vers vous rapidement.',
  'Merci, je vous confirme dès que possible.'
];

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatDayLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return 'Aujourd’hui';
  if (isSameDay(date, yesterday)) return 'Hier';

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'U').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
};

export default function ConversationPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const orderId = Number(params.get('orderId') || 0);
  
  // Déterminer le lien de retour basé sur le chemin actuel
  const backTo = location.pathname.includes('/dashboard/vendor/')
    ? '/dashboard/vendor/orders'
    : '/account/requests';
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const threadRef = useRef(null);

  const { data: conversation, loading, error: loadError, refetch } = useAsyncData(
    () => (orderId ? conversationService.getConversation(orderId) : Promise.resolve(null)),
    [orderId]
  );

  const messages = useMemo(() => conversation?.messages || [], [conversation]);

  const filteredMessages = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return messages.filter((msg) => {
      const matchesMine = !showOnlyMine || Boolean(msg.isOwn);
      if (!normalized) return matchesMine;

      const searchable = `${msg.content || ''} ${msg.senderName || ''}`.toLowerCase();
      return matchesMine && searchable.includes(normalized);
    });
  }, [messages, search, showOnlyMine]);

  const groupedMessages = useMemo(() => {
    return filteredMessages.reduce((acc, msg) => {
      const key = msg.sentAt ? new Date(msg.sentAt).toDateString() : 'unknown';
      if (!acc[key]) {
        acc[key] = {
          label: formatDayLabel(msg.sentAt),
          items: []
        };
      }
      acc[key].items.push(msg);
      return acc;
    }, {});
  }, [filteredMessages]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages.length]);

  const handleSend = async (event) => {
    event.preventDefault();
    setError('');

    const clean = message.trim();
    if (!clean) {
      setError('Le message est requis.');
      return;
    }

    if (!conversation?.id) {
      setError('Conversation introuvable.');
      return;
    }

    setSending(true);
    try {
      await conversationService.sendMessage(conversation.id, clean);
      setMessage('');
      await refetch?.();
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Impossible d’envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (template) => {
    setMessage((previous) => {
      if (!previous.trim()) return template;
      return `${previous}\n${template}`;
    });
  };

  const handleMessageKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSend(event);
    }
  };

  if (!orderId) {
    return <ErrorState message="Identifiant de commande manquant." />;
  }

  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} />;
  if (!conversation) return <EmptyState title="Conversation introuvable" message="Cette commande n’a pas encore de conversation active." />;

  const isFiltered = Boolean(search.trim()) || showOnlyMine;

  return (
    <section className="conversation-page" style={{ paddingTop: 'var(--header-h)', paddingBottom: 48 }}>
      <div className="container conversation-page-container">
        <header className="conversation-header card">
          <div className="conversation-header-main">
            <div className="conversation-avatar-row">
              <div className="conversation-avatar">{getInitials(conversation.clientName)}</div>
              <FaIcon name="arrow-right-long" />
              <div className="conversation-avatar is-vendor">{getInitials(conversation.vendorName)}</div>
            </div>

            <div>
              <h1 className="display-sm">Espace de dialogue</h1>
              <p>
                <strong>{conversation.serviceName}</strong> · {conversation.clientName} ↔ {conversation.vendorName}
              </p>
            </div>
          </div>

          <div className="conversation-header-actions">
            <div className="conversation-pill">
              <FaIcon name="hashtag" /> Commande #{conversation.orderId}
            </div>
            <div className="conversation-pill is-muted">
              <FaIcon name="clock" /> {conversation.lastMessageAt ? `Dernier msg ${new Date(conversation.lastMessageAt).toLocaleString('fr-FR')}` : 'Aucun message'}
            </div>
            <Link to={backTo} className="btn btn-secondary btn-sm">Retour aux demandes</Link>
          </div>
        </header>

        <section className="conversation-toolbar card">
          <div className="conversation-search-wrap">
            <FaIcon name="search" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher dans la conversation..."
            />
          </div>

          <label className="conversation-toggle">
            <input
              type="checkbox"
              checked={showOnlyMine}
              onChange={(event) => setShowOnlyMine(event.target.checked)}
            />
            <span>Mes messages uniquement</span>
          </label>

          {isFiltered ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearch('');
                setShowOnlyMine(false);
              }}
            >
              Réinitialiser
            </button>
          ) : null}
        </section>

        <section className="conversation-thread card" ref={threadRef}>
          {filteredMessages.length === 0 ? (
            <EmptyState
              title={messages.length === 0 ? 'Aucun message' : 'Aucun résultat'}
              message={messages.length === 0 ? 'Commencez la discussion avec votre client ou prestataire.' : 'Aucun message ne correspond aux filtres actifs.'}
            />
          ) : (
            Object.entries(groupedMessages).map(([groupKey, group]) => (
              <div key={groupKey} className="conversation-day-group">
                <div className="conversation-day-label">{group.label}</div>
                <div className="conversation-messages-stack">
                  {group.items.map((msg) => (
                    <article
                      key={msg.id}
                      className={`conversation-bubble ${msg.isOwn ? 'is-own' : 'is-peer'}`}
                    >
                      <div className="conversation-bubble-meta">
                        <strong>{msg.isOwn ? 'Moi' : msg.senderName || 'Participant'}</strong>
                        <span>{formatTime(msg.sentAt)}</span>
                      </div>
                      <p>{msg.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="conversation-composer card">
          <div className="conversation-composer-top">
            <div className="conversation-composer-title">
              <FaIcon name="pen" /> Nouveau message
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setComposerExpanded((value) => !value)}
            >
              {composerExpanded ? 'Mode compact' : 'Mode étendu'}
            </button>
          </div>

          <div className="conversation-quick-replies">
            {QUICK_REPLIES.map((template) => (
              <button key={template} type="button" className="conversation-chip" onClick={() => handleQuickReply(template)}>
                {template}
              </button>
            ))}
          </div>

          {error ? <div className="conversation-error">{error}</div> : null}

          <form onSubmit={handleSend}>
            <label className="form-label">Votre message</label>
            <textarea
              className="form-input form-textarea"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleMessageKeyDown}
              placeholder="Écrire un message..."
              rows={composerExpanded ? 7 : 4}
              maxLength={1000}
            />

            <div className="conversation-composer-footer">
              <div className="conversation-composer-hint">
                <span>{message.trim().length}/1000</span>
                <span>Ctrl/Cmd + Entrée pour envoyer</span>
              </div>
              <button className="btn btn-primary" type="submit" disabled={sending || !message.trim()}>
                <FaIcon name="paper-plane" /> {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}