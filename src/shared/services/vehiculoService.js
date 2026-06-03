import { fetchWithAuth } from './authService'

export const getVehiculos = (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/vehiculos${suffix}`, { method: 'GET', signal })
}
export const getVehiculoById = (id, signal) => fetchWithAuth(`/vehiculos/${id}`, { method: 'GET', signal })
export const createVehiculo = (datos) => fetchWithAuth('/vehiculos', { method: 'POST', body: JSON.stringify(datos) })
export const updateVehiculo = (id, datos) => fetchWithAuth(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const cambiarEstadoVehiculo = (id, estado) => fetchWithAuth(`/vehiculos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })
export const deleteVehiculo = (id) => fetchWithAuth(`/vehiculos/${id}`, { method: 'DELETE' })
export const toggleHabilitadoVehiculo = (id) => fetchWithAuth(`/vehiculos/${id}/toggle-habilitado`, { method: 'PATCH' })

export default { getVehiculos, getVehiculoById, createVehiculo, updateVehiculo, deleteVehiculo, toggleHabilitadoVehiculo }

