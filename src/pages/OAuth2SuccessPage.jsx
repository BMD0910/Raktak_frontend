import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/tokenStorage';

export default function OAuth2SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setToken(token);
    }
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return <div style={{ padding: '2rem' }}>Connexion Google en cours…</div>;
}
