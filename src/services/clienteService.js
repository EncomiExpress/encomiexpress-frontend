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

export const getClientes = () =>
  fetchWithAuth('/clientes')

export const getClienteById = (id) =>
  fetchWithAuth(`/clientes/${id}`)

export const createCliente = (datos) =>
  fetchWithAuth('/clientes', { method: 'POST', body: JSON.stringify(datos) })

export const updateCliente = (id, datos) =>
  fetchWithAuth(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const toggleHabilitadoCliente = (id) =>
  fetchWithAuth(`/clientes/${id}/toggle-habilitado`, { method: 'PATCH' })
