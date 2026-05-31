// ============================================================
// RAKTAKK — Main App JS v1.0
// ============================================================

'use strict';

// ── HEADER SCROLL BEHAVIOR ──────────────────────────────────
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── MOBILE MENU ─────────────────────────────────────────────
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

// ── TOAST NOTIFICATIONS ─────────────────────────────────────
function showToast(msg, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️', lead: '🎯', review: '⭐', payment: '💳' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${msg}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ── MODAL SYSTEM ─────────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.querySelectorAll('[data-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
});
document.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ── FAVORITES ────────────────────────────────────────────────
const favorites = new Set(JSON.parse(localStorage.getItem('raktakk_favs') || '[]'));

function toggleFavorite(id, btn) {
  if (favorites.has(id)) {
    favorites.delete(id);
    btn.textContent = '♡';
    btn.style.color = '';
    showToast('Retiré des favoris', 'info');
  } else {
    favorites.add(id);
    btn.textContent = '♥';
    btn.style.color = '#FF5A1F';
    showToast('Ajouté aux favoris !', 'success');
  }
  localStorage.setItem('raktakk_favs', JSON.stringify([...favorites]));
}

document.querySelectorAll('[data-fav]').forEach(btn => {
  const id = btn.dataset.fav;
  if (favorites.has(id)) { btn.textContent = '♥'; btn.style.color = '#FF5A1F'; }
  btn.addEventListener('click', () => toggleFavorite(id, btn));
});

// ── SEARCH ───────────────────────────────────────────────────
const searchInputs = document.querySelectorAll('.hero-search-input');
searchInputs.forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
  });
});

document.querySelectorAll('[data-search-btn]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.search-bar')?.querySelector('input');
    const q = input?.value.trim();
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  });
});

// ── ANIMATE ON SCROLL ────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-scroll').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});

// ── COUNTER ANIMATION ─────────────────────────────────────────
function animateCount(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = isDecimal ? (target * ease).toFixed(1) : Math.floor(target * ease);
    el.textContent = formatNum(val) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function formatNum(n) {
  return Number(n).toLocaleString('fr-FR');
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      animateCount(el, target, suffix);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

// ── TABS ──────────────────────────────────────────────────────
document.querySelectorAll('[data-tabs]').forEach(container => {
  const triggers = container.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-tab-panel]');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      triggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');
      const target = trigger.dataset.tab;
      panels.forEach(p => {
        p.classList.toggle('active', p.dataset.tabPanel === target);
      });
    });
  });
});

// ── FORM VALIDATION ───────────────────────────────────────────
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
      input.addEventListener('input', () => input.classList.remove('error'), { once: true });
    }
  });
  return valid;
}

// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── RATING STARS ──────────────────────────────────────────────
document.querySelectorAll('.star-rating').forEach(container => {
  const stars = container.querySelectorAll('.star');
  stars.forEach((star, i) => {
    star.addEventListener('mouseover', () => {
      stars.forEach((s, j) => s.classList.toggle('active', j <= i));
    });
    star.addEventListener('click', () => {
      container.dataset.value = i + 1;
      stars.forEach((s, j) => s.classList.toggle('selected', j <= i));
    });
  });
  container.addEventListener('mouseleave', () => {
    const val = parseInt(container.dataset.value) - 1;
    stars.forEach((s, j) => s.classList.toggle('active', j <= val));
  });
});

// ── PROGRESS BARS ─────────────────────────────────────────────
const progressObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const w = bar.dataset.width;
      setTimeout(() => { bar.style.width = w + '%'; }, 100);
      progressObs.unobserve(bar);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
  el.style.width = '0'; progressObs.observe(el);
});

// ── URL PARAMS ────────────────────────────────────────────────
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ── VENDOR CARDS ──────────────────────────────────────────────
function renderVendorCard(v) {
  return `
    <div class="card card-vendor animate-scroll">
      <div class="card-vendor-banner"></div>
      <div class="card-vendor-logo">${v.emoji}</div>
      <div class="card-vendor-body">
        <div class="card-vendor-name">
          ${v.name}
          ${v.verified ? '<span title="Vérifié" style="color:var(--brand-teal)">✓</span>' : ''}
        </div>
        <div class="card-vendor-meta">📍 ${v.city}, ${v.country} &nbsp;·&nbsp; ${v.category}</div>
        <div class="card-vendor-rating">
          <span class="stars">${'★'.repeat(Math.round(v.rating))}</span>
          <span class="rating-num">${v.rating}</span>
          <span class="review-count">(${v.reviews} avis)</span>
        </div>
        <div class="card-vendor-tags">
          ${v.services.slice(0,3).map(s => `<span class="tag">${s}</span>`).join('')}
        </div>
        <div class="card-vendor-footer">
          <span style="font-size:.82rem;color:var(--text-muted);">${v.price}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn-icon" data-fav="${v.id}" title="Favoris" style="font-size:1.1rem;">♡</button>
            <a href="profile.html?id=${v.id}" class="btn btn-primary btn-sm">Voir</a>
          </div>
        </div>
      </div>
      ${v.badge ? `<div style="position:absolute;top:12px;right:12px;"><span class="badge badge-${v.badge.toLowerCase().replace('é','e').replace('é','e')}">${v.badge}</span></div>` : ''}
    </div>`;
}

// ── PAGE: HOME — render top vendors ───────────────────────────
const vendorsGrid = document.querySelector('#vendors-grid');
if (vendorsGrid && typeof RAKTAKK !== 'undefined') {
  const top = RAKTAKK.vendors.filter(v => v.rating >= 4.7).slice(0, 6);
  vendorsGrid.innerHTML = top.map(renderVendorCard).join('');
  // Re-init favs
  vendorsGrid.querySelectorAll('[data-fav]').forEach(btn => {
    const id = btn.dataset.fav;
    if (favorites.has(id)) { btn.textContent = '♥'; btn.style.color = '#FF5A1F'; }
    btn.addEventListener('click', () => toggleFavorite(id, btn));
  });
  // Re-observe scroll animations
  vendorsGrid.querySelectorAll('.animate-scroll').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ── PAGE: HOME — render categories ────────────────────────────
const catsGrid = document.querySelector('#categories-grid');
if (catsGrid && typeof RAKTAKK !== 'undefined') {
  catsGrid.innerHTML = RAKTAKK.categories.slice(0, 12).map(c => `
    <a href="search.html?cat=${encodeURIComponent(c.name)}" class="cat-card animate-scroll">
      <span class="cat-icon">${c.icon}</span>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count} prestataires</div>
    </a>`).join('');
  catsGrid.querySelectorAll('.animate-scroll').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ── PAGE: HOME — render cities ────────────────────────────────
const citiesGrid = document.querySelector('#cities-grid');
if (citiesGrid && typeof RAKTAKK !== 'undefined') {
  citiesGrid.innerHTML = RAKTAKK.cities.map(c => `
    <div class="city-card animate-scroll" onclick="window.location='search.html?city=${encodeURIComponent(c.name)}'">
      <div class="city-emoji">${c.emoji}</div>
      <div class="city-name">${c.name}</div>
      <div class="city-country">${c.country}</div>
      <div class="city-vendors">${c.vendors.toLocaleString('fr-FR')} prestataires</div>
    </div>`).join('');
  citiesGrid.querySelectorAll('.animate-scroll').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ── QUICK ACTIONS ─────────────────────────────────────────────
document.querySelectorAll('[data-action]').forEach(el => {
  el.addEventListener('click', () => {
    const action = el.dataset.action;
    if (action === 'share-whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent('Découvrez Raktakk — La plateforme de mise en relation professionnelle en Afrique: https://raktakk.com')}`, '_blank');
    }
    if (action === 'copy-link') {
      navigator.clipboard.writeText(window.location.href).then(() => showToast('Lien copié !', 'success'));
    }
  });
});

// ── BACK TO TOP ───────────────────────────────────────────────
const backTop = document.querySelector('.back-to-top');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav links
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
});
