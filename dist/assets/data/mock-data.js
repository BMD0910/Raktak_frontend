// ============================================================
// RAKTAKK — Mock Data v1.0
// Replace this file with real API calls when backend is ready
// ============================================================

const RAKTAKK = {

  // ── VENDORS / COMPANIES ─────────────────────────────────
  vendors: [
    { id: 1, name: "Dakar Digital Studio", slug: "dakar-digital-studio", category: "Marketing Digital", city: "Dakar", country: "Sénégal", rating: 4.9, reviews: 127, verified: true, sponsored: true, badge: "Top", emoji: "🚀", description: "Agence marketing digitale spécialisée en stratégie web, SEO et réseaux sociaux pour les entreprises africaines.", services: ["SEO", "Publicité Facebook", "Site web", "Community Management"], phone: "+221 77 123 45 67", whatsapp: "+221 77 123 45 67", email: "contact@dakardigital.sn", price: "Depuis 150 000 FCFA", available: true, joined: "2022-03-15", leads: 342, views: 8920, plan: "business" },
    { id: 2, name: "SénéBTP Construction", slug: "senebtp-construction", category: "BTP & Construction", city: "Thiès", country: "Sénégal", rating: 4.7, reviews: 89, verified: true, sponsored: false, badge: "Vérifié", emoji: "🏗️", description: "Expert en construction résidentielle et commerciale. Devis gratuit sous 24h. Plus de 200 projets réalisés.", services: ["Maçonnerie", "Carrelage", "Peinture", "Électricité"], phone: "+221 78 234 56 78", whatsapp: "+221 78 234 56 78", email: "senebtp@gmail.com", price: "Sur devis", available: true, joined: "2021-08-22", leads: 215, views: 5430, plan: "pro" },
    { id: 3, name: "TechSolutions CI", slug: "techsolutions-ci", category: "Informatique & Tech", city: "Abidjan", country: "Côte d'Ivoire", rating: 4.8, reviews: 203, verified: true, sponsored: true, badge: "Top", emoji: "💻", description: "Développement de logiciels sur mesure, applications mobiles et solutions cloud pour entreprises africaines.", services: ["Développement web", "Apps mobiles", "Cloud", "Support IT"], phone: "+225 07 123 45 67", whatsapp: "+225 07 123 45 67", email: "info@techsolutions.ci", price: "Depuis 500 000 FCFA", available: true, joined: "2020-11-10", leads: 578, views: 14200, plan: "business" },
    { id: 4, name: "Mama Africa Traiteur", slug: "mama-africa-traiteur", category: "Restauration & Traiteur", city: "Dakar", country: "Sénégal", rating: 4.9, reviews: 314, verified: true, sponsored: false, badge: "Top", emoji: "🍽️", description: "Traiteur événementiel haut de gamme. Cuisine africaine et internationale pour vos mariages et événements.", services: ["Mariages", "Baptêmes", "Événements corporate", "Livraison"], phone: "+221 76 345 67 89", whatsapp: "+221 76 345 67 89", email: "mama@traiteur.sn", price: "Depuis 25 000 FCFA/pers", available: true, joined: "2021-02-28", leads: 432, views: 11800, plan: "pro" },
    { id: 5, name: "AutoDoc Lomé", slug: "autodoc-lome", category: "Automobile & Mécanique", city: "Lomé", country: "Togo", rating: 4.6, reviews: 156, verified: true, sponsored: false, badge: "Vérifié", emoji: "🚗", description: "Garage multimarques. Révision, réparation et entretien de tous types de véhicules à Lomé.", services: ["Révision", "Réparation moteur", "Carrosserie", "Électronique auto"], phone: "+228 90 123 456", whatsapp: "+228 90 123 456", email: "autodoc@togo.tg", price: "Depuis 15 000 FCFA", available: true, joined: "2022-06-14", leads: 287, views: 7650, plan: "free" },
    { id: 6, name: "Premium Immo Dakar", slug: "premium-immo-dakar", category: "Immobilier", city: "Dakar", country: "Sénégal", rating: 4.8, reviews: 97, verified: true, sponsored: true, badge: "Sponsorisé", emoji: "🏠", description: "Agence immobilière spécialisée dans la vente et location de biens résidentiels et commerciaux à Dakar.", services: ["Vente", "Location", "Gestion locative", "Estimation"], phone: "+221 77 456 78 90", whatsapp: "+221 77 456 78 90", email: "contact@premiumimmo.sn", price: "Commission 3%", available: true, joined: "2020-05-18", leads: 189, views: 9340, plan: "sponsored" },
    { id: 7, name: "SantéPlus Bamako", slug: "santeplus-bamako", category: "Santé & Médecine", city: "Bamako", country: "Mali", rating: 4.9, reviews: 445, verified: true, sponsored: false, badge: "Top", emoji: "🏥", description: "Clinique médicale moderne. Consultations générales et spécialisées, analyses, radiologie.", services: ["Médecine générale", "Pédiatrie", "Cardiologie", "Analyses"], phone: "+223 20 123 456", whatsapp: "+223 20 123 456", email: "contact@santeplus.ml", price: "Consultation: 10 000 FCFA", available: true, joined: "2019-12-01", leads: 1203, views: 28900, plan: "business" },
    { id: 8, name: "EduFormation Pro", slug: "eduformation-pro", category: "Formation & Éducation", city: "Dakar", country: "Sénégal", rating: 4.7, reviews: 231, verified: true, sponsored: false, badge: "Nouveau", emoji: "🎓", description: "Centre de formation professionnelle. Bureautique, langues, comptabilité et développement personnel.", services: ["Bureautique", "Anglais des affaires", "Comptabilité", "Leadership"], phone: "+221 33 456 78 90", whatsapp: "+221 77 456 78 90", email: "info@eduformation.sn", price: "Depuis 50 000 FCFA", available: true, joined: "2023-01-15", leads: 178, views: 4320, plan: "pro" },
    { id: 9, name: "PhotoStudio Cotonou", slug: "photostudio-cotonou", category: "Photographie & Vidéo", city: "Cotonou", country: "Bénin", rating: 4.8, reviews: 112, verified: true, sponsored: false, badge: "Vérifié", emoji: "📸", description: "Studio photo professionnel. Portraits, événements, publicité et production vidéo corporate.", services: ["Portraits", "Mariage", "Publicité", "Vidéo corporate"], phone: "+229 97 123 456", whatsapp: "+229 97 123 456", email: "photostudio@benin.bj", price: "Depuis 75 000 FCFA", available: true, joined: "2021-09-30", leads: 134, views: 3890, plan: "pro" },
    { id: 10, name: "CleanPro Services", slug: "cleanpro-services", category: "Entretien & Nettoyage", city: "Dakar", country: "Sénégal", rating: 4.5, reviews: 68, verified: false, sponsored: false, badge: "Nouveau", emoji: "✨", description: "Services de nettoyage professionnel pour particuliers et entreprises. Intervention rapide 7j/7.", services: ["Nettoyage bureaux", "Nettoyage résidentiel", "Après travaux", "Désinfection"], phone: "+221 76 567 89 01", whatsapp: "+221 76 567 89 01", email: "cleanpro@senegal.sn", price: "Depuis 20 000 FCFA", available: true, joined: "2023-04-10", leads: 56, views: 1230, plan: "free" },
    { id: 11, name: "JuriConseil Dakar", slug: "juriconseil-dakar", category: "Juridique & Notariat", city: "Dakar", country: "Sénégal", rating: 4.9, reviews: 78, verified: true, sponsored: false, badge: "Vérifié", emoji: "⚖️", description: "Cabinet d'avocats spécialisé en droit des affaires, droit du travail et contentieux commercial.", services: ["Droit des affaires", "Contrats", "Contentieux", "Conseil juridique"], phone: "+221 33 234 56 78", whatsapp: "+221 77 234 56 78", email: "contact@juriconseil.sn", price: "Consultation: 25 000 FCFA", available: true, joined: "2020-03-22", leads: 167, views: 4560, plan: "pro" },
    { id: 12, name: "Conakry Event Pro", slug: "conakry-event-pro", category: "Événementiel", city: "Conakry", country: "Guinée", rating: 4.6, reviews: 143, verified: true, sponsored: true, badge: "Sponsorisé", emoji: "🎉", description: "Organisation d'événements clé en main. Mariages, conférences, galas, lancements de produits.", services: ["Mariages", "Conférences", "Galas", "Team building"], phone: "+224 628 123 456", whatsapp: "+224 628 123 456", email: "events@conakry.gn", price: "Sur devis", available: true, joined: "2021-11-05", leads: 198, views: 6780, plan: "sponsored" },
    { id: 13, name: "Mode & Style Dakar", slug: "mode-style-dakar", category: "Mode & Couture", city: "Dakar", country: "Sénégal", rating: 4.8, reviews: 256, verified: true, sponsored: false, badge: "Top", emoji: "👗", description: "Atelier de couture haute gamme. Tenues sur mesure, tenues de mariée, prêt-à-porter africain.", services: ["Sur mesure", "Mariage", "Broderie", "Retouche"], phone: "+221 77 678 90 12", whatsapp: "+221 77 678 90 12", email: "modestyle@dakar.sn", price: "Depuis 30 000 FCFA", available: true, joined: "2020-07-14", leads: 312, views: 8940, plan: "business" },
    { id: 14, name: "AgriTech Sénégal", slug: "agritech-senegal", category: "Agriculture & Agroalimentaire", city: "Kaolack", country: "Sénégal", rating: 4.5, reviews: 45, verified: true, sponsored: false, badge: "Nouveau", emoji: "🌱", description: "Solutions agricoles modernes. Semences, équipements, conseil agronomique et transformation agroalimentaire.", services: ["Semences", "Équipements", "Conseil", "Transformation"], phone: "+221 77 789 01 23", whatsapp: "+221 77 789 01 23", email: "agritech@kaolack.sn", price: "Variable", available: true, joined: "2023-02-20", leads: 43, views: 1120, plan: "free" },
    { id: 15, name: "LogiTrans Afrique", slug: "logitrans-afrique", category: "Transport & Logistique", city: "Abidjan", country: "Côte d'Ivoire", rating: 4.7, reviews: 189, verified: true, sponsored: true, badge: "Top", emoji: "🚚", description: "Solutions de transport et logistique pour particuliers et entreprises en Afrique de l'Ouest.", services: ["Transport marchandises", "Déménagement", "Express", "Entrepôt"], phone: "+225 07 234 56 78", whatsapp: "+225 07 234 56 78", email: "logitrans@abidjan.ci", price: "Sur devis", available: true, joined: "2021-04-18", leads: 267, views: 7230, plan: "sponsored" },
    { id: 16, name: "Électronique Discount", slug: "electronique-discount", category: "Électronique & High-Tech", city: "Dakar", country: "Sénégal", rating: 4.4, reviews: 334, verified: false, sponsored: false, badge: "Populaire", emoji: "📱", description: "Vente de smartphones, ordinateurs et accessoires high-tech aux meilleurs prix de Dakar.", services: ["Smartphones", "PC/Mac", "Accessoires", "Réparation"], phone: "+221 77 890 12 34", whatsapp: "+221 77 890 12 34", email: "info@electronikediscount.sn", price: "Depuis 50 000 FCFA", available: true, joined: "2022-01-08", leads: 445, views: 12300, plan: "free" },
    { id: 17, name: "Beauty by Aïda", slug: "beauty-by-aida", category: "Beauté & Bien-être", city: "Saint-Louis", country: "Sénégal", rating: 4.9, reviews: 178, verified: true, sponsored: false, badge: "Top", emoji: "💅", description: "Institut de beauté premium. Soins visage, coiffure afro, maquillage professionnel et onglerie.", services: ["Coiffure", "Maquillage", "Soins peau", "Onglerie"], phone: "+221 77 901 23 45", whatsapp: "+221 77 901 23 45", email: "aida@beauty.sn", price: "Depuis 5 000 FCFA", available: true, joined: "2021-06-25", leads: 223, views: 6120, plan: "pro" },
    { id: 18, name: "SolarTech Mali", slug: "solartech-mali", category: "Énergie & Solaire", city: "Bamako", country: "Mali", rating: 4.7, reviews: 92, verified: true, sponsored: false, badge: "Vérifié", emoji: "☀️", description: "Installation de panneaux solaires et systèmes énergétiques pour particuliers et entreprises.", services: ["Panneaux solaires", "Onduleurs", "Batteries", "Maintenance"], phone: "+223 76 123 456", whatsapp: "+223 76 123 456", email: "solartech@mali.ml", price: "Sur devis", available: true, joined: "2022-09-12", leads: 134, views: 3870, plan: "pro" },
    { id: 19, name: "Print & Design Lomé", slug: "print-design-lome", category: "Imprimerie & Design", city: "Lomé", country: "Togo", rating: 4.6, reviews: 87, verified: true, sponsored: false, badge: "Vérifié", emoji: "🖨️", description: "Imprimerie numérique et design graphique. Cartes de visite, flyers, bâches, identité visuelle.", services: ["Impression numérique", "Design graphique", "Signalétique", "Packaging"], phone: "+228 91 234 567", whatsapp: "+228 91 234 567", email: "printdesign@lome.tg", price: "Depuis 5 000 FCFA", available: true, joined: "2022-03-30", leads: 98, views: 2780, plan: "free" },
    { id: 20, name: "FinTech Conseil", slug: "fintech-conseil", category: "Finance & Comptabilité", city: "Dakar", country: "Sénégal", rating: 4.8, reviews: 143, verified: true, sponsored: false, badge: "Vérifié", emoji: "💰", description: "Cabinet de conseil financier, comptabilité d'entreprise et accompagnement fiscal.", services: ["Comptabilité", "Fiscalité", "Audit", "Business plan"], phone: "+221 33 012 34 56", whatsapp: "+221 77 012 34 56", email: "fintech@conseil.sn", price: "Depuis 75 000 FCFA/mois", available: true, joined: "2020-09-01", leads: 189, views: 5230, plan: "pro" }
  ],

  // ── CATEGORIES ────────────────────────────────────────────
  categories: [
    { id: 1, name: "Marketing Digital", icon: "🚀", count: 234, color: "#FF6B35" },
    { id: 2, name: "BTP & Construction", icon: "🏗️", count: 187, color: "#2EC4B6" },
    { id: 3, name: "Informatique & Tech", icon: "💻", count: 312, color: "#3A86FF" },
    { id: 4, name: "Restauration & Traiteur", icon: "🍽️", count: 156, color: "#FF006E" },
    { id: 5, name: "Automobile & Mécanique", icon: "🚗", count: 98, color: "#8338EC" },
    { id: 6, name: "Immobilier", icon: "🏠", count: 143, color: "#FB5607" },
    { id: 7, name: "Santé & Médecine", icon: "🏥", count: 89, color: "#06D6A0" },
    { id: 8, name: "Formation & Éducation", icon: "🎓", count: 201, color: "#FFD60A" },
    { id: 9, name: "Photographie & Vidéo", icon: "📸", count: 76, color: "#E63946" },
    { id: 10, name: "Événementiel", icon: "🎉", count: 134, color: "#A8DADC" },
    { id: 11, name: "Mode & Couture", icon: "👗", count: 112, color: "#F72585" },
    { id: 12, name: "Agriculture", icon: "🌱", count: 67, color: "#588157" },
    { id: 13, name: "Transport & Logistique", icon: "🚚", count: 89, color: "#333D29" },
    { id: 14, name: "Beauté & Bien-être", icon: "💅", count: 178, color: "#FF85A1" },
    { id: 15, name: "Énergie & Solaire", icon: "☀️", count: 54, color: "#FFBE0B" },
    { id: 16, name: "Finance & Comptabilité", icon: "💰", count: 98, color: "#1B4332" },
    { id: 17, name: "Juridique & Notariat", icon: "⚖️", count: 45, color: "#343A40" },
    { id: 18, name: "Électronique & High-Tech", icon: "📱", count: 167, color: "#0077B6" }
  ],

  // ── CITIES ────────────────────────────────────────────────
  cities: [
    { name: "Dakar", country: "Sénégal", vendors: 1240, emoji: "🏙️" },
    { name: "Abidjan", country: "Côte d'Ivoire", vendors: 890, emoji: "🌆" },
    { name: "Bamako", country: "Mali", vendors: 567, emoji: "🏛️" },
    { name: "Lomé", country: "Togo", vendors: 345, emoji: "🌊" },
    { name: "Cotonou", country: "Bénin", vendors: 312, emoji: "🌴" },
    { name: "Conakry", country: "Guinée", vendors: 289, emoji: "⛰️" },
    { name: "Thiès", country: "Sénégal", vendors: 234, emoji: "🏘️" },
    { name: "Mbour", country: "Sénégal", vendors: 189, emoji: "🏖️" },
    { name: "Saint-Louis", country: "Sénégal", vendors: 167, emoji: "🌉" },
    { name: "Kaolack", country: "Sénégal", vendors: 145, emoji: "🌾" }
  ],

  // ── CLIENT REQUESTS ───────────────────────────────────────
  requests: [
    { id: 1, client: "Moussa D.", category: "Marketing Digital", city: "Dakar", budget: "200 000 FCFA", description: "Cherche une agence pour gérer mes réseaux sociaux et créer du contenu pour mon restaurant.", responses: 7, date: "2024-01-15", urgent: true },
    { id: 2, client: "Fatou B.", category: "BTP & Construction", city: "Thiès", budget: "Sur devis", description: "Besoin d'un maçon pour la construction d'une clôture de 50 mètres.", responses: 4, date: "2024-01-14", urgent: false },
    { id: 3, client: "Ibrahim K.", category: "Informatique & Tech", city: "Abidjan", budget: "1 500 000 FCFA", description: "Développement d'une application mobile de livraison pour mon entreprise.", responses: 12, date: "2024-01-13", urgent: true },
    { id: 4, client: "Aïssatou S.", category: "Événementiel", city: "Dakar", budget: "500 000 FCFA", description: "Organisation d'un mariage pour 200 personnes le 15 mars 2024.", responses: 9, date: "2024-01-12", urgent: false },
    { id: 5, client: "Omar T.", category: "Transport", city: "Lomé", budget: "Sur devis", description: "Transport de marchandises de Lomé à Abidjan, 3 tonnes.", responses: 3, date: "2024-01-11", urgent: true },
    { id: 6, client: "Mariame C.", category: "Formation", city: "Bamako", budget: "150 000 FCFA", description: "Formation en comptabilité pour 5 employés, durée 1 mois.", responses: 6, date: "2024-01-10", urgent: false },
    { id: 7, client: "Seydou N.", category: "Immobilier", city: "Dakar", budget: "Achat", description: "Recherche appartement 3 chambres à Almadies ou Ngor, budget 80M FCFA.", responses: 5, date: "2024-01-09", urgent: false },
    { id: 8, client: "Ramatoulaye D.", category: "Beauté", city: "Saint-Louis", budget: "10 000 FCFA", description: "Coiffeuse disponible pour tresses collées, samedi prochain.", responses: 8, date: "2024-01-08", urgent: false }
  ],

  // ── REVIEWS ───────────────────────────────────────────────
  reviews: [
    { id: 1, vendor: 1, client: "Aminata S.", rating: 5, comment: "Excellente agence ! Mon chiffre d'affaires a augmenté de 40% depuis que je travaille avec eux.", date: "2024-01-10" },
    { id: 2, vendor: 1, client: "Cheikh M.", rating: 5, comment: "Professionnels, réactifs et créatifs. Je recommande vivement.", date: "2023-12-28" },
    { id: 3, vendor: 3, client: "Kofi A.", rating: 5, comment: "Application livrée dans les délais avec une qualité irréprochable. Top équipe!", date: "2024-01-05" },
    { id: 4, vendor: 4, client: "Mariame T.", rating: 5, comment: "Les meilleures cuisinières de Dakar ! Mon mariage était parfait grâce à elles.", date: "2023-11-20" },
    { id: 5, vendor: 7, client: "Issouf K.", rating: 5, comment: "Médecins compétents et accueil chaleureux. Je recommande la clinique.", date: "2024-01-08" },
    { id: 6, vendor: 2, client: "Abdoulaye F.", rating: 4, comment: "Bonne qualité de construction. Petits retards mais résultat final très satisfaisant.", date: "2024-01-02" },
    { id: 7, vendor: 13, client: "Rokhaya N.", rating: 5, comment: "Ma robe de mariée était sublime. Aïda a su exactement ce que je voulais.", date: "2023-12-15" },
    { id: 8, vendor: 6, client: "Pape S.", rating: 5, comment: "Transaction immobilière très professionnelle. Agent très disponible.", date: "2023-12-01" }
  ],

  // ── ADVERTISERS / CAMPAIGNS ───────────────────────────────
  advertisers: [
    { id: 1, name: "Orange Sénégal", logo: "🟠", budget: 2500000, impressions: 145000, clicks: 8900, leads: 234, ctr: "6.1%", status: "active", startDate: "2024-01-01", endDate: "2024-03-31", category: "Télécommunications" },
    { id: 2, name: "Wave Mobile Money", logo: "💙", budget: 1800000, impressions: 98000, clicks: 6700, leads: 189, ctr: "6.8%", status: "active", startDate: "2024-01-15", endDate: "2024-02-15", category: "Fintech" },
    { id: 3, name: "Ecobank Sénégal", logo: "🏦", budget: 3200000, impressions: 212000, clicks: 11200, leads: 345, ctr: "5.3%", status: "active", startDate: "2024-01-10", endDate: "2024-04-10", category: "Banque & Finance" },
    { id: 4, name: "Dakar Dem Dikk", logo: "🚌", budget: 950000, impressions: 67000, clicks: 3400, leads: 89, ctr: "5.1%", status: "paused", startDate: "2023-12-01", endDate: "2024-01-31", category: "Transport" },
    { id: 5, name: "Bollé Cosmetics", logo: "✨", budget: 1200000, impressions: 89000, clicks: 7800, leads: 156, ctr: "8.8%", status: "active", startDate: "2024-01-20", endDate: "2024-02-20", category: "Beauté" },
    { id: 6, name: "Sahel Petroleum", logo: "⛽", budget: 4000000, impressions: 287000, clicks: 14500, leads: 412, ctr: "5.1%", status: "active", startDate: "2024-01-01", endDate: "2024-06-30", category: "Énergie" },
    { id: 7, name: "CityMall Dakar", logo: "🛍️", budget: 1600000, impressions: 112000, clicks: 9800, leads: 278, ctr: "8.8%", status: "active", startDate: "2024-01-25", endDate: "2024-03-25", category: "Commerce" },
    { id: 8, name: "TotalEnergies CI", logo: "🌿", budget: 2800000, impressions: 178000, clicks: 9200, leads: 267, ctr: "5.2%", status: "completed", startDate: "2023-11-01", endDate: "2024-01-01", category: "Énergie" }
  ],

  // ── REVENUE DATA (Simulated) ───────────────────────────────
  revenue: {
    monthly: [
      { month: "Juil 2023", amount: 2400000 },
      { month: "Août 2023", amount: 3100000 },
      { month: "Sep 2023", amount: 2800000 },
      { month: "Oct 2023", amount: 4200000 },
      { month: "Nov 2023", amount: 5100000 },
      { month: "Déc 2023", amount: 6800000 },
      { month: "Jan 2024", amount: 7200000 }
    ],
    totalRevenue: 31600000,
    totalAds: 18200000,
    totalSubscriptions: 9400000,
    totalLeads: 4000000,
    growth: 41.2
  },

  // ── PLATFORM STATS ────────────────────────────────────────
  stats: {
    totalUsers: 48234,
    totalVendors: 3420,
    totalClients: 43890,
    totalAdvertisers: 924,
    totalRequests: 12780,
    totalLeads: 89450,
    totalReviews: 34210,
    activeCountries: 8,
    activeCities: 47,
    avgRating: 4.7,
    userGrowth: 28.4,
    vendorGrowth: 35.2,
    revenueGrowth: 41.2,
    satisfaction: 96.8
  },

  // ── PLANS / PRICING ──────────────────────────────────────
  plans: [
    {
      id: "free", name: "Gratuit", price: 0, currency: "FCFA", period: "mois",
      features: ["Profil basique", "3 services max", "10 leads/mois", "Messagerie limitée", "Badge standard"],
      limitations: ["Pas de badge Vérifié", "Pas de mise en avant", "Statistiques basiques"],
      cta: "Commencer gratuitement", highlighted: false
    },
    {
      id: "pro", name: "Pro", price: 29900, currency: "FCFA", period: "mois",
      features: ["Profil complet", "Services illimités", "50 leads/mois", "Messagerie complète", "Badge Vérifié", "Statistiques avancées", "WhatsApp Business", "Galerie photos"],
      limitations: [],
      cta: "Passer au Pro", highlighted: false
    },
    {
      id: "business", name: "Business", price: 79900, currency: "FCFA", period: "mois",
      features: ["Tout le plan Pro", "Leads illimités", "Badge Top Vendeur", "Mise en avant permanente", "Publicité incluse", "Account manager dédié", "Rapports PDF", "API Access"],
      limitations: [],
      cta: "Choisir Business", highlighted: true
    },
    {
      id: "sponsored", name: "Sponsorisé", price: 149900, currency: "FCFA", period: "mois",
      features: ["Tout le plan Business", "Emplacement Premium Homepage", "Bannière dédiée", "Newsletter incluse", "Visibilité maximale", "Analytics temps réel", "Support prioritaire 24/7"],
      limitations: [],
      cta: "Devenir Sponsor", highlighted: false
    }
  ],

  // ── NOTIFICATIONS (Simulated) ─────────────────────────────
  notifications: [
    { id: 1, type: "lead", message: "Nouveau lead de Moussa D. pour votre service Marketing", time: "Il y a 5 min", read: false },
    { id: 2, type: "review", message: "Aminata S. a laissé un avis 5 étoiles", time: "Il y a 23 min", read: false },
    { id: 3, type: "message", message: "Nouveau message de Ibrahim K.", time: "Il y a 1h", read: false },
    { id: 4, type: "payment", message: "Paiement de 29 900 FCFA reçu — Plan Pro", time: "Il y a 3h", read: true },
    { id: 5, type: "system", message: "Votre profil a été vérifié avec succès ✓", time: "Hier", read: true }
  ],

  // ── MESSAGES (Simulated) ──────────────────────────────────
  messages: [
    { id: 1, from: "Moussa D.", avatar: "👤", preview: "Bonjour, je voudrais un devis pour...", time: "09:45", unread: true },
    { id: 2, from: "Fatou S.", avatar: "👩", preview: "Merci pour votre réponse rapide!", time: "Hier", unread: false },
    { id: 3, from: "Cheikh B.", avatar: "👨", preview: "Est-ce que vous pouvez venir ce samedi?", time: "Lun", unread: true },
    { id: 4, from: "Aïssatou K.", avatar: "👩", preview: "Je suis très satisfaite de votre service", time: "Dim", unread: false }
  ]
};

// ── HELPER FUNCTIONS ──────────────────────────────────────────
function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

function getStars(rating) {
  return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
}

function getBadgeClass(badge) {
  const classes = { 'Top': 'badge-top', 'Vérifié': 'badge-verified', 'Sponsorisé': 'badge-sponsored', 'Nouveau': 'badge-new', 'Populaire': 'badge-popular' };
  return classes[badge] || 'badge-default';
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return `Il y a ${diff} jours`;
  if (diff < 30) return `Il y a ${Math.floor(diff/7)} semaines`;
  return `Il y a ${Math.floor(diff/30)} mois`;
}
