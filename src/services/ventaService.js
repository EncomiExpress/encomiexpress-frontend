import { API_URL } from '../config/api'
import { getToken } from './authService'

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Error en la petición')
  return data
}

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
  fetchWithAuth(`/encomiendas/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado }) })
