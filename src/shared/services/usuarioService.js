import { fetchWithAuth } from './authService'

export const getUsuarios = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/usuarios${suffix}`)
}
export const createUsuario = (datos) => fetchWithAuth('/usuarios', { method: 'POST', body: JSON.stringify(datos) })
export const updateUsuario = (id, datos) => fetchWithAuth(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const toggleHabilitadoUsuario = (id) => fetchWithAuth(`/usuarios/${id}/toggle-habilitado`, { method: 'PATCH' })
export const ignorarRegistroUsuario = (id) => fetchWithAuth(`/usuarios/${id}/ignorar-registro`, { method: 'PATCH' })

export default { getUsuarios, createUsuario, updateUsuario, toggleHabilitadoUsuario, ignorarRegistroUsuario }

