import { fetchWithAuth } from './authService'

export const getDestinos = (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/destinos${suffix}`, { method: 'GET', signal })
}
export const getDestinoById = (id, signal) => fetchWithAuth(`/destinos/${id}`, { method: 'GET', signal })
export const createDestino = (datos) => fetchWithAuth('/destinos', { method: 'POST', body: JSON.stringify(datos) })
export const updateDestino = (id, datos) => fetchWithAuth(`/destinos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const deleteDestino = (id) => fetchWithAuth(`/destinos/${id}`, { method: 'DELETE' })
export const toggleHabilitadoDestino = (id) => fetchWithAuth(`/destinos/${id}/toggle-habilitado`, { method: 'PATCH' })
export const getPageOfDestino = (id, limit = 10) => fetchWithAuth(`/destinos/${id}/page-of?limit=${limit}`)

export default { getDestinos, getDestinoById, createDestino, updateDestino, deleteDestino, toggleHabilitadoDestino }

