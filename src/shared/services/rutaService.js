import { fetchWithAuth } from './authService'

export const getRutas = (params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/rutas${suffix}`)
}
export const getRutaById     = (id)       => fetchWithAuth(`/rutas/${id}`)
export const createRuta      = (datos)    => fetchWithAuth('/rutas',     { method: 'POST',  body: JSON.stringify(datos) })
export const updateRuta      = (id, datos)=> fetchWithAuth(`/rutas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const updateEstadoRuta= (id, estado) => fetchWithAuth(`/rutas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })
export const toggleHabilitadoRuta = (id) => fetchWithAuth(`/rutas/${id}/toggle-habilitado`, { method: 'PATCH' })
export const getPageOfRuta = (id, limit = 10) => fetchWithAuth(`/rutas/${id}/page-of?limit=${limit}`)

export default { getRutas, getRutaById, createRuta, updateRuta, updateEstadoRuta, toggleHabilitadoRuta, getPageOfRuta }