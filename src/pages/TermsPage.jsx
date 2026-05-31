const terms = [
  'L’utilisateur est responsable des informations publiées.',
  'Raktakk agit comme plateforme de mise en relation.',
  'Tout usage frauduleux entraîne la suspension du compte.'
];

export default function TermsPage() {
  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="display-sm" style={{ marginBottom: 16 }}>Conditions générales</h1>
        <div className="card p-32">
          {terms.map((term) => <p key={term} style={{ marginBottom: 10 }}>{term}</p>)}
        </div>
      </div>
    </section>
  );
}
