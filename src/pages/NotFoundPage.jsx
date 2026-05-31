import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '2rem', minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p>Page introuvable.</p>
      <Link to="/">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
