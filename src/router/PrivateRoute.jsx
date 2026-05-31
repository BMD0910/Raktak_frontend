import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DisabledNotice from '../pages/DisabledNotice';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // If account is not active, show disabled notice instead of protected pages
  if (user.accountStatus && user.accountStatus !== 'active') {
    return <DisabledNotice />;
  }

  return children;
}
