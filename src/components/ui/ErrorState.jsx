export default function ErrorState({ message }) {
  return (
    <div className="card" style={{ padding: '1rem 1.2rem', borderColor: '#fecaca', background: '#fff7f7' }}>
      <p style={{ color: '#b91c1c', fontSize: '.9rem' }}>{message}</p>
    </div>
  );
}
