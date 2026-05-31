export default function SkeletonGrid({ cards = 6 }) {
  return (
    <div className="results-grid" aria-hidden="true">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="card p-24"
          style={{
            minHeight: 170,
            background: 'linear-gradient(90deg, var(--bg-subtle) 25%, var(--bg-white) 37%, var(--bg-subtle) 63%)',
            backgroundSize: '400% 100%',
            animation: 'pulse 1.4s ease infinite'
          }}
        />
      ))}
    </div>
  );
}
