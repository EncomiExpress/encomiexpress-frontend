import { fetchWithAuth } from '../../../shared/services/authService.js'

// signal opcional (segundo parámetro, no primero) para no romper a los llamadores que
// ya existían pasando solo params (useDuplicadoConductor.js, useDuplicadoUsuario.js).
export const getUsuarios = (params = {}, signal) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/usuarios${suffix}`, { signal })
}
export const createUsuario = (datos) => fetchWithAuth('/usuarios', { method: 'POST', body: JSON.stringify(datos) })
export const updateUsuario = (id, datos) => fetchWithAuth(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const toggleHabilitadoUsuario = (id) => fetchWithAuth(`/usuarios/${id}/toggle-habilitado`, { method: 'PATCH' })

export default { getUsuarios, createUsuario, updateUsuario, toggleHabilitadoUsuario }

