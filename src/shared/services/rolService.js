import { fetchWithAuth } from './authService'

export const getRoles = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/roles${suffix}`)
}

export const getPermisos = () => fetchWithAuth('/roles/permisos')

export const createRol = (nombre, descripcion, permisos) =>
  fetchWithAuth('/roles', { method: 'POST', body: JSON.stringify({ nombre, descripcion, permisos }) })

export const updateRol = (id, nombre, descripcion, permisos, habilitado) =>
  fetchWithAuth(`/roles/${id}`, { method: 'PUT', body: JSON.stringify({ nombre, descripcion, permisos, habilitado }) })

export const toggleHabilitadoRol = (id) =>
  fetchWithAuth(`/roles/${id}/toggle-habilitado`, { method: 'PATCH' })

export const deleteRol = (id) =>
  fetchWithAuth(`/roles/${id}`, { method: 'DELETE' })
