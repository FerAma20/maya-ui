// Endpoints de la estructura organizativa: empresa, establecimientos, sucursales.
import { api } from './client.js';

// Empresa (inquilino actual)
export const getCompany = () => api.get('/api/company');
export const updateCompany = (data) => api.put('/api/company', data);

// Establecimientos SAT
export const listEstablishments = () => api.get('/api/establishments');
export const createEstablishment = (data) => api.post('/api/establishments', data);
export const updateEstablishment = (id, data) => api.put(`/api/establishments/${id}`, data);
export const deleteEstablishment = (id) => api.del(`/api/establishments/${id}`);

// Sucursales
export const listBranches = () => api.get('/api/branches');
export const createBranch = (data) => api.post('/api/branches', data);
export const updateBranch = (id, data) => api.put(`/api/branches/${id}`, data);
export const deleteBranch = (id) => api.del(`/api/branches/${id}`);
