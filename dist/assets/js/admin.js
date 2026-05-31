// ============================================================
// RAKTAKK — Admin JS v1.0
// Super back-office controller
// ============================================================

'use strict';

// ── ADMIN SIDEBAR NAVIGATION ──────────────────────────────────
const adminLinks = document.querySelectorAll('.admin-link[data-admin-page]');
const adminPages = document.querySelectorAll('.admin-page');
const breadcrumbCurrent = document.querySelector('.breadcrumb-current');

function switchAdminPage(pageId) {
  adminPages.forEach(p => p.classList.toggle('active', p.id === pageId));
  adminLinks.forEach(l => l.classList.toggle('active', l.dataset.adminPage === pageId));
  const activeLink = document.querySelector(`.admin-link[data-admin-page="${pageId}"]`);
  if (breadcrumbCurrent && activeLink) {
    breadcrumbCurrent.textContent = activeLink.querySelector('span')?.textContent || '';
  }
  window.history.replaceState(null, '', `#${pageId}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.admin-sidebar')?.classList.remove('open');
}

adminLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchAdminPage(link.dataset.adminPage);
  });
});

// Mobile toggle
const adminMenuBtn = document.querySelector('.admin-menu-btn');
if (adminMenuBtn) {
  adminMenuBtn.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('open');
  });
}

// Init from hash
const initHash = window.location.hash.slice(1);
if (initHash && document.getElementById(initHash)) switchAdminPage(initHash);
else if (adminPages[0]) switchAdminPage(adminPages[0].id);

// ── SETTINGS TAB ────────────────────────────────────────────
const settingsLinks = document.querySelectorAll('.settings-nav-link[data-settings]');
const settingsPanels = document.querySelectorAll('.settings-panel');

settingsLinks.forEach(link => {
  link.addEventListener('click', () => {
    settingsLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const target = link.dataset.settings;
    settingsPanels.forEach(p => p.classList.toggle('active', p.id === target));
  });
});
if (settingsLinks[0]) settingsLinks[0].classList.add('active');
if (settingsPanels[0]) settingsPanels[0].classList.add('active');

// ── RENDER ADMIN USERS TABLE ──────────────────────────────────
function renderAdminUsersTable() {
  const container = document.getElementById('admin-users-tbody');
  if (!container || typeof RAKTAKK === 'undefined') return;

  const users = [
    ...RAKTAKK.vendors.slice(0, 8).map(v => ({
      name: v.name, email: v.email, type: 'Vendeur', city: v.city,
      plan: v.plan, status: 'active', joined: v.joined, emoji: v.emoji
    })),
    { name: 'Moussa Diallo', email: 'moussa@email.com', type: 'Client', city: 'Dakar', plan: 'free', status: 'active', joined: '2024-01-10', emoji: '👤' },
    { name: 'Aminata Sow', email: 'aminata@email.com', type: 'Client', city: 'Thiès', plan: 'free', status: 'active', joined: '2024-01-08', emoji: '👩' },
    { name: 'Orange Sénégal', email: 'marketing@orange.sn', type: 'Annonceur', city: 'Dakar', plan: 'sponsored', status: 'active', joined: '2024-01-01', emoji: '🟠' },
    { name: 'Wave Mobile', email: 'ads@wave.com', type: 'Annonceur', city: 'Dakar', plan: 'sponsored', status: 'active', joined: '2024-01-15', emoji: '💙' },
  ];

  const planColors = { free:'var(--text-muted)', pro:'var(--brand-blue)', business:'var(--brand-primary)', sponsored:'var(--brand-accent)' };
  const typeColors = { 'Vendeur':'var(--brand-primary)', 'Client':'var(--brand-teal)', 'Annonceur':'var(--brand-blue)' };

  container.innerHTML = users.map((u, i) => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${u.emoji}</div>
          <div>
            <div class="user-name">${u.name}</div>
            <div class="user-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span style="color:${typeColors[u.type]};font-weight:600;font-size:.82rem;">${u.type}</span>
      </td>
      <td>${u.city}</td>
      <td>
        <span style="color:${planColors[u.plan]};font-weight:700;font-size:.8rem;text-transform:uppercase;">${u.plan}</span>
      </td>
      <td><span class="status status-active">Actif</span></td>
      <td style="font-size:.8rem;color:var(--text-muted);">${new Date(u.joined).toLocaleDateString('fr-FR')}</td>
      <td>
        <div class="actions">
          <button class="action-btn action-view" title="Voir" onclick="showToast('Profil ouvert','info')">👁️</button>
          <button class="action-btn action-edit" title="Modifier" onclick="openAdminModal('edit-user-modal')">✏️</button>
          <button class="action-btn action-delete" title="Suspendre" onclick="showToast('Compte suspendu','warning')">⛔</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── RENDER VENDORS TABLE ────────────────────────────────────
function renderVendorsTable() {
  const container = document.getElementById('admin-vendors-tbody');
  if (!container || typeof RAKTAKK === 'undefined') return;

  container.innerHTML = RAKTAKK.vendors.map(v => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${v.emoji}</div>
          <div>
            <div class="user-name">${v.name}</div>
            <div class="user-email">${v.category}</div>
          </div>
        </div>
      </td>
      <td>${v.city}, ${v.country}</td>
      <td>
        <div style="display:flex;align-items:center;gap:4px;">
          <span style="color:#FFB547;">★</span>
          <strong>${v.rating}</strong>
          <span style="color:var(--text-muted);font-size:.78rem;">(${v.reviews})</span>
        </div>
      </td>
      <td>
        <span class="badge badge-${v.badge.toLowerCase().replace('é','e').replace('é','e')}">${v.badge}</span>
      </td>
      <td style="font-size:.82rem;font-weight:600;text-transform:uppercase;color:var(--brand-primary);">${v.plan}</td>
      <td>${v.leads.toLocaleString('fr-FR')} leads</td>
      <td><span class="status ${v.verified ? 'status-active' : 'status-pending'}">${v.verified ? 'Vérifié' : 'En attente'}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn action-approve" title="Approuver" onclick="showToast('Profil approuvé ✓','success')">✓</button>
          <button class="action-btn action-view" title="Voir" onclick="showToast('Profil ouvert','info')">👁️</button>
          <button class="action-btn action-delete" title="Supprimer" onclick="confirmDelete(this)">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── RENDER CAMPAIGNS TABLE ─────────────────────────────────
function renderCampaignsTable() {
  const container = document.getElementById('admin-campaigns-tbody');
  if (!container || typeof RAKTAKK === 'undefined') return;

  container.innerHTML = RAKTAKK.advertisers.map(a => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${a.logo}</div>
          <div>
            <div class="user-name">${a.name}</div>
            <div class="user-email">${a.category}</div>
          </div>
        </div>
      </td>
      <td>${a.budget.toLocaleString('fr-FR')} FCFA</td>
      <td>${a.impressions.toLocaleString('fr-FR')}</td>
      <td>${a.clicks.toLocaleString('fr-FR')}</td>
      <td><strong style="color:var(--brand-teal);">${a.ctr}</strong></td>
      <td>${a.leads}</td>
      <td>
        <span class="status ${
          a.status === 'active' ? 'status-active' :
          a.status === 'paused' ? 'status-pending' :
          'status-inactive'}">${
          a.status === 'active' ? 'Active' :
          a.status === 'paused' ? 'En pause' : 'Terminée'}</span>
      </td>
      <td>
        <div class="actions">
          <button class="action-btn action-view" onclick="showToast('Campagne ouverte','info')">👁️</button>
          <button class="action-btn action-edit" onclick="showToast('Modification','info')">✏️</button>
          <button class="action-btn action-delete" onclick="showToast('Campagne suspendue','warning')">⛔</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── RENDER REVENUE CHART ────────────────────────────────────
function renderAdminChart() {
  const container = document.getElementById('admin-revenue-chart');
  if (!container || typeof RAKTAKK === 'undefined') return;

  const data = RAKTAKK.revenue.monthly;
  const max = Math.max(...data.map(d => d.amount));

  container.innerHTML = `
    <div class="admin-chart">
      ${data.map(d => `
        <div class="admin-chart-bar primary" style="height:${Math.max((d.amount/max)*100, 4)}%">
          <div class="admin-chart-bar-tip">${(d.amount/1000000).toFixed(1)}M FCFA</div>
        </div>`).join('')}
    </div>
    <div class="admin-chart-labels">
      ${data.map(d => `<div class="admin-chart-label">${d.month.split(' ')[0].slice(0,3)}</div>`).join('')}
    </div>`;

  // Revenue donut simulation with CSS
  const revenueSourcesContainer = document.getElementById('revenue-sources');
  if (revenueSourcesContainer) {
    const sources = [
      { name: 'Publicités', pct: 58, amount: RAKTAKK.revenue.totalAds, color: '#FF5A1F' },
      { name: 'Abonnements', pct: 30, amount: RAKTAKK.revenue.totalSubscriptions, color: '#2563EB' },
      { name: 'Leads Premium', pct: 12, amount: RAKTAKK.revenue.totalLeads, color: '#00C9A7' },
    ];
    revenueSourcesContainer.innerHTML = sources.map(s => `
      <div class="revenue-source-item">
        <div class="revenue-source-dot" style="background:${s.color};"></div>
        <div class="revenue-source-name">${s.name}</div>
        <div class="revenue-source-pct">${s.pct}%</div>
        <div class="revenue-source-amount" style="color:${s.color};">${(s.amount/1000000).toFixed(1)}M</div>
      </div>
      <div class="progress-bar" style="margin:-4px 0 4px;">
        <div class="progress-fill" style="width:${s.pct}%;background:${s.color};"></div>
      </div>`).join('');
  }
}

// ── RENDER CATEGORIES ────────────────────────────────────────
function renderCategoriesTable() {
  const container = document.getElementById('admin-cats-tbody');
  if (!container || typeof RAKTAKK === 'undefined') return;

  container.innerHTML = RAKTAKK.categories.map((c, i) => `
    <tr>
      <td style="font-size:1.3rem;">${c.icon}</td>
      <td><strong>${c.name}</strong></td>
      <td><span class="badge badge-verified">${c.count}</span></td>
      <td style="color:var(--text-muted);font-size:.82rem;">${i + 1}</td>
      <td><span class="status status-active">Active</span></td>
      <td>
        <div class="actions">
          <button class="action-btn action-edit" onclick="showToast('Modification catégorie','info')">✏️</button>
          <button class="action-btn action-delete" onclick="showToast('Catégorie supprimée','warning')">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── DELETE CONFIRMATION ─────────────────────────────────────
function confirmDelete(btn) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
    const row = btn.closest('tr');
    if (row) {
      row.style.transition = 'all .3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => row.remove(), 300);
      showToast('Élément supprimé', 'success');
    }
  }
}

// ── ADMIN MODAL ──────────────────────────────────────────────
function openAdminModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeAdminModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

document.querySelectorAll('[data-admin-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => openAdminModal(btn.dataset.adminModalOpen));
});
document.querySelectorAll('[data-admin-modal-close]').forEach(btn => {
  btn.addEventListener('click', () => closeAdminModal(btn.dataset.adminModalClose));
});
document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAdminModal(overlay.id);
  });
});

// ── ADMIN TOAST ───────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── EXPORT SIMULATION ─────────────────────────────────────────
document.querySelectorAll('[data-export]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.export;
    showToast(`Export ${type} en cours...`, 'info');
    setTimeout(() => showToast(`Export ${type}.csv téléchargé !`, 'success'), 1500);
  });
});

// ── SEARCH FILTER ─────────────────────────────────────────────
document.querySelectorAll('.filter-search input').forEach(input => {
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const tbody = document.querySelector('.admin-table tbody');
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });
});

// ── SETTINGS SAVE ────────────────────────────────────────────
document.querySelectorAll('[data-settings-save]').forEach(btn => {
  btn.addEventListener('click', () => {
    showToast('Paramètres sauvegardés avec succès', 'success');
  });
});

// ── INIT ALL ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderAdminUsersTable();
  renderVendorsTable();
  renderCampaignsTable();
  renderAdminChart();
  renderCategoriesTable();
});

// Expose globals
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.showToast = showToast;
window.confirmDelete = confirmDelete;
