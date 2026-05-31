'use strict';
(function () {
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function value(sel, root = document) { return (qs(sel, root)?.value || '').trim(); }
  function selectedText(sel, root = document) { return qs(sel, root)?.selectedOptions?.[0]?.textContent?.trim() || ''; }
  function checkedLabels(sel, root = document) {
    return qsa(sel, root).filter((x) => x.checked).map((x) => x.nextElementSibling?.textContent?.trim()).filter(Boolean);
  }
  function setLoading(btn, text) {
    if (!btn) return () => {};
    const old = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${text}`;
    return () => { btn.disabled = false; btn.innerHTML = old; };
  }
  function getEmergencyAdmin() {
    return window.RAKTAKK_CONFIG?.emergencyAdmin || { email: 'admin@raktakk.com', username: 'admin', password: 'Admin@12345' };
  }
  function isEmergencyAdmin(identifier, password) {
    const admin = getEmergencyAdmin();
    const clean = (identifier || '').trim().toLowerCase();
    return password === admin.password && (clean === String(admin.email || '').toLowerCase() || clean === String(admin.username || '').toLowerCase());
  }
  function createEmergencyAdminSession() {
    const admin = getEmergencyAdmin();
    const session = { role: 'admin', email: admin.email, username: admin.username, mode: 'local', loggedAt: new Date().toISOString() };
    try { localStorage.setItem('raktakk_admin_session', JSON.stringify(session)); } catch (e) {}
    return session;
  }
  async function waitApi() {
    if (window.RAKTAKK_API) return window.RAKTAKK_API;
    await new Promise((r) => setTimeout(r, 250));
    if (window.RAKTAKK_API) return window.RAKTAKK_API;
    return null;
  }
  function updateTypeUI(type) {
    const map = { client: 'register-client.html', vendor: 'register-vendor.html', advertiser: 'register-advertiser.html', admin: 'login.html' };
    const registerLink = qs('#register-link');
    if (registerLink && map[type]) registerLink.href = map[type];
  }
  window.selectType = function (btn, type) {
    qsa('.type-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.body.dataset.accountType = type;
    const label = qs('label[for="login-email"], .form-label');
    if (label && qs('#login-email')) {
      label.innerHTML = type === 'admin' ? 'Email ou identifiant <span>*</span>' : 'Email <span>*</span>';
      qs('#login-email').type = type === 'admin' ? 'text' : 'email';
      qs('#login-email').placeholder = type === 'admin' ? 'admin ou admin@raktakk.com' : 'votre@email.com';
    }
    updateTypeUI(type);
  };
  window.togglePass = function () {
    const inp = qs('#login-pass'); const eye = qs('#pass-eye');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    if (eye) eye.textContent = inp.type === 'password' ? '👁' : '🙈';
  };
  window.socialLogin = function (provider) { showToast(`Connexion ${provider} non activée dans cette version. Configurez Supabase OAuth.`, 'info'); };
  window.handleLogin = async function (e) {
    e.preventDefault();
    const api = await waitApi();
    const type = document.body.dataset.accountType || 'client';
    const identifier = value('#login-email');
    const password = value('#login-pass');
    const btn = qs('#login-btn');
    const done = setLoading(btn, 'Connexion...');
    try {
      if (type === 'admin' && isEmergencyAdmin(identifier, password)) {
        createEmergencyAdminSession();
        showToast('Connexion admin activée.', 'success');
        window.location.href = 'dashboard-admin.html';
        return;
      }
      if (!api) throw new Error('Configuration Supabase absente. Connectez-vous en admin avec les identifiants par défaut ou configurez Supabase.');
      await api.login(identifier, password);
      const profile = await api.getCurrentProfile();
      if (!profile) throw new Error('Profil introuvable.');
      if (type === 'admin' && profile.role !== 'admin') throw new Error("Ce compte n'a pas accès à l'administration.");
      if (type !== 'admin' && profile.role !== type) showToast(`Connexion réussie. Redirection vers votre espace ${profile.role}.`, 'info');
      window.location.href = raktakkRedirectByRole(profile.role);
      return;
    } catch (err) {
      showToast(err.message || 'Connexion impossible', 'error');
    } finally {
      done();
    }
  };

  function getVendorData() {
    const step1 = qs('#section-1'); const step2 = qs('#section-2'); const step3 = qs('#section-3');
    const services = qsa('.service-entry', step2).map((entry) => ({
      name: value('input[placeholder*="Gestion"]', entry) || value('input', entry),
      price_label: qsa('input', entry)[1]?.value?.trim() || '',
    })).filter((s) => s.name);
    const plan = qs('input[name="plan"]:checked', step3)?.value || 'free';
    const allStep1Inputs = qsa('input, select, textarea', step1);
    const adminInputs = qsa('input', step3).slice(-4);
    const fullName = `${adminInputs[0]?.value?.trim() || ''} ${adminInputs[1]?.value?.trim() || ''}`.trim();
    return {
      role: 'vendor',
      company_name: allStep1Inputs[0]?.value?.trim() || '',
      category_name: selectedText('select', step1),
      description: qs('textarea', step1)?.value?.trim() || '',
      country: qsa('select', step1)[1]?.selectedOptions?.[0]?.textContent?.trim() || 'Sénégal',
      city: allStep1Inputs[2]?.value?.trim() || '',
      phone: allStep1Inputs[3]?.value?.trim() || '',
      whatsapp: allStep1Inputs[4]?.value?.trim() || '',
      email: allStep1Inputs[5]?.value?.trim() || '',
      website: allStep1Inputs[6]?.value?.trim() || '',
      price_range: qsa('select', step2)[0]?.selectedOptions?.[0]?.textContent?.trim() || '',
      coverage_area: qsa('select', step2)[1]?.selectedOptions?.[0]?.textContent?.trim() || '',
      plan,
      full_name: fullName,
      password: adminInputs[2]?.value?.trim() || '',
      password_confirm: adminInputs[3]?.value?.trim() || '',
      services,
    };
  }
  function getClientData() {
    const step1 = qs('#step-1-content'); const step2 = qs('#step-2-content');
    const row1 = qsa('.form-row .form-group input', step1);
    const email = qs('input[type="email"]', step1)?.value?.trim() || '';
    const phone = qs('input[type="tel"]', step1)?.value?.trim() || '';
    const city = qs('select', step1)?.selectedOptions?.[0]?.textContent?.trim() || '';
    const pw = qsa('input[type="password"]', step2);
    return {
      role: 'client',
      full_name: `${row1[0]?.value?.trim() || ''} ${row1[1]?.value?.trim() || ''}`.trim(),
      email, phone, city, country: 'Sénégal',
      password: pw[0]?.value?.trim() || '', password_confirm: pw[1]?.value?.trim() || '',
      interests: checkedLabels('#interest-chips input', step2),
      accepted_terms: qs('#tos', step2)?.checked || false,
    };
  }
  function getAdvertiserData() {
    const root = qs('#form-content') || document;
    const inputs = qsa('input, select', root);
    const format = qs('.format-card.selected input', root)?.value || 'banner';
    return {
      role: 'advertiser',
      company_name: inputs[0]?.value?.trim() || '',
      sector: qsa('select', root)[0]?.selectedOptions?.[0]?.textContent?.trim() || '',
      full_name: `${inputs[1]?.value?.trim() || ''} ${inputs[2]?.value?.trim() || ''}`.trim(),
      email: inputs[3]?.value?.trim() || '',
      phone: inputs[4]?.value?.trim() || '',
      budget_range: qsa('select', root)[1]?.selectedOptions?.[0]?.textContent?.trim() || '',
      ad_format: format,
      password: qsa('input[type="password"]', root)[0]?.value?.trim() || '',
      password_confirm: qsa('input[type="password"]', root)[1]?.value?.trim() || '',
      accepted_terms: qs('#tos-adv', root)?.checked || false,
    };
  }
  function validateCommon(data) {
    if (!data.email) throw new Error('Email obligatoire.');
    if (!data.password || data.password.length < 8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    if (data.password !== data.password_confirm) throw new Error('Les mots de passe ne correspondent pas.');
  }
  async function finalizeRegistration(data) {
    const api = await waitApi();
    validateCommon(data);
    if (data.accepted_terms === false && data.role !== 'vendor') throw new Error('Veuillez accepter les conditions.');
    const signup = await api.registerAccount(data);
    const user = signup.user || signup.session?.user;
    if (!user) {
      showToast("Compte créé. Vérifiez votre email pour confirmer l'inscription.", 'success', 7000);
      return null;
    }
    await api.ensureProfile(user, data);
    await api.upsertProfile({
      id: user.id,
      email: data.email,
      role: data.role,
      full_name: data.full_name || '',
      company_name: data.company_name || '',
      phone: data.phone || null,
      city: data.city || null,
      country: data.country || null,
      plan: data.plan || 'free',
      account_status: 'active',
    });
    if (data.role === 'client') {
      await api.saveRoleDetails('client', { user_id: user.id, interests: data.interests || [] });
    } else if (data.role === 'vendor') {
      await api.saveRoleDetails('vendor', {
        user_id: user.id,
        category_name: data.category_name,
        description: data.description,
        whatsapp: data.whatsapp,
        website: data.website,
        price_range: data.price_range,
        coverage_area: data.coverage_area,
        services: data.services,
      });
    } else if (data.role === 'advertiser') {
      await api.saveRoleDetails('advertiser', {
        user_id: user.id,
        sector: data.sector,
        budget_range: data.budget_range,
        ad_format: data.ad_format,
      });
    }
    return user;
  }

  window.nextStep = function (n) {
    if (typeof n === 'number') {
      const current = Number(document.body.dataset.currentStep || 1);
      const currentSection = qs(`#section-${current}`); const currentStep = qs(`#step-${current}`);
      currentSection?.classList.remove('active'); currentStep?.classList.remove('active'); currentStep?.classList.add('done');
      qs(`#section-${n}`)?.classList.add('active'); qs(`#step-${n}`)?.classList.add('active'); qs(`#step-${n}`)?.classList.remove('done');
      document.body.dataset.currentStep = String(n); const bar = qs('#progress-bar'); if (bar) bar.style.width = (n / 4 * 100) + '%';
      window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    qs('#step-1-content') && (qs('#step-1-content').style.display = 'none');
    qs('#step-2-content') && (qs('#step-2-content').style.display = 'block');
    qs('#dot-1')?.classList.replace('active', 'done'); qs('#dot-2')?.classList.add('active');
  };
  window.prevStep = function () {
    qs('#step-2-content') && (qs('#step-2-content').style.display = 'none');
    qs('#step-1-content') && (qs('#step-1-content').style.display = 'block');
    qs('#dot-2')?.classList.remove('active'); qs('#dot-1')?.classList.replace('done', 'active');
  };
  window.toggleInterest = function (cb) {
    const chip = cb.nextElementSibling;
    if (!chip) return;
    if (cb.checked) { chip.style.background = 'var(--brand-primary)'; chip.style.color = '#fff'; chip.style.borderColor = 'var(--brand-primary)'; }
    else { chip.style.background = ''; chip.style.color = ''; chip.style.borderColor = ''; }
  };
  window.addService = function () {
    const c = qs('#services-container'); if (!c) return;
    const div = document.createElement('div');
    div.className = 'service-entry';
    div.style.cssText = 'border:1.5px solid var(--border-light);border-radius:var(--radius-lg);padding:20px;margin-bottom:14px;animation:fadeInUp .3s ease;';
    div.innerHTML = `<div class="form-row"><div class="form-group" style="margin-bottom:0;"><label class="form-label">Nom du service</label><input class="form-input" type="text" placeholder="ex: Gestion des réseaux sociaux" /></div><div class="form-group" style="margin-bottom:0;"><label class="form-label">Prix indicatif</label><input class="form-input" type="text" placeholder="ex: Depuis 50 000 FCFA/mois" /></div></div><div style="text-align:right;margin-top:10px;"><button type="button" onclick="this.closest('.service-entry').remove()" class="btn btn-ghost btn-sm" style="color:#EF4444;">✕ Supprimer</button></div>`;
    c.appendChild(div);
  };
  window.selectPlan = function (label) {
    qsa('.plan-option').forEach((p) => p.classList.remove('selected'));
    label.classList.add('selected');
    const radio = qs('input[type="radio"]', label); if (radio) radio.checked = true;
  };
  window.selectFormat = function (card) {
    qsa('.format-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    const radio = qs('input[type="radio"]', card); if (radio) radio.checked = true;
  };
  window.socialReg = function (provider) { showToast(`OAuth ${provider} à activer dans Supabase.`, 'info'); };
  window.submitReg = async function () {
    const btn = document.querySelector('#step-2-content .btn-primary'); const done = setLoading(btn, 'Création...');
    try {
      await finalizeRegistration(getClientData());
      qs('#step-2-content').style.display = 'none'; qs('#success-content').style.display = 'block';
      qsa('.step-dot').forEach((d) => { d.classList.remove('active'); d.classList.add('done'); });
    } catch (err) { showToast(err.message || 'Création impossible', 'error'); done(); }
  };
  window.submitAdv = async function () {
    const btn = document.querySelector('#form-content .btn-primary'); const done = setLoading(btn, 'Création...');
    try {
      await finalizeRegistration(getAdvertiserData());
      qs('#form-content').style.display = 'none'; qs('#success-content').style.display = 'block';
    } catch (err) { showToast(err.message || 'Création impossible', 'error'); done(); }
  };
  window.submitForm = async function () {
    const btn = document.querySelector('#section-3 .btn-primary'); const done = setLoading(btn, 'Création...');
    try {
      await finalizeRegistration(getVendorData());
      qs('#section-3').classList.remove('active'); qs('#success-screen').classList.add('show'); const bar = qs('#progress-bar'); if (bar) bar.style.width = '100%';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { showToast(err.message || 'Création impossible', 'error'); done(); }
  };
  document.addEventListener('DOMContentLoaded', async () => {
    if (qs('#login-form')) {
      document.body.dataset.accountType = document.body.dataset.accountType || 'client';
      updateTypeUI('client');
      try {
        const api = await waitApi();
        const session = await api.getSession();
        if (session?.user) {
          const profile = await api.ensureProfile(session.user);
          if (profile) window.location.href = raktakkRedirectByRole(profile.role);
        }
      } catch (_) {}
    }
  });
})();
