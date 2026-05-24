import { fetchWithAuth } from './authService'

export const getDestinos = () => fetchWithAuth('/destinos')
export const getDestinoById = (id) => fetchWithAuth(`/destinos/${id}`)
export const createDestino = (datos) => fetchWithAuth('/destinos', { method: 'POST', body: JSON.stringify(datos) })
export const updateDestino = (id, datos) => fetchWithAuth(`/destinos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const deleteDestino = (id) => fetchWithAuth(`/destinos/${id}`, { method: 'DELETE' })
export const toggleHabilitadoDestino = (id) => fetchWithAuth(`/destinos/${id}/toggle-habilitado`, { method: 'PATCH' })

export default { getDestinos, getDestinoById, createDestino, updateDestino, deleteDestino, toggleHabilitadoDestino }

