export default function EmptyState({ title, message }) {
  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
      <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
