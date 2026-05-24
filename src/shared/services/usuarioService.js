import { fetchWithAuth } from './authService'

export const getUsuarios = () => fetchWithAuth('/usuarios')
export const getUsuarioById = (id) => fetchWithAuth(`/usuarios/${id}`)
export const createUsuario = (datos) => fetchWithAuth('/usuarios', { method: 'POST', body: JSON.stringify(datos) })
export const updateUsuario = (id, datos) => fetchWithAuth(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const toggleHabilitadoUsuario = (id) => fetchWithAuth(`/usuarios/${id}/toggle-habilitado`, { method: 'PATCH' })

export default { getUsuarios, getUsuarioById, createUsuario, updateUsuario, toggleHabilitadoUsuario }

