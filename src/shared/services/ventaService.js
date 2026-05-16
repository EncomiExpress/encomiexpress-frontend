import { fetchWithAuth } from './authService'

export const getEncomiendas = () =>
  fetchWithAuth('/encomiendas')

export const getEncomiendaById = (id) =>
  fetchWithAuth(`/encomiendas/${id}`)

export const createEncomienda = (datos) =>
  fetchWithAuth('/encomiendas', { method: 'POST', body: JSON.stringify(datos) })

export const updateEncomienda = (id, datos) =>
  fetchWithAuth(`/encomiendas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const toggleHabilitadoEncomienda = (id) =>
  fetchWithAuth(`/encomiendas/${id}/toggle-habilitado`, { method: 'PATCH' })

export const cambiarEstadoEncomienda = (id, estado) =>
  fetchWithAuth(`/encomiendas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })
