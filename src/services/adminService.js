import api from './api';

export const adminService = {
  async listUsers(role) {
    const { data } = await api.get(`/api/admin/users.php?role=${encodeURIComponent(role)}`);
    return data.data || [];
  },
  async updateUserStatus(id, status, extra = null) {
    const payload = { id, account_status: status };
    if (extra?.reason) payload.reason = extra.reason;
    if (extra?.contact) payload.contact = extra.contact;
    const { data } = await api.post('/api/admin/users-status.php', payload);
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data;
  },
  async getServices(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const { data } = await api.get(`/api/admin/services.php?${params.toString()}`);
    return data;
  },
  async updateServiceStatus(id, status, reason = null) {
    const payload = { id, status };
    if (reason) payload.reason = reason;
    const { data } = await api.post('/api/admin/services-status.php', payload);
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data;
  },
  async getStats() {
    const { data } = await api.get('/api/admin/stats.php');
    return data.data || {};
  },
  async getCategories() {
    const { data } = await api.get('/api/admin/categories.php');
    return data.data || [];
  },
  async saveCategory(payload) {
    const { data } = await api.post('/api/admin/categories-save.php', payload);
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data.data;
  },
  async toggleCategory(id, active) {
    const { data } = await api.post('/api/admin/categories-toggle.php', { id, active });
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data.data;
  },
  async getSubcategories(categoryId = null) {
    const query = new URLSearchParams();
    if (categoryId) query.append('categoryId', categoryId);
    const { data } = await api.get(`/api/admin/subcategories.php?${query.toString()}`);
    return data.data || [];
  },
  async saveSubcategory(payload) {
    const { data } = await api.post('/api/admin/subcategories-save.php', payload);
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data.data;
  },
  async toggleSubcategory(id, active) {
    const { data } = await api.post('/api/admin/subcategories-toggle.php', { id, active });
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data.data;
  },
  async getSettings() {
    const { data } = await api.get('/api/admin/settings.php');
    return data.data || {};
  },
  async saveSettings(payload) {
    const { data } = await api.post('/api/admin/settings-save.php', payload);
    if (!data.ok) throw new Error(data.message || 'Erreur');
    return data.data || {};
  },
  async getMetrics() {
    const { data } = await api.get('/api/admin/metrics.php');
    return data.data || {};
  },
  async getUsersPaged(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.role) query.append('role', params.role);
    if (params.q) query.append('q', params.q);
    const { data } = await api.get(`/api/admin/users.php?${query.toString()}`);
    return data;
  },
  async getRequestsPaged(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const { data } = await api.get(`/api/admin/requests.php?${query.toString()}`);
    return data;
  },
  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.admin_id) params.append('admin_id', filters.admin_id);
    if (filters.target_type) params.append('target_type', filters.target_type);
    if (filters.action) params.append('action', filters.action);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    const { data } = await api.get(`/api/admin/audit-logs.php?${params.toString()}`);
    return {
      logs: data.data || [],
      pagination: data.pagination || { page: 1, limit: filters.limit || 20, total: 0, pages: 1 }
    };
  },
  exportAuditToCSV(logs) {
    const headers = ['ID', 'Admin ID', 'Action', 'Type', 'Target ID', 'Date', 'Motif'];
    const rows = logs.map(l => [l.id, l.admin_id, l.action, l.target_type, l.target_id, l.created_at, l.reason || '']);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  },
  async getAdmins(page = 0, limit = 10) {
    const { data } = await api.get(`/api/admin/admins.php?page=${page}&limit=${limit}`);
    if (!data.ok) {
      throw new Error(data.error || data.message || 'Erreur lors de la récupération des administrateurs');
    }
    return data;
  },
  async createAdmin(payload) {
    const { data } = await api.post('/api/admin/admins-create.php', payload);
    if (!data.ok) throw new Error(data.error || data.message || 'Erreur');
    return data;
  },
  async updateAdmin(payload) {
    const { data } = await api.post('/api/admin/admins-update.php', payload);
    if (!data.ok) throw new Error(data.error || data.message || 'Erreur');
    return data;
  },
  async deleteAdmin(payload) {
    const { data } = await api.post('/api/admin/admins-delete.php', payload);
    if (!data.ok) throw new Error(data.error || data.message || 'Erreur');
    return data;
  }
};
