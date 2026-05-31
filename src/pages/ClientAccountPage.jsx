import { Link } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { productService } from '../services/productService';
import { marketplaceService } from '../services/marketplaceService';
import { subscriptionPlanService } from '../services/subscriptionPlanService';
import SectionHeader from '../components/common/SectionHeader';
import VendorCard from '../components/common/VendorCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

function formatFcfa(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function ClientAccountPage() {
  const { data, loading, error } = useAsyncData(async () => {
    const [categories, services, vendors] = await Promise.all([
      productService.categories(),
      marketplaceService.getServices(),
      marketplaceService.getVendors()
    ]);

    const plans = await subscriptionPlanService.getPublicPlans();

    return {
      categories: Array.isArray(categories) ? categories : [],
      services: Array.isArray(services) ? services : [],
      vendors: Array.isArray(vendors) ? vendors : [],
      plans: Array.isArray(plans) ? plans : []
    };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <ErrorState message={error} />
      </div>
    );
  }

  const categories = data?.categories || [];
  const services = (data?.services || []).slice(0, 6);
  const vendors = (data?.vendors || []).slice(0, 3);
  const plans = data?.plans || [];

  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 28px)', paddingBottom: 32 }}>
      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon="money-bill-wave" label="Abonnements" title="Plans prestataire" subtitle="Abonnements pour devenir prestataire." />
        {plans.length === 0 ? (
          <EmptyState title="Aucun plan" message="Aucun abonnement n'est disponible pour le moment." />
        ) : (
          <div className="grid gap-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {plans.map((plan) => (
              <article key={plan.code} className="card p-24">
                <h3 style={{ fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                <p style={{ color: 'var(--brand-primary)', fontWeight: 800, marginBottom: 10 }}>{formatFcfa(plan.priceFcfa)}</p>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{plan.description}</p>
                <Link className="btn btn-primary btn-sm w-full" to={`/become-vendor?plan=${encodeURIComponent(plan.code)}`}>S'abonner</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon="layer-group" label="Catégories" title="Services disponibles" />
        {categories.length === 0 ? (
          <EmptyState title="Aucune catégorie" message="Les catégories apparaîtront ici." />
        ) : (
          <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {categories.slice(0, 8).map((category) => (
              <article key={category.id} className="card p-16" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{category.name}</div>
                  <small style={{ color: 'var(--text-muted)' }}>{category.count} prestataires</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon="screwdriver-wrench" label="Services populaires" title="Top services" />
        {services.length === 0 ? (
          <EmptyState title="Aucun service" message="Les services populaires apparaîtront ici." />
        ) : (
          <>
            <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {services.map((service, index) => (
                <article key={service.id} className="card p-16">
                  <h4 style={{ fontWeight: 800, marginBottom: 8 }}>{service.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: 8 }}>{service.vendorName}</p>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>{service.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong>{service.price} FCFA</strong>
                  </div>
                  <Link 
                    className="btn btn-primary btn-sm w-full" 
                    to={`/new-request?serviceId=${service.id || index + 1}&serviceTitle=${encodeURIComponent(service.title)}&vendorName=${encodeURIComponent(service.vendorName)}&price=${encodeURIComponent(service.price)}`}
                  >
                    Demander un devis
                  </Link>
                </article>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <Link className="btn btn-primary btn-sm" to="/services">Voir plus</Link>
            </div>
          </>
        )}
      </section>

      <section>
        <SectionHeader icon="user-gear" label="Recommandés" title="Prestataires recommandés" />
        {vendors.length === 0 ? (
          <EmptyState title="Aucun prestataire" message="Les recommandations apparaîtront ici." />
        ) : (
          <div className="grid grid-3 gap-24" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
