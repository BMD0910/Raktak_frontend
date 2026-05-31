// ============================================================
// RAKTAKK — Dashboard JS v1.0
// Handles client, vendor & advertiser dashboards
// ============================================================

'use strict';

// ── SIDEBAR NAVIGATION ───────────────────────────────────────
const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
const dashPages = document.querySelectorAll('.dash-page');
const topbarTitle = document.querySelector('.topbar-title');

function switchPage(pageId) {
  dashPages.forEach(p => p.classList.toggle('active', p.id === pageId));
  sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  if (topbarTitle) {
    const active = document.querySelector(`.sidebar-link[data-page="${pageId}"]`);
    if (active) topbarTitle.textContent = active.querySelector('span')?.textContent || '';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    switchPage(page);
    // Hash for bookmarking
    window.history.replaceState(null, '', `#${page}`);
    // Close mobile sidebar
    document.querySelector('.dash-sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('show');
  });
});

// ── MOBILE SIDEBAR TOGGLE ─────────────────────────────────────
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.dash-sidebar');

if (sidebarToggle) {
  let overlay;
  sidebarToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,42,.5);z-index:99;display:none;backdrop-filter:blur(4px);';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      });
    }
    overlay.style.display = isOpen ? 'block' : 'none';
  });
}

// ── URL HASH ROUTING ─────────────────────────────────────────
function initPageFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash) switchPage(hash);
  else {
    const firstPage = dashPages[0];
    if (firstPage) switchPage(firstPage.id);
  }
}
initPageFromHash();

// ── CHART RENDERING ──────────────────────────────────────────
function renderBarChart(containerId, data, maxVal) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const max = maxVal || Math.max(...data.map(d => d.value));
  container.innerHTML = `
    <div class="chart-container">
      ${data.map(d => `
        <div class="chart-bar" data-val="${formatAmount(d.value)}"
          style="height:${Math.max((d.value / max) * 100, 4)}%"
          title="${d.label}: ${formatAmount(d.value)}">
        </div>
      `).join('')}
    </div>
    <div class="chart-labels">
      ${data.map(d => `<div class="chart-label">${d.label}</div>`).join('')}
    </div>`;
}

function formatAmount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return n.toString();
}

// Render revenue chart on vendor/admin dashboards
if (typeof RAKTAKK !== 'undefined' && RAKTAKK.revenue?.monthly) {
  const chartData = RAKTAKK.revenue.monthly.map(m => ({
    label: m.month.split(' ')[0].slice(0, 3),
    value: m.amount
  }));
  renderBarChart('revenue-chart', chartData);
}

// ── LEADS DATA RENDERING ─────────────────────────────────────
function renderLeads(containerId, leads) {
  const container = document.getElementById(containerId);
  if (!container || !leads) return;

  container.innerHTML = leads.map(l => `
    <div class="lead-card">
      <div class="lead-avatar">👤</div>
      <div class="lead-content">
        <div class="lead-name">${l.client}</div>
        <p class="lead-description">${l.description}</p>
        <div class="lead-tags">
          <span class="tag">📍 ${l.city}</span>
          <span class="tag">💰 ${l.budget}</span>
          ${l.urgent ? '<span class="tag" style="background:rgba(255,90,31,.08);color:var(--brand-primary);border-color:rgba(255,90,31,.2);">🔥 Urgent</span>' : ''}
        </div>
        <div class="lead-meta">
          <span>🗂️ ${l.category}</span>
          <span>📅 ${timeAgo(l.date)}</span>
          <span>💬 ${l.responses} réponse(s)</span>
        </div>
      </div>
      <div class="lead-actions">
        <button class="btn btn-primary btn-sm" onclick="showToast('Message envoyé!','success')">Répondre</button>
        <button class="btn btn-secondary btn-sm">Ignorer</button>
      </div>
    </div>`).join('');
}

if (typeof RAKTAKK !== 'undefined') {
  renderLeads('leads-list', RAKTAKK.requests.slice(0, 5));
}

// ── ACTIVITY FEED RENDERING ───────────────────────────────────
function renderActivity(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const activities = [
    { type: 'lead', icon: '🎯', text: '<strong>Nouveau lead</strong> de Moussa Diop — Marketing Digital', time: 'Il y a 5 min' },
    { type: 'review', icon: '⭐', text: '<strong>Avis 5 étoiles</strong> reçu de Aminata Sow', time: 'Il y a 23 min' },
    { type: 'message', icon: '💬', text: '<strong>Message</strong> de Ibrahim Koné en attente', time: 'Il y a 1h' },
    { type: 'payment', icon: '💳', text: '<strong>Paiement reçu</strong> — Abonnement Pro renouvelé', time: 'Il y a 3h' },
    { type: 'system', icon: '✅', text: 'Votre profil a été <strong>vérifié</strong> avec succès', time: 'Hier' },
    { type: 'lead', icon: '🎯', text: '<strong>Nouveau lead</strong> de Fatou Bah — Événementiel', time: 'Il y a 2 jours' },
  ];

  container.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot ${a.type}">${a.icon}</div>
      <div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>`).join('');
}

renderActivity('activity-feed');

// ── MESSAGES RENDERING ────────────────────────────────────────
function renderMessages(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof RAKTAKK === 'undefined') return;

  container.innerHTML = RAKTAKK.messages.map(m => `
    <div class="msg-item ${m.unread ? 'unread' : ''}">
      <div class="msg-avatar">${m.avatar}</div>
      <div style="flex:1;min-width:0;">
        <div class="msg-name">${m.from}</div>
        <div class="msg-preview">${m.preview}</div>
      </div>
      <div class="msg-meta">
        <div class="msg-time">${m.time}</div>
        ${m.unread ? '<div class="msg-unread-dot"></div>' : ''}
      </div>
    </div>`).join('');
}

renderMessages('messages-list');

// ── KYC STEPS RENDERING ───────────────────────────────────────
function renderKYC(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const steps = [
    { name: 'Identité vérifiée', desc: 'Pièce d\'identité ou passeport', status: 'done', icon: '🪪' },
    { name: 'Adresse confirmée', desc: 'Justificatif de domicile', status: 'done', icon: '🏠' },
    { name: 'Registre de commerce', desc: 'Document officiel de votre entreprise', status: 'pending', icon: '📄' },
    { name: 'Photo de profil', desc: 'Photo professionnelle de qualité', status: 'done', icon: '📸' },
    { name: 'Téléphone confirmé', desc: 'Numéro WhatsApp vérifié par SMS', status: 'todo', icon: '📱' },
  ];

  container.innerHTML = steps.map(s => `
    <div class="kyc-step ${s.status}">
      <div class="kyc-icon">${s.icon}</div>
      <div class="kyc-info">
        <div class="kyc-name">${s.name}</div>
        <div class="kyc-desc">${s.desc}</div>
      </div>
      <div>
        ${s.status === 'done' ? '<span class="kyc-status-done">✓</span>' :
          s.status === 'pending' ? '<span class="status status-pending">En cours</span>' :
          '<button class="btn btn-secondary btn-sm" onclick="showToast(\'Document envoyé!\',\'success\')">Envoyer</button>'}
      </div>
    </div>`).join('');
}

renderKYC('kyc-steps');

// ── PAYMENT HISTORY RENDERING ─────────────────────────────────
function renderPayments(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const payments = [
    { label: 'Abonnement Business', date: '15 Jan 2024', amount: 79900, type: 'debit', icon: '📦' },
    { label: 'Remboursement partiel', date: '10 Jan 2024', amount: 15000, type: 'credit', icon: '↩️' },
    { label: 'Abonnement Business', date: '15 Déc 2023', amount: 79900, type: 'debit', icon: '📦' },
    { label: 'Commission Lead x5', date: '5 Déc 2023', amount: 25000, type: 'debit', icon: '🎯' },
    { label: 'Bonus Parrainage', date: '1 Déc 2023', amount: 10000, type: 'credit', icon: '🎁' },
  ];

  container.innerHTML = payments.map(p => `
    <div class="payment-item">
      <div class="payment-left">
        <div class="payment-icon">${p.icon}</div>
        <div>
          <div class="payment-label">${p.label}</div>
          <div class="payment-date">${p.date}</div>
        </div>
      </div>
      <div class="payment-amount ${p.type}">
        ${p.type === 'credit' ? '+' : '-'} ${p.amount.toLocaleString('fr-FR')} FCFA
      </div>
    </div>`).join('');
}

renderPayments('payment-history');

// ── PROFILE COMPLETION BAR ────────────────────────────────────
function updateCompletion(pct, containerId) {
  const bar = document.querySelector(`#${containerId} .progress-fill`);
  const label = document.querySelector(`#${containerId} .completion-pct`);
  if (bar) { bar.dataset.width = pct; bar.style.width = pct + '%'; }
  if (label) label.textContent = pct + '%';
}

// ── NOTIFICATION DROPDOWN ────────────────────────────────────
const notifBtn = document.querySelector('.notif-btn');
if (notifBtn && typeof RAKTAKK !== 'undefined') {
  let dropdown;
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown && dropdown.parentElement) {
      dropdown.remove(); dropdown = null; return;
    }
    dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position:absolute; top:calc(100% + 8px); right:0; width:320px;
      background:#fff; border-radius:16px; box-shadow:var(--shadow-xl);
      border:1px solid var(--border-light); z-index:1000; overflow:hidden;`;

    const notifs = RAKTAKK.notifications;
    dropdown.innerHTML = `
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;">
        <strong style="font-size:.92rem;">Notifications</strong>
        <span style="font-size:.75rem;color:var(--brand-primary);cursor:pointer;">Tout lire</span>
      </div>
      ${notifs.map(n => `
        <div style="padding:14px 20px;border-bottom:1px solid var(--border-light);display:flex;gap:12px;align-items:flex-start;background:${!n.read ? 'rgba(255,90,31,.02)' : '#fff'}">
          <span style="font-size:1.2rem;">${{lead:'🎯',review:'⭐',message:'💬',payment:'💳',system:'🔔'}[n.type]||'🔔'}</span>
          <div style="flex:1;">
            <div style="font-size:.84rem;line-height:1.4;">${n.message}</div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:3px;">${n.time}</div>
          </div>
          ${!n.read ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--brand-primary);flex-shrink:0;margin-top:4px;"></span>' : ''}
        </div>`).join('')}
    `;

    notifBtn.style.position = 'relative';
    notifBtn.appendChild(dropdown);
    document.addEventListener('click', () => { dropdown?.remove(); dropdown = null; }, { once: true });
  });
}

// ── SERVICES FORM ─────────────────────────────────────────────
const addServiceBtn = document.querySelector('#add-service-btn');
if (addServiceBtn) {
  addServiceBtn.addEventListener('click', () => {
    openModal('add-service-modal');
  });
}

// ── STATS SIMULATION (live-like) ─────────────────────────────
function simulateLiveStats() {
  const liveViews = document.querySelector('#live-views');
  if (liveViews) {
    let views = 1247;
    setInterval(() => {
      views += Math.floor(Math.random() * 3);
      liveViews.textContent = views.toLocaleString('fr-FR');
    }, 5000);
  }
}
simulateLiveStats();

// ── HELPER ────────────────────────────────────────────────────
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

function showToast(msg, type = 'info') {
  if (window.showToast) return window.showToast(msg, type);
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

function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}
window.openModal = openModal; window.closeModal = closeModal;
window.showToast = showToast;
