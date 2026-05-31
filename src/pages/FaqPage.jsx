const faqItems = [
  { q: 'Comment trouver un prestataire ?', a: 'Utilisez la recherche, filtrez puis contactez le profil.' },
  { q: 'Comment devenir vendeur ?', a: 'Créez un compte vendeur puis complétez votre profil.' },
  { q: 'Comment fonctionne la vérification ?', a: 'Notre équipe valide les informations avant publication.' }
];

export default function FaqPage() {
  return (
    <section style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="display-sm" style={{ marginBottom: 20 }}>FAQ</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqItems.map((item) => (
            <div className="card" style={{ padding: 18 }} key={item.q}>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{item.q}</h3>
              <p className="text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
