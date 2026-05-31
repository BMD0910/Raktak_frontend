import API_URL from './api';

export const environment = {
  production: import.meta.env.PROD,
  apiUrl: API_URL
};

export default environment;