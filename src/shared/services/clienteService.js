import { fetchWithAuth } from './authService'

export const getClientes = (signal) =>
  fetchWithAuth('/clientes', { method: 'GET', signal })

export const getClienteById = (id, signal) =>
  fetchWithAuth(`/clientes/${id}`, { method: 'GET', signal })

export const createCliente = (datos) =>
  fetchWithAuth('/clientes', { method: 'POST', body: JSON.stringify(datos) })

export const updateCliente = (id, datos) =>
  fetchWithAuth(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const toggleHabilitadoCliente = (id) =>
  fetchWithAuth(`/clientes/${id}/toggle-habilitado`, { method: 'PATCH' })

