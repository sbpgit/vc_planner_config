/**
 * VC Planner API Service
 * Handles all communication with the backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// ============================================
// CLASSES API
// ============================================
export const classesApi = {
  getAll: (productId) => api.get('/classes', { params: { productId } }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`)
};

// ============================================
// CHARACTERISTICS API
// ============================================
export const characteristicsApi = {
  getAll: (classId) => api.get('/characteristics', { params: { classId } }),
  create: (data) => api.post('/characteristics', data),
  update: (id, data) => api.put(`/characteristics/${id}`, data),
  delete: (id) => api.delete(`/characteristics/${id}`)
};

// ============================================
// REGIONS API
// ============================================
export const regionsApi = {
  getAll: () => api.get('/regions'),
  create: (data) => api.post('/regions', data),
  update: (id, data) => api.put(`/regions/${id}`, data),
  delete: (id) => api.delete(`/regions/${id}`)
};

// ============================================
// CONFIGURATION RULES API
// ============================================
export const configurationRulesApi = {
  getAll: (params) => api.get('/configuration-rules', { params }),
  getById: (id) => api.get(`/configuration-rules/${id}`),
  create: (data) => api.post('/configuration-rules', data),
  update: (id, data) => api.put(`/configuration-rules/${id}`, data),
  delete: (id) => api.delete(`/configuration-rules/${id}`),
  duplicate: (id) => api.post(`/configuration-rules/${id}/duplicate`)
};

// ============================================
// DEPENDENCY RULES API
// ============================================
export const dependencyRulesApi = {
  getAll: (params) => api.get('/dependency-rules', { params }),
  create: (data) => api.post('/dependency-rules', data),
  update: (id, data) => api.put(`/dependency-rules/${id}`, data),
  delete: (id) => api.delete(`/dependency-rules/${id}`)
};

// ============================================
// PROBABILITY API
// ============================================
export const probabilityApi = {
  calculate: (data) => api.post('/probability/calculate', data),
  getScenarios: () => api.get('/probability/scenarios'),
  saveScenario: (data) => api.post('/probability/scenarios', data),
  deleteScenario: (id) => api.delete(`/probability/scenarios/${id}`)
};

// ============================================
// VALIDATION API
// ============================================
export const validationApi = {
  validateConfiguration: (data) => api.post('/validate-configuration', data)
};

// ============================================
// EXPORT/IMPORT API
// ============================================
export const dataApi = {
  // Export
  exportSampleData: () => api.get('/export/sample-data'),
  exportSampleDataExcel: () => api.get('/export/sample-data/excel', { responseType: 'blob' }),
  exportAllData: () => api.get('/export/all-data'),
  exportAllDataExcel: () => api.get('/export/all-data/excel', { responseType: 'blob' }),
  
  // Import
  importData: (data, mode = 'merge') => api.post('/import/data', { data, mode }),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// ============================================
// VERSION API
// ============================================
export const versionsApi = {
  getAll: () => api.get('/versions'),
  create: (data) => api.post('/versions', data),
  restore: (id) => api.post(`/versions/${id}/restore`)
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadJson = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
};

export default api;
