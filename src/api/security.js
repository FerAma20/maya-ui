// Endpoints de seguridad: roles y usuarios.
import { api } from './client.js';

// Roles
export const listRoles = () => api.get('/api/roles');
export const createRole = (data) => api.post('/api/roles', data);
export const updateRole = (id, data) => api.put(`/api/roles/${id}`, data);
export const deleteRole = (id) => api.del(`/api/roles/${id}`);

// Usuarios
export const listUsers = () => api.get('/api/users');
export const getUser = (id) => api.get(`/api/users/${id}`);
export const createUser = (data) => api.post('/api/users', data);
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.del(`/api/users/${id}`);
