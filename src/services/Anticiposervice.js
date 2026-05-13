import { fetchWithAuth } from './authService'

export const getAnticipos = () =>
  fetchWithAuth('/anticipos')

export const getAnticipoById = (id) =>
  fetchWithAuth(`/anticipos/${id}`)

export const createAnticipo = (datos) =>
  fetchWithAuth('/anticipos', { method: 'POST', body: JSON.stringify(datos) })

export const updateAnticipo = (id, datos) =>
  fetchWithAuth(`/anticipos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const cambiarEstadoAnticipo = (id, estado) =>
  fetchWithAuth(`/anticipos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })

export const toggleHabilitadoAnticipo = (id) =>
  fetchWithAuth(`/anticipos/${id}/toggle-habilitado`, { method: 'PATCH' })