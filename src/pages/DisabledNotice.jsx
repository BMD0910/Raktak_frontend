import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAsyncData } from '../hooks/useAsyncData';
import { marketplaceService } from '../services/marketplaceService';
import FaIcon from '../components/common/FaIcon';
import { Link } from 'react-router-dom';

export default function DisabledNotice() {
  const { user, loading } = useAuth();
  const { data: settings, loading: settingsLoading } = useAsyncData(() => marketplaceService.getPublicSettings(), []);

  if (loading || settingsLoading) return <LoadingSpinner />;
  if (!user) return null;

  const supportEmail = settings?.supportEmail || settings?.support_email || '';
  const supportPhone = settings?.supportPhone || settings?.support_phone || '';

  return (
    <div style={{ padding: 24 }}>
      <div className="card p-24">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaIcon name="ban" style={{ fontSize: 26, color: '#b91c1c' }} />
          <div>
            <h2 style={{ margin: 0 }}>Compte suspendu</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '.92rem' }}>L'accès à votre compte est restreint.</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}><strong>Motif :</strong> {user?.deactivationReason || 'Non fourni'}</p>
          <p style={{ marginTop: 8, marginBottom: 0 }}>Si vous pensez qu'il s'agit d'une erreur, contactez le support ou un administrateur ci-dessous.</p>

          <div style={{ marginTop: 14 }}>
            <div className="support-card">
              <div className="support-card-icon"><FaIcon name="life-ring" style={{ fontSize: 24, color: 'var(--brand-primary)' }} /></div>
              <div className="support-card-body">
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Contact Support</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '.92rem', marginTop: 6 }}>Pour contester la suspension ou obtenir des précisions, contactez notre équipe :</div>

                <div className="support-card-contacts" style={{ marginTop: 10 }}>
                  {supportEmail ? (
                    <a className="btn btn-ghost btn-sm" href={`mailto:${supportEmail}`}><FaIcon name="envelope" style={{ marginRight: 8 }} />{supportEmail}</a>
                  ) : null}
                  {supportPhone ? (
                    <a className="btn btn-ghost btn-sm" href={`tel:${supportPhone}`}><FaIcon name="phone" style={{ marginRight: 8 }} />{supportPhone}</a>
                  ) : null}
                  {user?.deactivationContact ? (
                    <div className="btn btn-ghost btn-sm" style={{ whiteSpace: 'pre-wrap' }}>{String(user.deactivationContact)}</div>
                  ) : null}
                </div>


              </div>
            </div>
            {!supportEmail && !supportPhone && !user?.deactivationContact ? (
              <div style={{ marginTop: 14, color: 'var(--text-muted)' }}>Aucun contact support n'est configuré pour le moment.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
