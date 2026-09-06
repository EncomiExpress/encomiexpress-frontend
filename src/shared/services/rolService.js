import { fetchWithAuth } from './authService'

// signal opcional (segundo parámetro, no primero) para no romper a otros llamadores
// que ya llamaban esto solo con params.
export const getRoles = (params = {}, signal) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/roles${suffix}`, { signal })
}

export const getPermisos = () => fetchWithAuth('/roles/permisos')

export const createRol = (nombre, descripcion, permisos) =>
  fetchWithAuth('/roles', { method: 'POST', body: JSON.stringify({ nombre, descripcion, permisos }) })

export const updateRol = (id, nombre, descripcion, permisos, habilitado) =>
  fetchWithAuth(`/roles/${id}`, { method: 'PUT', body: JSON.stringify({ nombre, descripcion, permisos, habilitado }) })

export const toggleHabilitadoRol = (id) =>
  fetchWithAuth(`/roles/${id}/toggle-habilitado`, { method: 'PATCH' })
