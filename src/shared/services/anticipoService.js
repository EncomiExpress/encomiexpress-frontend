import { fetchWithAuth } from './authService'

export const getAnticipos = (signal) =>
  fetchWithAuth('/anticipos', { method: 'GET', signal })

export const getAnticipoById = (id, signal) =>
  fetchWithAuth(`/anticipos/${id}`, { method: 'GET', signal })

export const createAnticipo = (datos) =>
  fetchWithAuth('/anticipos', { method: 'POST', body: JSON.stringify(datos) })

export const updateAnticipo = (id, datos) =>
  fetchWithAuth(`/anticipos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const cambiarEstadoAnticipo = (id, estado) =>
  fetchWithAuth(`/anticipos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })

export const toggleHabilitadoAnticipo = (id) =>
  fetchWithAuth(`/anticipos/${id}/toggle-habilitado`, { method: 'PATCH' })