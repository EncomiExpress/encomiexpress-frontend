import { fetchWithAuth } from '../../../shared/services/authService.js'

export const getRutas = (params = {}, signal) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/rutas${suffix}`, { signal })
}
export const getRutaById     = (id)       => fetchWithAuth(`/rutas/${id}`)
export const createRuta      = (datos)    => fetchWithAuth('/rutas',     { method: 'POST',  body: JSON.stringify(datos) })
export const updateRuta      = (id, datos)=> fetchWithAuth(`/rutas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const updateEstadoRuta= (id, estado) => fetchWithAuth(`/rutas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })
export const toggleHabilitadoRuta = (id) => fetchWithAuth(`/rutas/${id}/toggle-habilitado`, { method: 'PATCH' })
export const getPageOfRuta = (id, limit = 10) => fetchWithAuth(`/rutas/${id}/page-of?limit=${limit}`)
export const getAniosDisponiblesRuta = () => fetchWithAuth('/rutas/anios-disponibles')

// idVehiculos/idConductores: arrays de ids. idRutaExcluir: opcional, para editar sin
// chocar contra la propia ruta. Usado por CalendarioDisponibilidad.jsx.
export const getDisponibilidadRuta = ({ idVehiculos = [], idConductores = [], idRutaExcluir } = {}) => {
  const qs = new URLSearchParams()
  if (idVehiculos.length) qs.set('idVehiculos', idVehiculos.join(','))
  if (idConductores.length) qs.set('idConductores', idConductores.join(','))
  if (idRutaExcluir) qs.set('idRutaExcluir', idRutaExcluir)
  return fetchWithAuth(`/rutas/disponibilidad?${qs.toString()}`)
}

export default { getRutas, getRutaById, createRuta, updateRuta, updateEstadoRuta, toggleHabilitadoRuta, getPageOfRuta, getAniosDisponiblesRuta, getDisponibilidadRuta }