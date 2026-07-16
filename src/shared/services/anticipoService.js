import { fetchWithAuth } from './authService'

export const getAnticipos = (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/anticipos${suffix}`, { method: 'GET', signal })
}

export const createAnticipo = (datos) =>
  fetchWithAuth('/anticipos', { method: 'POST', body: JSON.stringify(datos) })

export const updateAnticipo = (id, datos) =>
  fetchWithAuth(`/anticipos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const cambiarEstadoAnticipo = (id, estado) =>
  fetchWithAuth(`/anticipos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })

export const entregarExcedenteAnticipo = (id, soporte) =>
  fetchWithAuth(`/anticipos/${id}/entregar-excedente`, { method: 'PATCH', body: JSON.stringify({ soporte }) })

export const toggleHabilitadoAnticipo = (id) =>
  fetchWithAuth(`/anticipos/${id}/toggle-habilitado`, { method: 'PATCH' })

export const getPageOfAnticipo = (id, limit = 10) =>
  fetchWithAuth(`/anticipos/${id}/page-of?limit=${limit}`)

export const getAniosDisponiblesAnticipo = () =>
  fetchWithAuth('/anticipos/anios-disponibles')