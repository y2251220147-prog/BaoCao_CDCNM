import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// ── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions    = (params)     => api.get('/transactions', { params });
export const getTransaction     = (id)         => api.get(`/transactions/${id}`);
export const createTransaction  = (data)       => api.post('/transactions', data);
export const updateTransaction  = (id, data)   => api.put(`/transactions/${id}`, data);
export const deleteTransaction  = (id)         => api.delete(`/transactions/${id}`);
export const getSummary         = (params)     => api.get('/transactions/summary', { params });

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories      = ()           => api.get('/categories');
export const createCategory     = (data)       => api.post('/categories', data);
export const deleteCategory     = (id)         => api.delete(`/categories/${id}`);

// ── Budgets ───────────────────────────────────────────────────────────────────
export const getBudgets         = (params)     => api.get('/budgets', { params });
export const upsertBudget       = (data)       => api.post('/budgets', data);
export const deleteBudget       = (id)         => api.delete(`/budgets/${id}`);

// ── Challenges ────────────────────────────────────────────────────────────────
export const getChallenges      = (params)     => api.get('/challenges', { params });
export const getChallenge       = (id)         => api.get(`/challenges/${id}`);
export const createChallenge    = (data)       => api.post('/challenges', data);
export const updateChallenge    = (id, data)   => api.put(`/challenges/${id}`, data);
export const deleteChallenge    = (id)         => api.delete(`/challenges/${id}`);
export const contributeChallenge = (id, data)  => api.post(`/challenges/${id}/contribute`, data);

// ── Mood ──────────────────────────────────────────────────────────────────────
export const getMoodStats       = (params)     => api.get('/mood/stats', { params });

// ── Health-check ──────────────────────────────────────────────────────────────
export const checkHealth        = ()           => api.get('/health');

export default api;
