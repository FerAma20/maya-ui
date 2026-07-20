// Cliente HTTP base del ERP. Centraliza la URL del backend, el header
// multi-empresa (X-Company-Id) y el manejo de errores.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Empresa (inquilino) activa. Por ahora se lee de localStorage con un
// valor por defecto; cuando exista login vendrá del token de sesión.
export function currentCompanyId() {
  return localStorage.getItem('companyId') || '1';
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Company-Id': currentCompanyId(),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail;
    try { detail = await res.json(); } catch { detail = null; }
    throw new ApiError(res.status, detail?.message || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
