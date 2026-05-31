import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { canCreateService } from '../utils/vendorAccess';

export default function GuardedRoute({ children, requireAdmin = false, requireVendor = false, requireSubscribed = false, requireServiceReady = false }) {
  const { user, loading, profile } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (requireVendor && !profile?.isVendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  if (requireSubscribed && !profile?.subscriptionActive) {
    return <Navigate to="/become-vendor" replace />;
  }

  if (requireServiceReady && !canCreateService(profile)) {
    return <Navigate to="/vendor/setup-profile" replace />;
  }

  return children;
}
