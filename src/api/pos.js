// Endpoints del POS: cajas y ventas.
import { api } from './client.js';

// Cajas / turnos
export const listCashRegisters = (status) =>
  api.get(`/api/cash-registers${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const getCashRegister = (id) => api.get(`/api/cash-registers/${id}`);
export const openCashRegister = (data) => api.post('/api/cash-registers/open', data);
export const closeCashRegister = (id, data) => api.put(`/api/cash-registers/${id}/close`, data);

// Ventas
export function listSales({ page = 0, size = 50 } = {}) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return api.get(`/api/sales?${q.toString()}`);
}
export const getSale = (id) => api.get(`/api/sales/${id}`);
export const createSale = (data) => api.post('/api/sales', data);
