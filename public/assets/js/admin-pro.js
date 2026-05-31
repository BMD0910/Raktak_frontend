'use strict';
(function () {
  const STORAGE_KEY = 'raktakk_admin_local_db_v3';
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const state = {
    auth: null,
    users: [],
    vendors: [],
    advertisers: [],
    categories: [],
    subcategories: [],
    campaigns: [],
    listings: [],
    reviews: [],
    subscriptions: [],
    settings: [],
    filters: { users: '', vendors: '', advertisers: '', categories: '', campaigns: '', listings: '', reviews: '' },
    currentPage: 'dashboard',
    currentModal: null,
    editing: null,
    pendingDelete: null,
  };

  function isLocalAdminMode() { return document.body.dataset.localAdminMode === 'true'; }
  function getLocalAdminSession() {
    try { return JSON.parse(localStorage.getItem('raktakk_admin_session') || 'null'); } catch (e) { return null; }
  }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function slugify(value) { return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function uid(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
  function deepCopy(x) { return JSON.parse(JSON.stringify(x)); }
  function fmtDate(value) { return value ? new Date(value).toLocaleDateString('fr-FR') : '—'; }
  function fmtMoney(value) { return `${new Intl.NumberFormat('fr-FR').format(Number(value || 0))} FCFA`; }
  function fmtCompact(value) { return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0)); }
  function cap(v) { const s = String(v || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function badgeStatus(status) {
    const clean = String(status || 'inactive').toLowerCase();
    const label = clean === 'active' ? 'Actif' : clean === 'pending' ? 'En attente' : clean === 'suspended' ? 'Suspendu' : clean === 'inactive' ? 'Inactif' : clean;
    return `<span class="status-pill ${escapeHtml(clean)}">${escapeHtml(label)}</span>`;
  }
  function badgePlan(plan) {
    const clean = String(plan || 'free').toLowerCase();
    return `<span class="plan-pill ${escapeHtml(clean)}">${escapeHtml(clean)}</span>`;
  }
  function currentProfileName() {
    const p = state.auth?.profile || {};
    return p.full_name || p.company_name || p.email || 'Admin';
  }

  function seedLocalDb() {
    const categories = (window.RAKTAKK?.categories || []).slice(0, 10).map((c, i) => ({
      id: i + 1,
      name: c.name,
      slug: c.slug || slugify(c.name),
      icon: c.icon || c.emoji || '📁',
      status: 'active',
      display_order: i + 1,
      description: c.description || `Professionnels de ${c.name}`,
    }));
    const subcategories = categories.flatMap((cat, idx) => [
      { id: idx * 10 + 1, category_id: cat.id, name: `${cat.name} Premium`, slug: slugify(`${cat.name}-premium`), status: 'active' },
      { id: idx * 10 + 2, category_id: cat.id, name: `${cat.name} Standard`, slug: slugify(`${cat.name}-standard`), status: 'active' },
      { id: idx * 10 + 3, category_id: cat.id, name: `${cat.name} Express`, slug: slugify(`${cat.name}-express`), status: 'active' },
    ]);
    const vendors = (window.RAKTAKK?.vendors || []).slice(0, 10).map((v, i) => ({
      user_id: `vendor_${i + 1}`,
      category_id: categories.find((c) => c.name === v.category)?.id || categories[0]?.id || 1,
      category_name: v.category || categories[0]?.name || 'Services',
      website: v.website || '',
      price_range: v.price || 'Sur devis',
      services: v.services || [],
      verified: v.verified !== false,
      leads: v.leads || 0,
      rating: v.rating || 4.7,
      badge: v.badge || 'Vérifié',
      profiles: {
        id: `vendor_${i + 1}`,
        full_name: v.name,
        company_name: v.name,
        email: v.email || `vendor${i + 1}@raktakk.com`,
        city: v.city || 'Dakar',
        country: v.country || 'Sénégal',
        plan: v.plan || 'pro',
        account_status: v.verified === false ? 'pending' : 'active',
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
      },
    }));
    const advertisers = (window.RAKTAKK?.advertisers || []).slice(0, 7).map((a, i) => ({
      user_id: `advertiser_${i + 1}`,
      sector: a.category || 'Publicité',
      budget_range: String(a.budget || 0),
      ad_format: 'banner',
      impressions: a.impressions || 0,
      clicks: a.clicks || 0,
      leads: a.leads || 0,
      ctr: a.ctr || '0%',
      profiles: {
        id: `advertiser_${i + 1}`,
        full_name: a.name,
        company_name: a.name,
        email: `ads${i + 1}@raktakk.com`,
        city: 'Dakar',
        country: 'Sénégal',
        plan: 'sponsored',
        account_status: a.status === 'paused' ? 'pending' : 'active',
        created_at: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
      },
    }));
    const campaigns = (window.RAKTAKK?.advertisers || []).slice(0, 7).map((a, i) => ({
      id: `campaign_${i + 1}`,
      advertiser_name: a.name,
      budget: Number(a.budget || 0),
      impressions: a.impressions || 0,
      clicks: a.clicks || 0,
      leads: a.leads || 0,
      ctr: a.ctr || '0%',
      status: a.status || 'active',
      format: i % 2 === 0 ? 'banner homepage' : 'listing sponsorisée',
      location: i % 2 === 0 ? 'Homepage hero' : 'Search results',
      start_date: a.startDate || new Date().toISOString().slice(0, 10),
      end_date: a.endDate || new Date(Date.now() + 2592000000).toISOString().slice(0, 10),
    }));
    const listings = (window.RAKTAKK?.requests || []).slice(0, 8).map((r, i) => ({
      id: `listing_${i + 1}`,
      title: `${r.category} — ${r.city}`,
      owner: r.client,
      category: r.category,
      city: r.city,
      budget: r.budget,
      status: r.urgent ? 'pending' : 'active',
      description: r.description,
      created_at: r.date,
      responses: r.responses || 0,
    }));
    const reviews = (window.RAKTAKK?.reviews || []).slice(0, 8).map((r, i) => ({
      id: `review_${i + 1}`,
      vendor_name: (window.RAKTAKK?.vendors || []).find((v) => v.id === r.vendor)?.name || 'Prestataire',
      client: r.client,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      status: i < 2 ? 'pending' : 'active',
    }));
    const subscriptions = [
      { id: 'sub_1', plan: 'pro', amount: 29900, count: 1820, growth: '+12.3%' },
      { id: 'sub_2', plan: 'business', amount: 79900, count: 428, growth: '+18.1%' },
      { id: 'sub_3', plan: 'sponsored', amount: 149900, count: 117, growth: '+9.8%' },
    ];
    const users = [
      { id: 'local-admin', email: 'admin@raktakk.com', username: 'admin', role: 'admin', full_name: 'Administrateur Raktakk', company_name: 'Raktakk', city: 'Dakar', plan: 'business', account_status: 'active', created_at: new Date().toISOString() },
      ...vendors.map((v) => ({ id: v.user_id, email: v.profiles.email, full_name: v.profiles.full_name, company_name: v.profiles.company_name, role: 'vendor', city: v.profiles.city, plan: v.profiles.plan, account_status: v.profiles.account_status, created_at: v.profiles.created_at })),
      ...advertisers.map((a) => ({ id: a.user_id, email: a.profiles.email, full_name: a.profiles.full_name, company_name: a.profiles.company_name, role: 'advertiser', city: a.profiles.city, plan: a.profiles.plan, account_status: a.profiles.account_status, created_at: a.profiles.created_at })),
      { id: 'client_1', email: 'client1@raktakk.com', full_name: 'Aminata Diallo', company_name: '', role: 'client', city: 'Dakar', plan: 'free', account_status: 'pending', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 'client_2', email: 'client2@raktakk.com', full_name: 'Mamadou Kane', company_name: '', role: 'client', city: 'Thiès', plan: 'free', account_status: 'active', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    ];
    const settings = [
      { key: 'home_hero', value_json: { title: 'Trouvez les meilleurs professionnels en Afrique de l\'Ouest', subtitle: 'Marketplace B2B premium prête à scaler', badge: 'Version PRO' } },
      { key: 'seo', value_json: { meta_title: 'Raktakk — Le marketplace business africain', meta_description: 'Raktakk connecte entreprises, prestataires et annonceurs en Afrique.' } },
      { key: 'platform', value_json: { site_name: 'Raktakk', slogan: 'Trouvez. Connectez. Grandissez.', language: 'Français', currency: 'FCFA', timezone: 'Africa/Dakar (GMT+0)' } },
      { key: 'notifications', value_json: { welcome_email: true, leads: true, weekly_report: true, moderation: true } },
      { key: 'features', value_json: { messaging: true, favorites: true, sponsored: true, vendor_signup: true, reviews: true, blog: false } },
    ];
    return { users, vendors, advertisers, categories, subcategories, campaigns, listings, reviews, subscriptions, settings };
  }

  function loadLocalDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seedLocalDb();
      return { ...seedLocalDb(), ...JSON.parse(raw) };
    } catch (e) {
      return seedLocalDb();
    }
  }
  function saveLocalDb() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: state.users,
      vendors: state.vendors,
      advertisers: state.advertisers,
      categories: state.categories,
      subcategories: state.subcategories,
      campaigns: state.campaigns,
      listings: state.listings,
      reviews: state.reviews,
      subscriptions: state.subscriptions,
      settings: state.settings,
    }));
  }

  async function fetchAll() {
    if (isLocalAdminMode() || !window.RAKTAKK_API?.supabase) {
      const db = loadLocalDb();
      Object.assign(state, deepCopy(db));
      return;
    }
    const sb = window.RAKTAKK_API.supabase;
    const [profilesRes, vendorRes, advRes, catRes, subRes, settingsRes] = await Promise.all([
      sb.from('profiles').select('*').order('created_at', { ascending: false }),
      sb.from('vendor_profiles').select('*, profiles!vendor_profiles_user_id_fkey(*)').order('created_at', { ascending: false }),
      sb.from('advertiser_profiles').select('*, profiles!advertiser_profiles_user_id_fkey(*)').order('created_at', { ascending: false }),
      sb.from('categories').select('*').order('display_order', { ascending: true }),
      sb.from('subcategories').select('*, categories(name)').order('name', { ascending: true }),
      sb.from('site_settings').select('*').order('key', { ascending: true }),
    ]);
    [profilesRes, vendorRes, advRes, catRes, subRes, settingsRes].forEach((r) => { if (r.error) throw r.error; });
    state.users = profilesRes.data || [];
    state.vendors = (vendorRes.data || []).map((v) => ({ ...v, category_name: state.categories.find((c) => c.id === v.category_id)?.name || v.category_name || 'Services' }));
    state.advertisers = advRes.data || [];
    state.categories = catRes.data || [];
    state.subcategories = (subRes.data || []).map((s) => ({ ...s, categories: { name: s.categories?.name || state.categories.find((c) => c.id === s.category_id)?.name || '—' } }));
    state.settings = settingsRes.data || [];
    if (!state.campaigns.length) state.campaigns = seedLocalDb().campaigns;
    if (!state.listings.length) state.listings = seedLocalDb().listings;
    if (!state.reviews.length) state.reviews = seedLocalDb().reviews;
    if (!state.subscriptions.length) state.subscriptions = seedLocalDb().subscriptions;
  }

  function switchAdminPage(pageId) {
    state.currentPage = pageId;
    qsa('.admin-page').forEach((p) => p.classList.toggle('active', p.id === pageId));
    qsa('.admin-link[data-admin-page]').forEach((link) => link.classList.toggle('active', link.dataset.adminPage === pageId));
    const activeLink = qs(`.admin-link[data-admin-page="${pageId}"]`);
    const bc = qs('.breadcrumb-current');
    if (bc && activeLink) bc.textContent = activeLink.textContent.trim();
    window.history.replaceState(null, '', `#${pageId}`);
    qs('.admin-sidebar')?.classList.remove('open');
  }

  function ensureChromeBindings() {
    qsa('.admin-link[data-admin-page]').forEach((link) => {
      link.onclick = (e) => { e.preventDefault(); switchAdminPage(link.dataset.adminPage); };
    });
    qs('.admin-menu-btn')?.addEventListener('click', () => qs('.admin-sidebar')?.classList.toggle('open'));
    qsa('.settings-nav-link[data-settings]').forEach((link) => {
      link.onclick = () => {
        qsa('.settings-nav-link[data-settings]').forEach((l) => l.classList.remove('active'));
        qsa('.settings-panel').forEach((p) => p.classList.remove('active'));
        link.classList.add('active');
        qs(`#${link.dataset.settings}`)?.classList.add('active');
      };
    });
    qsa('.settings-nav-link[data-settings]')[0]?.click();
    const initHash = window.location.hash.slice(1);
    switchAdminPage(qs(`#${initHash}`)?.classList.contains('admin-page') ? initHash : 'dashboard');
  }

  function injectPremiumDashboard() {
    const page = qs('#dashboard');
    if (!page || qs('.admin-hero', page)) return;
    const hero = document.createElement('div');
    hero.className = 'admin-hero';
    hero.innerHTML = `
      <div class="admin-hero-grid">
        <div>
          <div class="admin-badge-soft">⚡ Dashboard Premium · ${escapeHtml(currentProfileName())}</div>
          <h2>Adminisez Raktakk avec une vue claire, rapide et élégante.</h2>
          <p>Supervisez les utilisateurs, les prestataires, les annonceurs, les campagnes et le contenu du site depuis une seule interface moderne pensée pour la production.</p>
          <div class="admin-hero-stat-row">
            <div class="admin-hero-stat"><strong>${state.users.length}</strong><span>Utilisateurs pilotés</span></div>
            <div class="admin-hero-stat"><strong>${state.categories.length}</strong><span>Catégories actives</span></div>
            <div class="admin-hero-stat"><strong>${fmtCompact(totalRevenue())}</strong><span>CA cumulé</span></div>
          </div>
        </div>
        <div class="admin-hero-card">
          <div class="admin-hero-card-title">Priorités du jour</div>
          <div class="admin-hero-list">
            <div class="admin-hero-list-item"><span>Comptes à valider</span><strong>${pendingUsers().length}</strong></div>
            <div class="admin-hero-list-item"><span>Avis à modérer</span><strong>${state.reviews.filter((r) => r.status === 'pending').length}</strong></div>
            <div class="admin-hero-list-item"><span>Campagnes actives</span><strong>${state.campaigns.filter((c) => c.status === 'active').length}</strong></div>
            <div class="admin-hero-list-item"><span>Listings publiés</span><strong>${state.listings.length}</strong></div>
          </div>
        </div>
      </div>`;
    page.insertBefore(hero, page.firstElementChild);
  }

  function totalRevenue() {
    const subs = state.subscriptions.reduce((sum, s) => sum + (Number(s.amount) * Number(s.count)), 0);
    const ads = state.campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);
    return subs + ads;
  }
  function pendingUsers() { return state.users.filter((u) => String(u.account_status) === 'pending'); }
  function findUser(id) { return state.users.find((u) => String(u.id) === String(id)); }
  function findVendor(id) { return state.vendors.find((v) => String(v.user_id) === String(id)); }
  function findAdvertiser(id) { return state.advertisers.find((a) => String(a.user_id) === String(id)); }

  function renderDashboardStats() {
    const kpis = qsa('.admin-kpi-val');
    if (kpis[0]) kpis[0].textContent = state.users.length.toLocaleString('fr-FR');
    if (kpis[1]) kpis[1].textContent = state.vendors.length.toLocaleString('fr-FR');
    if (kpis[2]) kpis[2].textContent = fmtCompact(state.vendors.reduce((sum, v) => sum + Number(v.leads || 0), 0));
    if (kpis[3]) kpis[3].textContent = fmtCompact(totalRevenue());
    if (kpis[4]) kpis[4].textContent = state.advertisers.length.toLocaleString('fr-FR');
    if (kpis[5]) kpis[5].textContent = state.reviews.length.toLocaleString('fr-FR');
    if (kpis[7]) kpis[7].textContent = pendingUsers().length.toLocaleString('fr-FR');

    const recent = qs('#recent-users-list');
    if (recent) {
      recent.innerHTML = state.users.slice(0, 6).map((u) => `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--border-light);">
          <div style="width:40px;height:40px;border-radius:12px;background:var(--bg-subtle);display:flex;align-items:center;justify-content:center;font-size:1.1rem;">${u.role === 'vendor' ? '🏢' : u.role === 'advertiser' ? '📢' : u.role === 'admin' ? '🛡️' : '👤'}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;">${escapeHtml(u.company_name || u.full_name || 'Sans nom')}</div>
            <div style="font-size:.74rem;color:var(--text-muted);">${escapeHtml(u.role)} · ${escapeHtml(u.city || '—')}</div>
          </div>
          <div style="font-size:.72rem;color:var(--text-muted);">${fmtDate(u.created_at)}</div>
        </div>`).join('');
    }
    renderRevenueChart();
  }

  function renderRevenueChart() {
    const container = qs('#admin-revenue-chart');
    if (!container) return;
    const monthly = window.RAKTAKK?.revenue?.monthly || [];
    const data = monthly.length ? monthly : [
      { month: 'Jan', amount: 1200000 }, { month: 'Fév', amount: 1500000 }, { month: 'Mar', amount: 2100000 },
      { month: 'Avr', amount: 2600000 }, { month: 'Mai', amount: 2400000 }, { month: 'Juin', amount: 3100000 },
    ];
    const max = Math.max(...data.map((d) => Number(d.amount) || 1), 1);
    container.innerHTML = `
      <div class="admin-chart">${data.map((d) => `<div class="admin-chart-bar primary" style="height:${Math.max((Number(d.amount) / max) * 100, 6)}%"><div class="admin-chart-bar-tip">${fmtCompact(d.amount)} FCFA</div></div>`).join('')}</div>
      <div class="admin-chart-labels">${data.map((d) => `<div class="admin-chart-label">${escapeHtml(String(d.month).slice(0, 3))}</div>`).join('')}</div>`;
  }

  function renderUsers() {
    const tbody = qs('#admin-users-tbody');
    if (!tbody) return;
    const q = state.filters.users.toLowerCase();
    const users = state.users.filter((u) => !q || `${u.company_name || ''} ${u.full_name || ''} ${u.email || ''} ${u.city || ''} ${u.role || ''}`.toLowerCase().includes(q));
    tbody.innerHTML = users.map((u) => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${u.role === 'vendor' ? '🏢' : u.role === 'advertiser' ? '📢' : u.role === 'admin' ? '🛡️' : '👤'}</div>
            <div><div class="user-name">${escapeHtml(u.company_name || u.full_name || 'Sans nom')}</div><div class="user-email">${escapeHtml(u.email || '')}</div></div>
          </div>
        </td>
        <td>${badgeStatus(u.role)}</td>
        <td>${escapeHtml(u.city || '—')}</td>
        <td>${badgePlan(u.plan || 'free')}</td>
        <td>${badgeStatus(u.account_status)}</td>
        <td>${fmtDate(u.created_at)}</td>
        <td><div class="actions">
          <button class="action-btn action-view" onclick="window.raktakkAdmin.viewUser('${u.id}')" title="Voir">👁</button>
          <button class="action-btn action-edit" onclick="window.raktakkAdmin.editUser('${u.id}')" title="Modifier">✏️</button>
          <button class="action-btn ${u.account_status === 'active' ? 'action-delete' : 'action-approve'}" onclick="window.raktakkAdmin.toggleUserStatus('${u.id}','${u.account_status === 'active' ? 'suspended' : 'active'}')" title="Basculer statut">${u.account_status === 'active' ? '⛔' : '✓'}</button>
        </div></td>
      </tr>`).join('') || `<tr><td colspan="7"><div class="admin-empty-state"><div class="empty-icon">👥</div><div>Aucun utilisateur trouvé.</div></div></td></tr>`;
    const sub = qs('#users .admin-page-sub');
    if (sub) sub.textContent = `${users.length.toLocaleString('fr-FR')} comptes enregistrés`;
  }

  function renderVendors() {
    const tbody = qs('#admin-vendors-tbody');
    if (!tbody) return;
    const q = state.filters.vendors.toLowerCase();
    const vendors = state.vendors.filter((v) => !q || `${v.profiles?.company_name || ''} ${v.profiles?.email || ''} ${v.category_name || ''} ${v.profiles?.city || ''}`.toLowerCase().includes(q));
    tbody.innerHTML = vendors.map((v) => {
      const p = v.profiles || {};
      return `
        <tr>
          <td><div class="user-cell"><div class="user-avatar">🏢</div><div><div class="user-name">${escapeHtml(p.company_name || p.full_name || 'Prestataire')}</div><div class="user-email">${escapeHtml(p.email || '')}</div></div></div></td>
          <td>${escapeHtml(p.city || '—')}</td>
          <td>⭐ ${escapeHtml(v.rating || '4.7')}</td>
          <td><span class="admin-badge-soft">${escapeHtml(v.badge || (v.verified ? 'Vérifié' : 'À vérifier'))}</span></td>
          <td>${badgePlan(p.plan || 'pro')}</td>
          <td>${(Number(v.leads || 0)).toLocaleString('fr-FR')}</td>
          <td>${badgeStatus(p.account_status || 'pending')}</td>
          <td><div class="actions">
            <button class="action-btn action-view" onclick="window.raktakkAdmin.viewVendor('${v.user_id}')">👁</button>
            <button class="action-btn action-edit" onclick="window.raktakkAdmin.editVendor('${v.user_id}')">✏️</button>
            <button class="action-btn action-approve" onclick="window.raktakkAdmin.toggleUserStatus('${v.user_id}','active')">✓</button>
          </div></td>
        </tr>`;
    }).join('') || `<tr><td colspan="8"><div class="admin-empty-state"><div class="empty-icon">🏢</div><div>Aucun prestataire trouvé.</div></div></td></tr>`;
    const sub = qs('#vendors .admin-page-sub');
    if (sub) sub.textContent = `${vendors.length.toLocaleString('fr-FR')} prestataires inscrits`;
  }

  function renderAdvertisers() {
    const tbodyA = qs('#admin-campaigns-tbody');
    const tbodyC = qs('#admin-campaigns-tbody-2');
    const q = state.filters.advertisers.toLowerCase();
    const advertisers = state.advertisers.filter((a) => !q || `${a.profiles?.company_name || ''} ${a.profiles?.email || ''} ${a.sector || ''}`.toLowerCase().includes(q));
    const campaigns = state.campaigns.filter((c) => !state.filters.campaigns || `${c.advertiser_name} ${c.location} ${c.format}`.toLowerCase().includes(state.filters.campaigns.toLowerCase()));
    const renderCampaignRow = (item, mode = 'advertiser') => `
      <tr>
        <td><div class="user-cell"><div class="user-avatar">📢</div><div><div class="user-name">${escapeHtml(item.advertiser_name || item.profiles?.company_name || item.profiles?.full_name || 'Annonceur')}</div><div class="user-email">${escapeHtml(item.format || item.sector || '')}</div></div></div></td>
        <td>${fmtMoney(item.budget || item.budget_range || 0)}</td>
        <td>${fmtCompact(item.impressions || 0)}</td>
        <td>${fmtCompact(item.clicks || 0)}</td>
        <td>${escapeHtml(item.ctr || '—')}</td>
        <td>${fmtCompact(item.leads || 0)}</td>
        <td>${badgeStatus(item.status || item.profiles?.account_status || 'active')}</td>
        <td><div class="actions">
          <button class="action-btn action-view" onclick="window.raktakkAdmin.viewCampaign('${item.id || item.user_id}')">👁</button>
          <button class="action-btn action-edit" onclick="window.raktakkAdmin.edit${mode === 'advertiser' ? 'Advertiser' : 'Campaign'}('${item.id || item.user_id}')">✏️</button>
        </div></td>
      </tr>`;
    if (tbodyA) tbodyA.innerHTML = advertisers.map((a) => renderCampaignRow({
      user_id: a.user_id,
      advertiser_name: a.profiles?.company_name || a.profiles?.full_name,
      budget: Number(a.budget_range || 0), impressions: a.impressions || 0, clicks: a.clicks || 0, ctr: a.ctr || '—', leads: a.leads || 0,
      status: a.profiles?.account_status || 'active', sector: a.sector,
    }, 'advertiser')).join('') || `<tr><td colspan="8"><div class="admin-empty-state"><div class="empty-icon">📢</div><div>Aucun annonceur trouvé.</div></div></td></tr>`;
    if (tbodyC) tbodyC.innerHTML = campaigns.map((c) => renderCampaignRow(c, 'Campaign')).join('') || `<tr><td colspan="8"><div class="admin-empty-state"><div class="empty-icon">🎯</div><div>Aucune campagne trouvée.</div></div></td></tr>`;
    const sub = qs('#advertisers .admin-page-sub');
    if (sub) sub.textContent = `${advertisers.length.toLocaleString('fr-FR')} annonceurs actifs`;
  }

  function renderPending() {
    const wrap = qs('#pending-accounts-list');
    if (!wrap) return;
    const pending = pendingUsers();
    wrap.innerHTML = pending.map((u) => `
      <div class="entity-card">
        <div class="entity-card-head">
          <div>
            <div class="entity-card-title">${escapeHtml(u.company_name || u.full_name || 'Compte')}</div>
            <div class="entity-card-sub">${escapeHtml(u.email || '')} · ${escapeHtml(u.role)}</div>
          </div>
          ${badgeStatus('pending')}
        </div>
        <div class="entity-meta"><span>📍 ${escapeHtml(u.city || '—')}</span><span>🗓 ${fmtDate(u.created_at)}</span></div>
        <div class="entity-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.viewUser('${u.id}')">Voir le profil</button>
          <button class="btn btn-primary btn-sm" onclick="window.raktakkAdmin.toggleUserStatus('${u.id}','active')">Valider</button>
          <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.toggleUserStatus('${u.id}','suspended')">Suspendre</button>
        </div>
      </div>`).join('') || `<div class="admin-empty-state"><div class="empty-icon">✅</div><div>Tous les comptes sont déjà traités.</div></div>`;
    const sub = qs('#pending .admin-page-sub');
    if (sub) sub.textContent = `${pending.length} profils nécessitent une validation`;
  }

  function renderCategories() {
    const tbody = qs('#admin-cats-tbody');
    if (!tbody) return;
    const q = state.filters.categories.toLowerCase();
    const categories = state.categories.filter((c) => !q || `${c.name} ${c.slug}`.toLowerCase().includes(q));
    tbody.innerHTML = categories.map((c) => {
      const count = state.vendors.filter((v) => String(v.category_id) === String(c.id) || v.category_name === c.name).length;
      return `
        <tr>
          <td style="font-size:1.2rem;">${escapeHtml(c.icon || '📁')}</td>
          <td><div class="user-name">${escapeHtml(c.name)}</div><div class="user-email">/${escapeHtml(c.slug)}</div></td>
          <td>${count}</td>
          <td>${c.display_order || '—'}</td>
          <td>${badgeStatus(c.status || 'active')}</td>
          <td><div class="actions">
            <button class="action-btn action-view" onclick="window.raktakkAdmin.viewCategory('${c.id}')">👁</button>
            <button class="action-btn action-edit" onclick="window.raktakkAdmin.editCategory('${c.id}')">✏️</button>
            <button class="action-btn action-delete" onclick="window.raktakkAdmin.deleteCategory('${c.id}')">🗑️</button>
          </div></td>
        </tr>`;
    }).join('') || `<tr><td colspan="6"><div class="admin-empty-state"><div class="empty-icon">🗂️</div><div>Aucune catégorie.</div></div></td></tr>`;
    renderSubcategories();
    const sub = qs('#categories .admin-page-sub');
    if (sub) sub.textContent = `${categories.length} catégories actives`;
  }

  function renderSubcategories() {
    const tbody = qs('#subs-tbody');
    if (!tbody) return;
    tbody.innerHTML = state.subcategories.map((s) => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.categories?.name || state.categories.find((c) => String(c.id) === String(s.category_id))?.name || '—')}</td>
        <td>${badgeStatus(s.status || 'active')}</td>
        <td><div class="actions">
          <button class="action-btn action-view" onclick="window.raktakkAdmin.viewSubcategory('${s.id}')">👁</button>
          <button class="action-btn action-edit" onclick="window.raktakkAdmin.editSubcategory('${s.id}')">✏️</button>
          <button class="action-btn action-delete" onclick="window.raktakkAdmin.deleteSubcategory('${s.id}')">🗑️</button>
        </div></td>
      </tr>`).join('');
  }

  function renderSubscriptionPlans() {
    const page = qs('#subscription-plans');
    if (!page) return;
    if (!state.subscriptions.length) state.subscriptions = seedLocalDb().subscriptions;
    const cards = state.subscriptions.map((s) => `
      <div class="entity-card" style="border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
        <div style="flex:1;">
          <div class="entity-card-title" style="margin-bottom:4px;">${escapeHtml(cap(s.plan))}</div>
          <div class="entity-card-sub">${escapeHtml(s.plan)}</div>
          <div style="font-size:1.8rem;font-weight:700;margin:12px 0;color:var(--brand-primary);">${fmtMoney(s.amount)}</div>
          <div style="display:flex;gap:12px;font-size:.85rem;color:var(--text-muted);">
            <div>📈 ${s.count || 0} abonnés</div>
            <div>🎯 ${s.leads || 0} leads</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="window.raktakkAdmin.editPlan('${s.id}')">Modifier</button>
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="window.raktakkAdmin.deletePlan('${s.id}')">Supprimer</button>
        </div>
      </div>`).join('');
    const rows = state.subscriptions.map((s) => `
      <tr>
        <td><strong>${escapeHtml(String(s.plan || '').toUpperCase())}</strong></td>
        <td>${escapeHtml(s.plan)}</td>
        <td>${fmtMoney(s.amount)}</td>
        <td>${s.leads || 0}</td>
        <td>30 jours</td>
        <td>${badgeStatus('active')}</td>
        <td>${fmtCompact(s.count || 0)}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.editPlan('${s.id}')">Éditer</button></td>
      </tr>`).join('');
    page.innerHTML = `
      <div class="admin-page-header">
        <div><h1 class="admin-page-title">Gestion des plans</h1><p class="admin-page-sub">Créez et modifiez les plans d'abonnement disponibles pour les prestataires</p></div>
        <div class="admin-page-actions">
          <button class="btn btn-secondary btn-sm" data-export="plans">⬇ Exporter plans</button>
          <button class="btn btn-primary btn-sm" data-admin-open="add-plan">+ Nouveau plan</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-bottom:24px;">${cards}</div>
      <div class="admin-panel">
        <div class="admin-panel-header"><span class="admin-panel-title">📋 Tous les plans</span></div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Code</th><th>Nom</th><th>Prix (FCFA)</th><th>Leads</th><th>Durée</th><th>Statut</th><th>Abonnés</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  function renderSubscribers() {
    const page = qs('#subscribers');
    if (!page) return;
    const rows = (state.vendors || []).slice(0, 30).map((v) => {
      const p = v.profiles || {};
      const plan = p.plan || 'free';
      const amount = (state.subscriptions.find((s) => s.plan === plan) || state.subscriptions[0] || {}).amount || 0;
      return `
        <tr>
          <td><strong>${escapeHtml(p.company_name || p.full_name || '—')}</strong></td>
          <td>${escapeHtml(p.email || '—')}</td>
          <td>${escapeHtml(p.city || '—')}</td>
          <td>${badgePlan(plan)}</td>
          <td>${fmtMoney(amount)}</td>
          <td>${fmtDate(p.created_at)}</td>
          <td>${fmtDate(new Date(Date.now() + 30 * 86400000).toISOString())}</td>
          <td>${badgeStatus(p.account_status || 'active')}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.viewSubscriber('${v.user_id}')">Voir</button>
            <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.toggleSubscriberStatus('${v.user_id}')">Suspendre</button>
          </td>
        </tr>`;
    }).join('');
    page.innerHTML = `
      <div class="admin-page-header">
        <div><h1 class="admin-page-title">Abonnés actifs</h1><p class="admin-page-sub">Gestion des prestataires abonnés et leurs souscriptions</p></div>
        <div class="admin-page-actions">
          <button class="btn btn-secondary btn-sm" data-export="subscribers">⬇ Exporter abonnés</button>
          <button class="btn btn-primary btn-sm" onclick="showToast('Envoi de notification en cours...','info')">📧 Notifier tous</button>
        </div>
      </div>
      <div class="admin-filters">
        <div class="filter-group">
          <select class="filter-select" id="sub-plan-filter"><option value="">Tous les plans</option><option value="free">Gratuit</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="business">Business</option></select>
          <select class="filter-select" id="sub-status-filter"><option value="">Tous les statuts</option><option value="active">Actif</option><option value="pending">En attente</option><option value="cancelled">Annulé</option></select>
          <select class="filter-select" id="sub-city-filter"><option value="">Toutes les villes</option><option value="Dakar">Dakar</option><option value="Abidjan">Abidjan</option><option value="Bamako">Bamako</option></select>
        </div>
        <div class="filter-search"><span style="color:var(--text-muted);">🔍</span><input type="text" id="sub-search-input" placeholder="Chercher par nom, email..." /></div>
        <button class="btn btn-primary btn-sm">Filtrer</button>
      </div>
      <div class="admin-panel">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Prestataire</th><th>Email</th><th>Ville</th><th>Plan actuel</th><th>Prix/mois</th><th>Date souscription</th><th>Renouvellement</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    bindSubscriberFilters();
  }

  function bindSubscriberFilters() {
    ['#sub-plan-filter', '#sub-status-filter', '#sub-city-filter', '#sub-search-input'].forEach((selector) => {
      const el = qs(selector);
      if (!el) return;
      el.oninput = () => renderSubscribers();
      el.onchange = () => renderSubscribers();
    });
  }

  function renderSubscriptions() {
    renderSubscriptionPlans();
  }

  function renderReviews() {
    const page = qs('#reviews-mod');
    if (!page) return;
    page.innerHTML = `
      <div class="admin-page-header">
        <div><h1 class="admin-page-title">Modération des avis</h1><p class="admin-page-sub">Contrôlez la qualité et la conformité des commentaires publiés</p></div>
        <div class="admin-page-actions"><button class="btn btn-secondary btn-sm" data-export="reviews">⬇ Exporter</button></div>
      </div>
      <div class="entity-card-grid">
        ${state.reviews.map((r) => `
          <div class="entity-card">
            <div class="entity-card-head"><div><div class="entity-card-title">${escapeHtml(r.vendor_name)}</div><div class="entity-card-sub">Par ${escapeHtml(r.client)} · ${fmtDate(r.date)}</div></div>${badgeStatus(r.status)}</div>
            <div class="entity-meta"><span>⭐ ${escapeHtml(r.rating)}/5</span><span>ID ${escapeHtml(r.id)}</span></div>
            <div style="color:var(--text-secondary);font-size:.88rem;line-height:1.6;">${escapeHtml(r.comment)}</div>
            <div class="entity-actions" style="margin-top:16px;">
              <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.viewReview('${r.id}')">Voir</button>
              <button class="btn btn-primary btn-sm" onclick="window.raktakkAdmin.approveReview('${r.id}')">Approuver</button>
              <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.rejectReview('${r.id}')">Rejeter</button>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function renderListings() {
    const page = qs('#listings');
    if (!page) return;
    page.innerHTML = `
      <div class="admin-page-header">
        <div><h1 class="admin-page-title">Annonces & services</h1><p class="admin-page-sub">Gérez toutes les offres publiées par les clients et partenaires</p></div>
        <div class="admin-page-actions"><button class="btn btn-primary btn-sm" data-admin-open="listing">+ Créer une annonce</button></div>
      </div>
      <div class="entity-card-grid">
        ${state.listings.map((l) => `
          <div class="entity-card">
            <div class="entity-card-head"><div><div class="entity-card-title">${escapeHtml(l.title)}</div><div class="entity-card-sub">${escapeHtml(l.owner)} · ${escapeHtml(l.city)}</div></div>${badgeStatus(l.status)}</div>
            <div style="font-size:.86rem;color:var(--text-secondary);line-height:1.6;">${escapeHtml(l.description)}</div>
            <div class="entity-meta"><span>🏷 ${escapeHtml(l.category)}</span><span>💰 ${escapeHtml(l.budget)}</span><span>💬 ${Number(l.responses || 0)} réponses</span></div>
            <div class="entity-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.viewListing('${l.id}')">Voir</button>
              <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.editListing('${l.id}')">Modifier</button>
              <button class="btn btn-secondary btn-sm" onclick="window.raktakkAdmin.deleteListing('${l.id}')">Supprimer</button>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function renderSettings() {
    const p = state.auth?.profile || {};
    const platform = state.settings.find((x) => x.key === 'platform')?.value_json || {};
    const seo = state.settings.find((x) => x.key === 'seo')?.value_json || {};
    const features = state.settings.find((x) => x.key === 'features')?.value_json || {};
    const notifications = state.settings.find((x) => x.key === 'notifications')?.value_json || {};
    const security = qs('#security .admin-form-section');
    if (security && !qs('#admin-credentials-card')) {
      const card = document.createElement('div');
      card.id = 'admin-credentials-card';
      card.className = 'settings-highlight';
      card.innerHTML = `
        <div class="admin-form-section-title">🛡️ Accès administrateur</div>
        <div class="admin-form-grid">
          <div class="form-group"><label class="admin-label">Identifiant admin</label><input class="admin-input" id="admin-username-input" value="${escapeHtml(p.username || 'admin')}" /></div>
          <div class="form-group"><label class="admin-label">Email admin</label><input class="admin-input" id="admin-email-input" type="email" value="${escapeHtml(p.email || 'admin@raktakk.com')}" /></div>
        </div>
        <div class="form-group"><label class="admin-label">Nouveau mot de passe</label><input class="admin-input" id="admin-password-input" type="password" placeholder="Laisser vide pour conserver" /></div>
        <button class="btn btn-primary btn-sm" id="save-admin-credentials-btn">Enregistrer les identifiants admin</button>`;
      security.appendChild(card);
      qs('#save-admin-credentials-btn')?.addEventListener('click', saveAdminCredentials);
    }
    const general = qsa('#general .admin-input');
    if (general[0]) general[0].value = platform.site_name || general[0].value;
    if (general[1]) general[1].value = platform.slogan || general[1].value;
    if (general[2]) general[2].value = platform.language || general[2].value;
    if (general[3]) general[3].value = platform.currency || general[3].value;
    if (general[4]) general[4].value = platform.timezone || general[4].value;
    const seoInputs = qsa('#seo .admin-input');
    if (seoInputs[0]) seoInputs[0].value = seo.meta_title || seoInputs[0].value;
    if (seoInputs[1]) seoInputs[1].value = seo.meta_description || seoInputs[1].value;
    const featureOrder = ['messaging', 'favorites', 'sponsored', 'vendor_signup', 'reviews', 'blog'];
    qsa('#features input[type="checkbox"]').forEach((cb, i) => cb.checked = Boolean(features[featureOrder[i]]));
    const notifOrder = ['welcome_email', 'leads', 'weekly_report', 'moderation'];
    qsa('#notifications input[type="checkbox"]').forEach((cb, i) => cb.checked = Boolean(notifications[notifOrder[i]]));
  }

  function wireFilters() {
    const pageMap = { '#users .filter-search input': 'users', '#vendors .filter-search input': 'vendors' };
    Object.entries(pageMap).forEach(([sel, key]) => {
      const input = qs(sel);
      if (!input) return;
      input.oninput = () => { state.filters[key] = input.value.trim(); renderAllTables(); };
    });
    const topSearch = qs('.admin-search input');
    if (topSearch) topSearch.oninput = () => {
      const val = topSearch.value.trim();
      const map = { users: 'users', vendors: 'vendors', advertisers: 'advertisers', categories: 'categories', campaigns: 'campaigns', listings: 'listings', 'reviews-mod': 'reviews' };
      const key = map[state.currentPage];
      if (key) { state.filters[key] = val; renderAllTables(); }
    };
  }

  function renderAllTables() {
    injectPremiumDashboard();
    renderDashboardStats();
    renderUsers();
    renderVendors();
    renderAdvertisers();
    renderPending();
    renderCategories();
    renderSubscriptionPlans();
    renderSubscribers();
    renderReviews();
    renderListings();
    renderSettings();
    bindPageActions();
  }

  function modalShell(id, size = '') {
    return `<div class="admin-modal-overlay" id="${id}"><div class="admin-modal ${size}"></div></div>`;
  }
  function ensureModals() {
    if (!qs('#entity-modal')) document.body.insertAdjacentHTML('beforeend', modalShell('entity-modal'));
    if (!qs('#detail-modal')) document.body.insertAdjacentHTML('beforeend', modalShell('detail-modal'));
    if (!qs('#confirm-modal')) document.body.insertAdjacentHTML('beforeend', modalShell('confirm-modal', 'admin-modal-sm'));
    qsa('.admin-modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
    });
  }
  function openModal(id, html) {
    ensureModals();
    const overlay = qs(`#${id}`); if (!overlay) return;
    qs('.admin-modal', overlay).innerHTML = html;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    state.currentModal = id;
    qsa('[data-modal-close]', overlay).forEach((btn) => btn.onclick = () => closeModal(id));
    overlay.querySelector('form')?.addEventListener('submit', handleModalSubmit);
  }
  function closeModal(id = state.currentModal) {
    const overlay = qs(`#${id}`); if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    state.currentModal = null;
    state.editing = null;
    state.pendingDelete = null;
  }

  function userFormTemplate(mode = 'create', user = null, rolePreset = 'client') {
    const role = user?.role || rolePreset || 'client';
    return `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${mode === 'edit' ? 'Modifier l\'utilisateur' : 'Créer un compte'}</div><div class="admin-modal-sub">Prestataire, annonceur, client ou administrateur</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <form data-entity="user" data-mode="${mode}" data-id="${escapeHtml(user?.id || '')}">
        <div class="admin-modal-body">
          <div class="admin-form-grid">
            <div class="admin-form-card">
              <h4>Informations générales</h4>
              <div class="form-group"><label class="admin-label">Nom complet</label><input class="admin-input" name="full_name" value="${escapeHtml(user?.full_name || user?.company_name || '')}" required /></div>
              <div class="form-group"><label class="admin-label">Email</label><input class="admin-input" type="email" name="email" value="${escapeHtml(user?.email || '')}" required /></div>
              <div class="form-group"><label class="admin-label">Ville</label><input class="admin-input" name="city" value="${escapeHtml(user?.city || 'Dakar')}" /></div>
            </div>
            <div class="admin-form-card">
              <h4>Compte & accès</h4>
              <div class="form-group"><label class="admin-label">Rôle</label><select class="admin-select" name="role"><option value="client" ${role === 'client' ? 'selected' : ''}>Client</option><option value="vendor" ${role === 'vendor' ? 'selected' : ''}>Prestataire</option><option value="advertiser" ${role === 'advertiser' ? 'selected' : ''}>Annonceur</option><option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option></select></div>
              <div class="form-group"><label class="admin-label">Plan</label><select class="admin-select" name="plan"><option value="free" ${(user?.plan || 'free') === 'free' ? 'selected' : ''}>Free</option><option value="pro" ${user?.plan === 'pro' ? 'selected' : ''}>Pro</option><option value="business" ${user?.plan === 'business' ? 'selected' : ''}>Business</option><option value="sponsored" ${user?.plan === 'sponsored' ? 'selected' : ''}>Sponsored</option></select></div>
              <div class="form-group"><label class="admin-label">Statut</label><select class="admin-select" name="account_status"><option value="active" ${(user?.account_status || 'active') === 'active' ? 'selected' : ''}>Actif</option><option value="pending" ${user?.account_status === 'pending' ? 'selected' : ''}>En attente</option><option value="suspended" ${user?.account_status === 'suspended' ? 'selected' : ''}>Suspendu</option></select></div>
            </div>
          </div>
        </div>
        <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button class="btn btn-primary" type="submit">${mode === 'edit' ? 'Enregistrer' : 'Créer le compte'}</button></div>
      </form>`;
  }

  function categoryFormTemplate(mode = 'create', category = null) {
    return `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${mode === 'edit' ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</div><div class="admin-modal-sub">Catégories visibles sur le marketplace</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <form data-entity="category" data-mode="${mode}" data-id="${escapeHtml(category?.id || '')}">
        <div class="admin-modal-body">
          <div class="admin-form-grid">
            <div class="form-group"><label class="admin-label">Nom</label><input class="admin-input" name="name" value="${escapeHtml(category?.name || '')}" required /></div>
            <div class="form-group"><label class="admin-label">Slug</label><input class="admin-input" name="slug" value="${escapeHtml(category?.slug || '')}" placeholder="marketing-digital" /></div>
            <div class="form-group"><label class="admin-label">Icône</label><input class="admin-input" name="icon" value="${escapeHtml(category?.icon || '📁')}" /></div>
            <div class="form-group"><label class="admin-label">Ordre d\'affichage</label><input class="admin-input" type="number" name="display_order" value="${escapeHtml(category?.display_order || state.categories.length + 1)}" /></div>
            <div class="form-group"><label class="admin-label">Statut</label><select class="admin-select" name="status"><option value="active" ${(category?.status || 'active') === 'active' ? 'selected' : ''}>Actif</option><option value="inactive" ${category?.status === 'inactive' ? 'selected' : ''}>Inactif</option></select></div>
            <div class="form-group"><label class="admin-label">Description</label><textarea class="admin-textarea" name="description">${escapeHtml(category?.description || '')}</textarea></div>
          </div>
        </div>
        <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button class="btn btn-primary" type="submit">${mode === 'edit' ? 'Mettre à jour' : 'Créer la catégorie'}</button></div>
      </form>`;
  }

  function subcategoryFormTemplate(mode = 'create', item = null, categoryId = '') {
    return `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${mode === 'edit' ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}</div><div class="admin-modal-sub">Structure détaillée du catalogue</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <form data-entity="subcategory" data-mode="${mode}" data-id="${escapeHtml(item?.id || '')}">
        <div class="admin-modal-body">
          <div class="admin-form-grid one-col">
            <div class="form-group"><label class="admin-label">Nom</label><input class="admin-input" name="name" value="${escapeHtml(item?.name || '')}" required /></div>
            <div class="form-group"><label class="admin-label">Catégorie parente</label><select class="admin-select" name="category_id">${state.categories.map((c) => `<option value="${c.id}" ${String(item?.category_id || categoryId || '') === String(c.id) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></div>
            <div class="form-group"><label class="admin-label">Slug</label><input class="admin-input" name="slug" value="${escapeHtml(item?.slug || '')}" /></div>
            <div class="form-group"><label class="admin-label">Statut</label><select class="admin-select" name="status"><option value="active" ${(item?.status || 'active') === 'active' ? 'selected' : ''}>Actif</option><option value="inactive" ${item?.status === 'inactive' ? 'selected' : ''}>Inactif</option></select></div>
          </div>
        </div>
        <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>`;
  }

  function campaignFormTemplate(mode = 'create', item = null) {
    return `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${mode === 'edit' ? 'Modifier la campagne' : 'Nouvelle campagne'}</div><div class="admin-modal-sub">Campagnes sponsorisées et placements premium</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <form data-entity="campaign" data-mode="${mode}" data-id="${escapeHtml(item?.id || '')}">
        <div class="admin-modal-body">
          <div class="admin-form-grid">
            <div class="form-group"><label class="admin-label">Annonceur</label><input class="admin-input" name="advertiser_name" value="${escapeHtml(item?.advertiser_name || '')}" required /></div>
            <div class="form-group"><label class="admin-label">Budget (FCFA)</label><input class="admin-input" type="number" name="budget" value="${escapeHtml(item?.budget || 0)}" required /></div>
            <div class="form-group"><label class="admin-label">Format</label><input class="admin-input" name="format" value="${escapeHtml(item?.format || 'banner homepage')}" /></div>
            <div class="form-group"><label class="admin-label">Emplacement</label><input class="admin-input" name="location" value="${escapeHtml(item?.location || 'Homepage hero')}" /></div>
            <div class="form-group"><label class="admin-label">Date de début</label><input class="admin-input" type="date" name="start_date" value="${escapeHtml(item?.start_date || new Date().toISOString().slice(0, 10))}" /></div>
            <div class="form-group"><label class="admin-label">Date de fin</label><input class="admin-input" type="date" name="end_date" value="${escapeHtml(item?.end_date || new Date(Date.now() + 2592000000).toISOString().slice(0, 10))}" /></div>
            <div class="form-group"><label class="admin-label">Statut</label><select class="admin-select" name="status"><option value="active" ${(item?.status || 'active') === 'active' ? 'selected' : ''}>Actif</option><option value="pending" ${item?.status === 'pending' ? 'selected' : ''}>En attente</option><option value="completed" ${item?.status === 'completed' ? 'selected' : ''}>Terminée</option></select></div>
          </div>
        </div>
        <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button class="btn btn-primary" type="submit">${mode === 'edit' ? 'Mettre à jour' : 'Créer la campagne'}</button></div>
      </form>`;
  }

  function listingFormTemplate(mode = 'create', item = null) {
    return `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${mode === 'edit' ? 'Modifier l\'annonce' : 'Créer une annonce'}</div><div class="admin-modal-sub">Demande ou service visible dans le catalogue</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <form data-entity="listing" data-mode="${mode}" data-id="${escapeHtml(item?.id || '')}">
        <div class="admin-modal-body">
          <div class="admin-form-grid">
            <div class="form-group"><label class="admin-label">Titre</label><input class="admin-input" name="title" value="${escapeHtml(item?.title || '')}" required /></div>
            <div class="form-group"><label class="admin-label">Propriétaire</label><input class="admin-input" name="owner" value="${escapeHtml(item?.owner || '')}" required /></div>
            <div class="form-group"><label class="admin-label">Catégorie</label><input class="admin-input" name="category" value="${escapeHtml(item?.category || '')}" /></div>
            <div class="form-group"><label class="admin-label">Ville</label><input class="admin-input" name="city" value="${escapeHtml(item?.city || 'Dakar')}" /></div>
            <div class="form-group"><label class="admin-label">Budget</label><input class="admin-input" name="budget" value="${escapeHtml(item?.budget || '')}" /></div>
            <div class="form-group"><label class="admin-label">Statut</label><select class="admin-select" name="status"><option value="active" ${(item?.status || 'active') === 'active' ? 'selected' : ''}>Actif</option><option value="pending" ${item?.status === 'pending' ? 'selected' : ''}>En attente</option><option value="inactive" ${item?.status === 'inactive' ? 'selected' : ''}>Inactif</option></select></div>
            <div class="form-group" style="grid-column:1/-1;"><label class="admin-label">Description</label><textarea class="admin-textarea" name="description">${escapeHtml(item?.description || '')}</textarea></div>
          </div>
        </div>
        <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>`;
  }

  function subscriptionFormTemplate(item = null) {
    return `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${item ? 'Modifier le plan' : 'Créer un plan'}</div><div class="admin-modal-sub">Offre d\'abonnement visible dans le dashboard</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <form data-entity="subscription" data-mode="${item ? 'edit' : 'create'}" data-id="${escapeHtml(item?.id || '')}">
        <div class="admin-modal-body"><div class="admin-form-grid"><div class="form-group"><label class="admin-label">Plan</label><input class="admin-input" name="plan" value="${escapeHtml(item?.plan || '')}" required /></div><div class="form-group"><label class="admin-label">Montant</label><input class="admin-input" type="number" name="amount" value="${escapeHtml(item?.amount || 0)}" required /></div><div class="form-group"><label class="admin-label">Nombre d'abonnés</label><input class="admin-input" type="number" name="count" value="${escapeHtml(item?.count || 0)}" required /></div><div class="form-group"><label class="admin-label">Croissance</label><input class="admin-input" name="growth" value="${escapeHtml(item?.growth || '+0%')}" /></div></div></div>
        <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>`;
  }

  function objectToDetails(obj) {
    return Object.entries(obj || {}).map(([k, v]) => `<div class="detail-card"><h5>${escapeHtml(k.replace(/_/g, ' '))}</h5><div>${escapeHtml(Array.isArray(v) ? v.join(', ') : v)}</div></div>`).join('');
  }

  function viewModal(title, subtitle, contentHtml, footerHtml = '') {
    openModal('detail-modal', `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${escapeHtml(title)}</div><div class="admin-modal-sub">${escapeHtml(subtitle || '')}</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <div class="admin-modal-body">${contentHtml}</div>
      <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Fermer</button>${footerHtml}</div>`);
  }

  function confirmModal(title, message, onConfirm) {
    state.pendingDelete = onConfirm;
    openModal('confirm-modal', `
      <div class="admin-modal-header"><div><div class="admin-modal-title">${escapeHtml(title)}</div><div class="admin-modal-sub">Confirmation requise</div></div><button type="button" class="admin-modal-close" data-modal-close>✕</button></div>
      <div class="admin-modal-body"><p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(message)}</p></div>
      <div class="admin-modal-footer"><button type="button" class="btn btn-secondary" data-modal-close>Annuler</button><button type="button" class="btn btn-primary" id="confirm-action-btn">Confirmer</button></div>`);
    qs('#confirm-action-btn')?.addEventListener('click', () => { if (typeof state.pendingDelete === 'function') state.pendingDelete(); closeModal('confirm-modal'); });
  }

  function formToObject(form) { return Object.fromEntries(new FormData(form).entries()); }

  async function handleModalSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const entity = form.dataset.entity;
    const mode = form.dataset.mode;
    const id = form.dataset.id;
    const data = formToObject(form);

    if (entity === 'user') {
      if (mode === 'create') {
        const user = { id: uid(data.role), full_name: data.full_name, company_name: data.role === 'client' ? '' : data.full_name, email: data.email, role: data.role, city: data.city, plan: data.plan, account_status: data.account_status, created_at: new Date().toISOString() };
        state.users.unshift(user);
        if (data.role === 'vendor') state.vendors.unshift({ user_id: user.id, category_id: state.categories[0]?.id || 1, category_name: state.categories[0]?.name || 'Services', website: '', price_range: 'Sur devis', services: [], verified: false, leads: 0, rating: 0, badge: 'Nouveau', profiles: { ...user, company_name: data.full_name, country: 'Sénégal' } });
        if (data.role === 'advertiser') state.advertisers.unshift({ user_id: user.id, sector: 'Publicité', budget_range: '0', ad_format: 'banner', impressions: 0, clicks: 0, leads: 0, ctr: '0%', profiles: { ...user, company_name: data.full_name, country: 'Sénégal' } });
        showToast('Compte créé avec succès.', 'success');
      } else {
        const user = findUser(id); if (user) Object.assign(user, data, { company_name: data.role === 'client' ? '' : data.full_name });
        const vendor = findVendor(id); if (vendor?.profiles) Object.assign(vendor.profiles, { full_name: data.full_name, company_name: data.full_name, email: data.email, city: data.city, plan: data.plan, account_status: data.account_status });
        const adv = findAdvertiser(id); if (adv?.profiles) Object.assign(adv.profiles, { full_name: data.full_name, company_name: data.full_name, email: data.email, city: data.city, plan: data.plan, account_status: data.account_status });
        showToast('Compte mis à jour.', 'success');
      }
    }

    if (entity === 'category') {
      const payload = { id: mode === 'create' ? (Math.max(0, ...state.categories.map((c) => Number(c.id) || 0)) + 1) : Number(id), name: data.name, slug: data.slug || slugify(data.name), icon: data.icon || '📁', status: data.status, display_order: Number(data.display_order || state.categories.length + 1), description: data.description || '' };
      if (mode === 'create') state.categories.push(payload); else Object.assign(state.categories.find((c) => String(c.id) === String(id)) || {}, payload);
      showToast(mode === 'create' ? 'Catégorie créée.' : 'Catégorie modifiée.', 'success');
    }

    if (entity === 'subcategory') {
      const payload = { id: mode === 'create' ? (Math.max(0, ...state.subcategories.map((s) => Number(s.id) || 0)) + 1) : Number(id), name: data.name, slug: data.slug || slugify(data.name), category_id: Number(data.category_id), status: data.status, categories: { name: state.categories.find((c) => String(c.id) === String(data.category_id))?.name || '—' } };
      if (mode === 'create') state.subcategories.push(payload); else Object.assign(state.subcategories.find((s) => String(s.id) === String(id)) || {}, payload);
      showToast('Sous-catégorie enregistrée.', 'success');
    }

    if (entity === 'campaign') {
      const base = { advertiser_name: data.advertiser_name, budget: Number(data.budget || 0), impressions: 0, clicks: 0, leads: 0, ctr: '0%', format: data.format, location: data.location, start_date: data.start_date, end_date: data.end_date, status: data.status };
      if (mode === 'create') state.campaigns.unshift({ id: uid('campaign'), ...base }); else Object.assign(state.campaigns.find((c) => c.id === id) || {}, base);
      showToast('Campagne enregistrée.', 'success');
    }

    if (entity === 'listing') {
      const base = { title: data.title, owner: data.owner, category: data.category, city: data.city, budget: data.budget, status: data.status, description: data.description, responses: mode === 'create' ? 0 : undefined, created_at: mode === 'create' ? new Date().toISOString().slice(0, 10) : undefined };
      if (mode === 'create') state.listings.unshift({ id: uid('listing'), ...base }); else Object.assign(state.listings.find((l) => l.id === id) || {}, base);
      showToast('Annonce enregistrée.', 'success');
    }

    if (entity === 'subscription') {
      const base = { plan: data.plan, amount: Number(data.amount || 0), count: Number(data.count || 0), growth: data.growth || '+0%' };
      if (mode === 'create') state.subscriptions.unshift({ id: uid('sub'), ...base }); else Object.assign(state.subscriptions.find((s) => s.id === id) || {}, base);
      showToast('Plan enregistré.', 'success');
    }

    saveLocalDb();
    closeModal();
    renderAllTables();
  }

  function exportDataset(type) {
    let rows = [['Info'], ['Aucune donnée']];
    if (type === 'users') rows = [['Nom', 'Email', 'Rôle', 'Ville', 'Plan', 'Statut'], ...state.users.map((u) => [u.company_name || u.full_name || '', u.email || '', u.role || '', u.city || '', u.plan || '', u.account_status || ''])];
    if (type === 'vendors') rows = [['Nom', 'Email', 'Catégorie', 'Ville', 'Plan', 'Statut'], ...state.vendors.map((v) => [v.profiles?.company_name || '', v.profiles?.email || '', v.category_name || '', v.profiles?.city || '', v.profiles?.plan || '', v.profiles?.account_status || ''])];
    if (type === 'plans') rows = [['Plan', 'Montant', 'Abonnés', 'Leads'], ...state.subscriptions.map((s) => [s.plan, s.amount, s.count, s.leads || 0])];
    if (type === 'subscribers') rows = [['Prestataire', 'Email', 'Ville', 'Plan'], ...(state.vendors || []).map((v) => [v.profiles?.company_name || '', v.profiles?.email || '', v.profiles?.city || '', v.profiles?.plan || ''])];
    if (type === 'revenus' || type === 'rapport') rows = [['Source', 'Montant'], ['Abonnements', state.subscriptions.reduce((sum, s) => sum + Number(s.amount || 0) * Number(s.count || 0), 0)], ['Campagnes', state.campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0)]];
    if (type === 'campaigns') rows = [['Annonceur', 'Budget', 'Format', 'Statut'], ...state.campaigns.map((c) => [c.advertiser_name, c.budget, c.format, c.status])];
    if (type === 'reviews') rows = [['Prestataire', 'Client', 'Note', 'Statut'], ...state.reviews.map((r) => [r.vendor_name, r.client, r.rating, r.status])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `raktakk-${type}.csv`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1200);
    showToast(`Export ${type} téléchargé.`, 'success');
  }

  function bindPageActions() {
    qsa('[data-export]').forEach((btn) => btn.onclick = (e) => { e.preventDefault(); exportDataset(btn.dataset.export); });
    const bind = (selector, fn) => { const el = qs(selector); if (el) el.onclick = fn; };
    bind('#users .admin-page-actions .btn-primary', () => openModal('entity-modal', userFormTemplate('create', null, 'client')));
    bind('#vendors .admin-page-actions .btn-primary', () => openModal('entity-modal', userFormTemplate('create', null, 'vendor')));
    bind('#advertisers .admin-page-actions .btn-primary', () => openModal('entity-modal', userFormTemplate('create', null, 'advertiser')));
    bind('#categories .admin-page-actions .btn-primary', () => openModal('entity-modal', categoryFormTemplate('create')));
    bind('#campaigns .admin-page-actions .btn-primary', () => openModal('entity-modal', campaignFormTemplate('create')));
    qsa('[data-admin-open="listing"]').forEach((btn) => btn.onclick = () => openModal('entity-modal', listingFormTemplate('create')));
    qsa('[data-admin-open="subscription"]').forEach((btn) => btn.onclick = () => openModal('entity-modal', subscriptionFormTemplate()));
    qsa('[data-admin-open="add-plan"]').forEach((btn) => btn.onclick = () => { const overlay = qs('#add-plan'); if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; } });
    bind('#dashboard .admin-page-actions .btn-primary', () => { renderAllTables(); showToast('Dashboard actualisé.', 'success'); });
    bind('#dashboard .admin-page-actions .btn-secondary', () => exportDataset('rapport'));
    qsa('#site-content .admin-page-actions .btn-primary').forEach((btn) => btn.onclick = saveSiteContent);
    qsa('#settings .btn.btn-primary').forEach((btn) => { if (btn.id !== 'save-admin-credentials-btn') btn.onclick = saveSettings; });
    qsa('#notifications input[type="checkbox"], #features input[type="checkbox"]').forEach((cb) => cb.onchange = saveSettings);
    qsa('[data-admin-modal-close]').forEach((btn) => btn.onclick = () => {
      const overlay = btn.closest('.admin-modal-overlay');
      if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
    });
    qs('#plan-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      state.subscriptions.unshift({ id: uid('sub'), plan: data.plan_name || data.plan_code || 'custom', amount: Number(data.price || 0), count: 0, leads: Number(data.leads || 0), growth: '+0%' });
      saveLocalDb();
      renderAllTables();
      const overlay = qs('#add-plan');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
      showToast('Plan enregistré.', 'success');
    });
  }

  function saveSettings() {
    const platformInputs = qsa('#general .admin-input');
    const seoInputs = qsa('#seo .admin-input');
    const features = qsa('#features input[type="checkbox"]');
    const notifications = qsa('#notifications input[type="checkbox"]');
    const upsert = (key, value_json) => {
      const item = state.settings.find((x) => x.key === key);
      if (item) item.value_json = value_json; else state.settings.push({ key, value_json });
    };
    upsert('platform', { site_name: platformInputs[0]?.value || 'Raktakk', slogan: platformInputs[1]?.value || '', language: platformInputs[2]?.value || 'Français', currency: platformInputs[3]?.value || 'FCFA', timezone: platformInputs[4]?.value || 'Africa/Dakar (GMT+0)' });
    upsert('seo', { meta_title: seoInputs[0]?.value || '', meta_description: seoInputs[1]?.value || '' });
    upsert('notifications', { welcome_email: notifications[0]?.checked, leads: notifications[1]?.checked, weekly_report: notifications[2]?.checked, moderation: notifications[3]?.checked });
    upsert('features', { messaging: features[0]?.checked, favorites: features[1]?.checked, sponsored: features[2]?.checked, vendor_signup: features[3]?.checked, reviews: features[4]?.checked, blog: features[5]?.checked });
    saveLocalDb();
    showToast('Paramètres enregistrés.', 'success', 1800);
  }

  function saveSiteContent() {
    const inputs = qsa('#site-content .admin-form-section:nth-of-type(1) .admin-input');
    const payload = { title: inputs[0]?.value || '', subtitle: inputs[1]?.value || '', badge: inputs[2]?.value || '' };
    const item = state.settings.find((x) => x.key === 'home_hero');
    if (item) item.value_json = payload; else state.settings.push({ key: 'home_hero', value_json: payload });
    saveLocalDb();
    showToast('Contenu du site sauvegardé.', 'success');
  }

  function saveAdminCredentials() {
    const username = qs('#admin-username-input')?.value?.trim() || 'admin';
    const email = qs('#admin-email-input')?.value?.trim() || 'admin@raktakk.com';
    const password = qs('#admin-password-input')?.value?.trim() || '';
    const session = { role: 'admin', email, username, mode: 'local', loggedAt: new Date().toISOString() };
    localStorage.setItem('raktakk_admin_session', JSON.stringify(session));
    const adminUser = findUser('local-admin');
    if (adminUser) { adminUser.email = email; adminUser.username = username; }
    if (window.RAKTAKK_CONFIG?.emergencyAdmin) {
      window.RAKTAKK_CONFIG.emergencyAdmin.email = email;
      window.RAKTAKK_CONFIG.emergencyAdmin.username = username;
      if (password) window.RAKTAKK_CONFIG.emergencyAdmin.password = password;
    }
    saveLocalDb();
    showToast('Accès admin mis à jour.', 'success');
  }

  async function toggleUserStatus(id, status) {
    const user = findUser(id);
    if (!user) return;
    user.account_status = status;
    const vendor = findVendor(id); if (vendor?.profiles) vendor.profiles.account_status = status;
    const adv = findAdvertiser(id); if (adv?.profiles) adv.profiles.account_status = status;
    saveLocalDb();
    renderAllTables();
    showToast('Statut utilisateur mis à jour.', 'success');
  }

  function editUser(id) { const user = findUser(id); if (user) openModal('entity-modal', userFormTemplate('edit', user, user.role)); }
  function editVendor(id) { const user = findUser(id); if (user) openModal('entity-modal', userFormTemplate('edit', user, 'vendor')); }
  function editAdvertiser(id) { const user = findUser(id); if (user) openModal('entity-modal', userFormTemplate('edit', user, 'advertiser')); }
  function editCategory(id) { const item = state.categories.find((c) => String(c.id) === String(id)); if (item) openModal('entity-modal', categoryFormTemplate('edit', item)); }
  function editSubcategory(id) { const item = state.subcategories.find((s) => String(s.id) === String(id)); if (item) openModal('entity-modal', subcategoryFormTemplate('edit', item)); }
  function editCampaign(id) { const item = state.campaigns.find((c) => String(c.id) === String(id)); if (item) openModal('entity-modal', campaignFormTemplate('edit', item)); }
  function editListing(id) { const item = state.listings.find((l) => String(l.id) === String(id)); if (item) openModal('entity-modal', listingFormTemplate('edit', item)); }
  function editSubscription(id) { const item = state.subscriptions.find((s) => String(s.id) === String(id)); if (item) openModal('entity-modal', subscriptionFormTemplate(item)); }
  function editPlan(id) { editSubscription(id); }
  function deletePlan(id) { confirmModal('Supprimer le plan', 'Ce plan sera retiré de la liste des abonnements.', () => { state.subscriptions = state.subscriptions.filter((s) => String(s.id) !== String(id)); saveLocalDb(); renderAllTables(); showToast('Plan supprimé.', 'success'); }); }
  function viewSubscriber(id) {
    const vendor = findVendor(id); if (!vendor) return;
    const p = vendor.profiles || {};
    viewModal('Abonné', p.company_name || p.full_name || 'Abonné', `<div class="detail-grid">${objectToDetails({ entreprise: p.company_name || p.full_name, email: p.email || '', ville: p.city || '', plan: p.plan || '', statut: p.account_status || '', date: p.created_at || '—' })}</div>`);
  }
  function toggleSubscriberStatus(id) { const vendor = findVendor(id); if (!vendor?.profiles) return; vendor.profiles.account_status = vendor.profiles.account_status === 'suspended' ? 'active' : 'suspended'; saveLocalDb(); renderAllTables(); showToast('Statut abonné mis à jour.', 'success'); }

  function deleteCategory(id) { confirmModal('Supprimer la catégorie', 'Cette action supprimera aussi sa structure locale associée.', () => { state.categories = state.categories.filter((c) => String(c.id) !== String(id)); state.subcategories = state.subcategories.filter((s) => String(s.category_id) !== String(id)); saveLocalDb(); renderAllTables(); showToast('Catégorie supprimée.', 'success'); }); }
  function deleteSubcategory(id) { confirmModal('Supprimer la sous-catégorie', 'Voulez-vous vraiment supprimer cette sous-catégorie ?', () => { state.subcategories = state.subcategories.filter((s) => String(s.id) !== String(id)); saveLocalDb(); renderAllTables(); showToast('Sous-catégorie supprimée.', 'success'); }); }
  function deleteListing(id) { confirmModal('Supprimer l\'annonce', 'Cette annonce sera retirée du dashboard.', () => { state.listings = state.listings.filter((l) => String(l.id) !== String(id)); saveLocalDb(); renderAllTables(); showToast('Annonce supprimée.', 'success'); }); }

  function viewUser(id) {
    const user = findUser(id); if (!user) return;
    const vendor = findVendor(id); const adv = findAdvertiser(id);
    const detail = {
      nom: user.company_name || user.full_name || 'Sans nom',
      email: user.email || '', rôle: user.role || '', ville: user.city || '—', plan: user.plan || 'free', statut: user.account_status || 'active', inscrit_le: fmtDate(user.created_at),
      site_web: vendor?.website || '—', catégorie: vendor?.category_name || adv?.sector || '—', budget: adv?.budget_range || '—'
    };
    viewModal('Fiche utilisateur', `${user.role} · ${user.email}`, `<div class="detail-grid">${objectToDetails(detail)}</div>`, `<button type="button" class="btn btn-primary" onclick="window.raktakkAdmin.editUser('${id}');closeModal('detail-modal')">Modifier</button>`);
  }
  function viewVendor(id) {
    const v = findVendor(id); if (!v) return;
    const p = v.profiles || {};
    viewModal('Fiche prestataire', `${p.company_name || p.full_name} · ${p.email || ''}`, `<div class="detail-grid">${objectToDetails({ entreprise: p.company_name || p.full_name, email: p.email || '', ville: p.city || '', plan: p.plan || '', statut: p.account_status || '', catégorie: v.category_name || '', tarifs: v.price_range || '', services: (v.services || []).join(', '), site_web: v.website || '—', leads: v.leads || 0, note: v.rating || 0 })}</div>`, `<button type="button" class="btn btn-primary" onclick="window.raktakkAdmin.editVendor('${id}');closeModal('detail-modal')">Modifier</button>`);
  }
  function viewCategory(id) {
    const c = state.categories.find((x) => String(x.id) === String(id)); if (!c) return;
    const related = state.subcategories.filter((s) => String(s.category_id) === String(id)).map((s) => s.name).join(', ') || 'Aucune';
    viewModal('Catégorie', `${c.name} · /${c.slug}`, `<div class="detail-grid">${objectToDetails({ nom: c.name, slug: c.slug, icône: c.icon, statut: c.status, ordre: c.display_order, description: c.description || '—', sous_categories: related })}</div>`, `<button type="button" class="btn btn-secondary" onclick="window.raktakkAdmin.openSubcategoryModal('${id}')">+ Sous-catégorie</button><button type="button" class="btn btn-primary" onclick="window.raktakkAdmin.editCategory('${id}');closeModal('detail-modal')">Modifier</button>`);
  }
  function viewSubcategory(id) { const s = state.subcategories.find((x) => String(x.id) === String(id)); if (s) viewModal('Sous-catégorie', s.name, `<div class="detail-grid">${objectToDetails({ nom: s.name, slug: s.slug, catégorie: s.categories?.name || '', statut: s.status })}</div>`); }
  function viewCampaign(id) {
    const c = state.campaigns.find((x) => String(x.id) === String(id)) || (() => { const a = findAdvertiser(id); return a ? { advertiser_name: a.profiles?.company_name || a.profiles?.full_name, budget: a.budget_range, impressions: a.impressions, clicks: a.clicks, leads: a.leads, ctr: a.ctr, status: a.profiles?.account_status, format: a.ad_format, location: a.sector } : null; })();
    if (!c) return;
    viewModal('Campagne publicitaire', c.advertiser_name, `<div class="detail-grid">${objectToDetails({ annonceur: c.advertiser_name, budget: fmtMoney(c.budget), format: c.format, emplacement: c.location, impressions: fmtCompact(c.impressions), clics: fmtCompact(c.clicks), ctr: c.ctr, leads: c.leads, statut: c.status, début: c.start_date || '—', fin: c.end_date || '—' })}</div>`, c.id ? `<button type="button" class="btn btn-primary" onclick="window.raktakkAdmin.editCampaign('${c.id}');closeModal('detail-modal')">Modifier</button>` : '');
  }
  function viewListing(id) { const l = state.listings.find((x) => String(x.id) === String(id)); if (l) viewModal('Annonce', l.title, `<div class="detail-grid">${objectToDetails({ titre: l.title, propriétaire: l.owner, catégorie: l.category, ville: l.city, budget: l.budget, statut: l.status, réponses: l.responses, description: l.description })}</div>`, `<button type="button" class="btn btn-primary" onclick="window.raktakkAdmin.editListing('${id}');closeModal('detail-modal')">Modifier</button>`); }
  function viewReview(id) { const r = state.reviews.find((x) => String(x.id) === String(id)); if (r) viewModal('Avis', r.vendor_name, `<div class="detail-grid">${objectToDetails({ client: r.client, note: `${r.rating}/5`, statut: r.status, date: r.date, commentaire: r.comment })}</div>`); }
  function approveReview(id) { const r = state.reviews.find((x) => String(x.id) === String(id)); if (r) { r.status = 'active'; saveLocalDb(); renderAllTables(); showToast('Avis approuvé.', 'success'); } }
  function rejectReview(id) { const r = state.reviews.find((x) => String(x.id) === String(id)); if (r) { r.status = 'inactive'; saveLocalDb(); renderAllTables(); showToast('Avis rejeté.', 'success'); } }
  function openSubcategoryModal(categoryId) { openModal('entity-modal', subcategoryFormTemplate('create', null, categoryId)); }

  async function init() {
    try {
      if (isLocalAdminMode()) {
        const localAdmin = getLocalAdminSession() || { email: 'admin@raktakk.com', username: 'admin' };
        state.auth = { profile: { id: 'local-admin', email: localAdmin.email, username: localAdmin.username, role: 'admin', full_name: 'Administrateur Raktakk', company_name: 'Raktakk' } };
      } else if (window.RAKTAKK_API) {
        state.auth = await window.RAKTAKK_API.requireAuth(['admin']);
      } else {
        throw new Error('Accès admin indisponible.');
      }
      ensureChromeBindings();
      ensureModals();
      await fetchAll();
      renderAllTables();
      wireFilters();
      bindPageActions();
      if (isLocalAdminMode()) showToast('Dashboard admin premium activé en mode local.', 'success', 3200);
    } catch (err) {
      showToast(err.message || 'Accès admin refusé.', 'error');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    }
  }

  window.closeModal = closeModal;
  window.openAdminModal = function (id) {
    if (id === 'add-user-modal') openModal('entity-modal', userFormTemplate('create'));
    if (id === 'add-plan') { const overlay = qs('#add-plan'); if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; } }
  };
  window.closeAdminModal = closeModal;
  window.switchAdminPage = switchAdminPage;
  window.raktakkAdmin = { toggleUserStatus, editUser, editVendor, editAdvertiser, editCategory, editSubcategory, editCampaign, editListing, editSubscription, editPlan, deletePlan, viewSubscriber, toggleSubscriberStatus, deleteCategory, deleteSubcategory, deleteListing, viewUser, viewVendor, viewCategory, viewSubcategory, viewCampaign, viewListing, viewReview, approveReview, rejectReview, openSubcategoryModal };
  document.addEventListener('DOMContentLoaded', init);
})();
