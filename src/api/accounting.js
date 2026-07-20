// Endpoints de contabilidad: plan de cuentas, períodos y pólizas.
import { api } from './client.js';

// Plan de cuentas
export const listAccounts = () => api.get('/api/accounts');
export const createAccount = (data) => api.post('/api/accounts', data);
export const updateAccount = (id, data) => api.put(`/api/accounts/${id}`, data);
export const deleteAccount = (id) => api.del(`/api/accounts/${id}`);

// Períodos contables
export const listPeriods = () => api.get('/api/accounting-periods');
export const createPeriod = (data) => api.post('/api/accounting-periods', data);
export const closePeriod = (id) => api.put(`/api/accounting-periods/${id}/close`);

// Pólizas
export function listJournalEntries({ page = 0, size = 50 } = {}) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return api.get(`/api/journal-entries?${q.toString()}`);
}
export const getJournalEntry = (id) => api.get(`/api/journal-entries/${id}`);
export const createJournalEntry = (data) => api.post('/api/journal-entries', data);
