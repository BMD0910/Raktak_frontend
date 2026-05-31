'use strict';
window.showToast = window.showToast || function (msg, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
};
window.raktakkRedirectByRole = function (role) {
  return ({ admin: 'dashboard-admin.html', vendor: 'dashboard-vendor.html', advertiser: 'dashboard-advertiser.html', client: 'requests.html' }[role] || 'requests.html');
};
window.bindLogoutButtons = function () {
  document.querySelectorAll('[data-logout], .logout-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        if (window.RAKTAKK_API) await window.RAKTAKK_API.signOut();
        try { localStorage.removeItem('raktakk_admin_session'); } catch (e) {}
        window.location.href = 'login.html';
      } catch (err) {
        showToast(err.message || 'Déconnexion impossible', 'error');
      }
    });
  });
};
document.addEventListener('DOMContentLoaded', bindLogoutButtons);
