import { fetchWithAuth } from './authService'

export const getRutas        = ()         => fetchWithAuth('/rutas')
export const getRutaById     = (id)       => fetchWithAuth(`/rutas/${id}`)
export const createRuta      = (datos)    => fetchWithAuth('/rutas',     { method: 'POST',  body: JSON.stringify(datos) })
export const updateRuta      = (id, datos)=> fetchWithAuth(`/rutas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const updateEstadoRuta= (id, estado) => fetchWithAuth(`/rutas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })
export const toggleHabilitadoRuta = (id) => fetchWithAuth(`/rutas/${id}/toggle-habilitado`, { method: 'PATCH' })

export default { getRutas, getRutaById, createRuta, updateRuta, updateEstadoRuta, toggleHabilitadoRuta }