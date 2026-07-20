// Endpoints de inventario: existencias, kardex y ajustes.
import { api } from './client.js';

export function listStock({ branchId, productId } = {}) {
  const q = new URLSearchParams();
  if (branchId) q.set('branchId', String(branchId));
  if (productId) q.set('productId', String(productId));
  const qs = q.toString();
  return api.get(`/api/stock${qs ? `?${qs}` : ''}`);
}

export function listMovements({ productId, page = 0, size = 50 } = {}) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (productId) q.set('productId', String(productId));
  return api.get(`/api/stock/movements?${q.toString()}`);
}

export const createAdjustment = (data) => api.post('/api/stock/adjustments', data);
