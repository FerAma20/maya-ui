// Endpoints de Facturación Electrónica (FEL).
import { api } from './client.js';

export function listFelDocuments({ page = 0, size = 50 } = {}) {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return api.get(`/api/fel/documents?${q.toString()}`);
}
export const getFelDocument = (id) => api.get(`/api/fel/documents/${id}`);
// certify: body { saleId, dteType?, series? } → emite el DTE de una venta.
export const certifyFel = (data) => api.post('/api/fel/certify', data);
