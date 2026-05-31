'use strict';
(function () {
  const roleMap = {
    'dashboard-client.html': ['client'],
    'dashboard-vendor.html': ['vendor'],
    'dashboard-advertiser.html': ['advertiser'],
    'dashboard-admin.html': ['admin'],
  };

  function getLocalAdminSession() {
    try {
      const raw = localStorage.getItem('raktakk_admin_session');
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (session?.role !== 'admin') return null;
      return session;
    } catch (e) {
      return null;
    }
  }

  async function init() {
    const file = window.location.pathname.split('/').pop();
    const allowed = roleMap[file] || [];
    if (!allowed.length) return;

    if (file === 'dashboard-admin.html') {
      const localAdmin = getLocalAdminSession();
      if (localAdmin) {
        document.querySelectorAll('[data-current-user]').forEach((el) => {
          el.textContent = localAdmin.email || localAdmin.username || 'Admin';
        });
        document.body.dataset.localAdminMode = 'true';
        return;
      }
    }

    if (!window.RAKTAKK_API) {
      showToast('Configuration Supabase absente. Seul l'accès admin de secours est disponible.', 'warning');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      return;
    }

    try {
      const auth = await window.RAKTAKK_API.requireAuth(allowed);
      document.querySelectorAll('[data-current-user]').forEach((el) => {
        el.textContent = auth.profile.company_name || auth.profile.full_name || auth.user.email;
      });
    } catch (err) {
      showToast(err.message || 'Veuillez vous connecter.', 'warning');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
