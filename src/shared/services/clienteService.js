import { fetchWithAuth } from './authService'

export const getClientes = (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/clientes${suffix}`, { method: 'GET', signal })
}
export const createCliente = (datos) =>
  fetchWithAuth('/clientes', { method: 'POST', body: JSON.stringify(datos) })
export const updateCliente = (id, datos) =>
  fetchWithAuth(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const toggleHabilitadoCliente = (id) =>
  fetchWithAuth(`/clientes/${id}/toggle-habilitado`, { method: 'PATCH' })

export const getPageOfCliente = (id, limit = 10) =>
  fetchWithAuth(`/clientes/${id}/page-of?limit=${limit}`)

