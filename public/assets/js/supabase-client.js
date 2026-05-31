'use strict';
(function () {
  const cfg = window.RAKTAKK_CONFIG || {};
  const url = cfg.supabaseUrl;
  const key = cfg.supabaseAnonKey;
  if (!url || !key || url.includes('YOUR_PROJECT') || key.includes('YOUR_SUPABASE')) {
    console.error('Supabase config missing. Update assets/js/supabase-config.js');
    window.raktakkSupabase = null;
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase CDN not loaded.');
    window.raktakkSupabase = null;
    return;
  }
  window.raktakkSupabase = window.supabase.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  window.RAKTAKK_API = {
    supabase: window.raktakkSupabase,
    async getSession() {
      const { data, error } = await window.raktakkSupabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    async getUser() {
      const { data, error } = await window.raktakkSupabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    async signOut() { return window.raktakkSupabase.auth.signOut(); },
    async requestPasswordReset(email) {
      const redirectTo = (window.RAKTAKK_CONFIG?.defaultRedirect || window.location.origin) + '/reset-password.html';
      const { data, error } = await window.raktakkSupabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return data;
    },
    async updatePassword(newPassword) {
      const { data, error } = await window.raktakkSupabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },
    async resolveIdentifier(identifier) {
      const clean = (identifier || '').trim().toLowerCase();
      if (!clean) return null;
      if (clean.includes('@')) return clean;
      const { data, error } = await window.raktakkSupabase.rpc('resolve_login_identifier', { p_identifier: clean });
      if (error) throw error;
      return data || null;
    },
    async login(identifier, password) {
      const email = await this.resolveIdentifier(identifier);
      if (!email) throw new Error('Identifiant introuvable.');
      const { data, error } = await window.raktakkSupabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async registerAccount(payload) {
      const { data, error } = await window.raktakkSupabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          emailRedirectTo: (window.RAKTAKK_CONFIG?.defaultRedirect || window.location.origin) + '/login.html',
          data: {
            role: payload.role,
            full_name: payload.full_name || '',
            company_name: payload.company_name || '',
            username: payload.username || null,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    async fetchProfile(userId) {
      const { data, error } = await window.raktakkSupabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    },
    async upsertProfile(profile) {
      const { data, error } = await window.raktakkSupabase.from('profiles').upsert(profile).select().single();
      if (error) throw error;
      return data;
    },
    async ensureProfile(user, fallback = {}) {
      try { return await this.fetchProfile(user.id); }
      catch (err) {
        const meta = user.user_metadata || {};
        const payload = {
          id: user.id,
          email: user.email,
          role: fallback.role || meta.role || 'client',
          full_name: fallback.full_name || meta.full_name || '',
          company_name: fallback.company_name || meta.company_name || '',
          username: fallback.username || meta.username || null,
          phone: fallback.phone || null,
          city: fallback.city || null,
          country: fallback.country || null,
          account_status: 'active',
          plan: fallback.plan || 'free',
        };
        return await this.upsertProfile(payload);
      }
    },
    async saveRoleDetails(role, row) {
      const map = { client: 'client_profiles', vendor: 'vendor_profiles', advertiser: 'advertiser_profiles' };
      const table = map[role];
      if (!table) return null;
      const { data, error } = await window.raktakkSupabase.from(table).upsert(row).select().single();
      if (error) throw error;
      return data;
    },
    async getCurrentProfile() {
      const session = await this.getSession();
      if (!session?.user) return null;
      return this.ensureProfile(session.user);
    },
    async requireAuth(allowedRoles = []) {
      const session = await this.getSession();
      if (!session?.user) return null;
      const profile = await this.ensureProfile(session.user);
      if (allowedRoles.length && !allowedRoles.includes(profile.role)) throw new Error('Accès non autorisé pour ce rôle.');
      return { session, user: session.user, profile };
    },
  };
})();
