import springApi from './springApi';

export const publicService = {
  async getSettings() {
    try {
      const { data } = await springApi.get('/api/public/settings');
      return data.data || {
        siteName: 'Raktakk',
        supportEmail: 'contact@raktakk.com',
        supportPhone: '+221 77 123 45 67'
      };
    } catch (error) {
      return {
        siteName: 'Raktakk',
        supportEmail: 'contact@raktakk.com',
        supportPhone: '+221 77 123 45 67'
      };
    }
  }
};
