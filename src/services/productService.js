import api from './api';
import { marketplaceService } from './marketplaceService';
import springApi from './springApi';
import {
  mapCategoryResponseToModel,
  mapCityResponseToModel,
  mapReviewResponseToModel,
} from '../mappers/productMapper';

export const productService = {
  async categories() {
    const { data } = await api.get('/api/public/categories');
    return data.map(mapCategoryResponseToModel);
  },
  async subcategories(categoryId) {
    const { data } = await api.get('/api/public/subcategories', { params: { categoryId } });
    return data;
  },
  async vendors(params = {}) {
    return marketplaceService.getVendors(params?.q || '');
  },
  async vendorById(id) {
    return marketplaceService.getVendorById(id);
  },
  async cities() {
    const { data } = await api.get('/api/public/cities');
    return data.map(mapCityResponseToModel);
  },
  async reviews(vendorId) {
    const { data } = await springApi.get('/api/reviews', { params: { vendorId } });
    return data.map(mapReviewResponseToModel);
  }
};
