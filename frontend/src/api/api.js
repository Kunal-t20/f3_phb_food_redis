import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- AUTH ----
export const loginUser = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/register', data);

// ---- DONOR ----
export const donateFood = (data) => api.post('/donor/donate', data);
export const getDonorDonations = () => api.get('/donor/my-donations');
export const deleteDonation = (id) => api.delete(`/donor/food/${id}`);
export const markDelivered = (foodId) => api.post(`/donor/delivered/${foodId}`);

// ---- INSPECTOR ----
export const getInspectorPending = () => api.get('/inspector/pending');
export const getInspectorHistory = () => api.get('/inspector/history');
export const clearInspectorHistory = () => api.delete('/inspector/history/clear');
export const inspectFood = (foodId, data) => api.post(`/inspect/${foodId}`, data);

// ---- RECIPIENT ----
export const getAvailableFoods = (skip = 0, limit = 50) =>
  api.get('/recipient/foods', { params: { skip, limit } });
export const claimFood = (foodId) => api.post(`/claim/${foodId}`);
export const getRecipientClaims = () => api.get('/recipient/my-claims');
export const confirmReceived = (foodId) => api.post(`/recipient/received/${foodId}`);

// ---- ADMIN ----
export const getUsers = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const adminDeleteFood = (id) => api.delete(`/admin/food/${id}`);
export const getAdminDeliveries = () => api.get('/admin/deliveries');

export default api;
