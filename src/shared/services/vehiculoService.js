import { fetchWithAuth } from './authService'

export const getVehiculos = () => fetchWithAuth('/vehiculos')
export const getVehiculoById = (id) => fetchWithAuth(`/vehiculos/${id}`)
export const createVehiculo = (datos) => fetchWithAuth('/vehiculos', { method: 'POST', body: JSON.stringify(datos) })
export const updateVehiculo = (id, datos) => fetchWithAuth(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const cambiarEstadoVehiculo = (id, estado) => fetchWithAuth(`/vehiculos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })
export const deleteVehiculo = (id) => fetchWithAuth(`/vehiculos/${id}`, { method: 'DELETE' })
export const toggleHabilitadoVehiculo = (id) => fetchWithAuth(`/vehiculos/${id}/toggle-habilitado`, { method: 'PATCH' })

export default { getVehiculos, getVehiculoById, createVehiculo, updateVehiculo, deleteVehiculo, toggleHabilitadoVehiculo }

