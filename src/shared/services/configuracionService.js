import { fetchWithAuth } from './authService'

export const getConfiguracion = (signal) => fetchWithAuth('/configuracion', { method: 'GET', signal })
export const updateConfiguracion = (datos) => fetchWithAuth('/configuracion', { method: 'PUT', body: JSON.stringify(datos) })

export default { getConfiguracion, updateConfiguracion }
