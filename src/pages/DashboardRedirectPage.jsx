import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function DashboardRedirectPage() {
  const navigate = useNavigate();
  const { user, profile, resolveDashboardPath } = useAuth();

  useEffect(() => {
    const target = resolveDashboardPath(user, profile);
    navigate(target, { replace: true });
  }, [navigate, user, profile, resolveDashboardPath]);

  return null;
}
