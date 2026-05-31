export default function LoadingSpinner({ label = 'Chargement...' }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      {label}
    </div>
  );
}
