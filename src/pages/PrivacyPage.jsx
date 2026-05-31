const points = [
  'Nous collectons uniquement les données nécessaires au service.',
  'Vos informations ne sont jamais revendues à des tiers.',
  'Vous pouvez demander la suppression de vos données à tout moment.'
];

export default function PrivacyPage() {
  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="display-sm" style={{ marginBottom: 16 }}>Politique de confidentialité</h1>
        <div className="card p-32">
          {points.map((point) => <p key={point} style={{ marginBottom: 10 }}>{point}</p>)}
        </div>
      </div>
    </section>
  );
}
