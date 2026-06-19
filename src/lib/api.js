// Cliente HTTP minimalista para la API REST del ERP MAYA.
// Mientras el backend no esté disponible, los módulos siguen usando los mocks
// de src/data/mock.js. Para conectarlos al backend real, reemplaza el import
// `import * as MAYA from '../data/mock.js'` por hooks que llamen aquí.

const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  // ── Productos / Inventario ───────────────────────────────
  listProducts: (params = {}) =>
    request(`/products?${new URLSearchParams(params)}`),
  getProduct: (sku) => request(`/products/${encodeURIComponent(sku)}`),
  createProduct: (body) =>
    request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (sku, body) =>
    request(`/products/${encodeURIComponent(sku)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteProduct: (sku) =>
    request(`/products/${encodeURIComponent(sku)}`, { method: 'DELETE' }),

  adjustStock: (sku, body) =>
    request(`/products/${encodeURIComponent(sku)}/adjust`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // ── Categorías ───────────────────────────────────────────
  listCategories: () => request('/categories'),

  // ── Sucursales ───────────────────────────────────────────
  listBranches: () => request('/branches'),

  // ── Proveedores ──────────────────────────────────────────
  listSuppliers: () => request('/suppliers'),
  createSupplier: (body) =>
    request('/suppliers', { method: 'POST', body: JSON.stringify(body) }),

  // ── Ventas / Tickets ─────────────────────────────────────
  listSales: (params = {}) =>
    request(`/sales?${new URLSearchParams(params)}`),
  getSale: (id) => request(`/sales/${encodeURIComponent(id)}`),
  createSale: (body) =>
    request('/sales', { method: 'POST', body: JSON.stringify(body) }),
  refundSale: (id, body) =>
    request(`/sales/${encodeURIComponent(id)}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // ── Compras / Órdenes de compra ──────────────────────────
  listPurchases: (params = {}) =>
    request(`/purchases?${new URLSearchParams(params)}`),
  createPurchase: (body) =>
    request('/purchases', { method: 'POST', body: JSON.stringify(body) }),
  receivePurchase: (id, body) =>
    request(`/purchases/${encodeURIComponent(id)}/receive`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // ── Caja / Corte ─────────────────────────────────────────
  openCash: (body) =>
    request('/cash/open', { method: 'POST', body: JSON.stringify(body) }),
  closeCash: (id, body) =>
    request(`/cash/${id}/close`, { method: 'POST', body: JSON.stringify(body) }),

  // ── Reportes ─────────────────────────────────────────────
  reportSales: (params = {}) =>
    request(`/reports/sales?${new URLSearchParams(params)}`),
  reportPurchases: (params = {}) =>
    request(`/reports/purchases?${new URLSearchParams(params)}`),
  reportInventory: (params = {}) =>
    request(`/reports/inventory?${new URLSearchParams(params)}`),

  // ── Contabilidad ─────────────────────────────────────────
  listAccounts: (params = {}) =>
    request(`/accounting/accounts?${new URLSearchParams(params)}`),
  createAccount: (body) =>
    request('/accounting/accounts', { method: 'POST', body: JSON.stringify(body) }),
  listPeriods: () => request('/accounting/periods'),
  createPeriod: (body) =>
    request('/accounting/periods', { method: 'POST', body: JSON.stringify(body) }),
  listEntries: (params = {}) =>
    request(`/accounting/entries?${new URLSearchParams(params)}`),
  getEntry: (id) => request(`/accounting/entries/${id}`),
  createEntry: (body) =>
    request('/accounting/entries', { method: 'POST', body: JSON.stringify(body) }),
  reverseEntry: (id) =>
    request(`/accounting/entries/${id}/reverse`, { method: 'POST' }),
  getAccountLedger: (code, params = {}) =>
    request(`/accounting/ledger/${encodeURIComponent(code)}?${new URLSearchParams(params)}`),

  // ── Configuración ────────────────────────────────────────
  getConfig: () => request('/config'),
  updateConfig: (body) =>
    request('/config', { method: 'PUT', body: JSON.stringify(body) }),

  // ── Clientes / CxC ───────────────────────────────────────
  listClients: (params = {}) =>
    request(`/clients?${new URLSearchParams(params)}`),
  getClient: (id) => request(`/clients/${id}`),
  createClient: (body) =>
    request('/clients', { method: 'POST', body: JSON.stringify(body) }),
  updateClient: (id, body) =>
    request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  createClientPayment: (id, body) =>
    request(`/clients/${id}/payments`, { method: 'POST', body: JSON.stringify(body) }),

  // ── Usuarios / Auth ──────────────────────────────────────
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  listUsers: () => request('/users'),
};

export default api;
