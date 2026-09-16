import { fetchWithAuth } from '../../../shared/services/authService.js'

// Fase 4 de la migración Ruta/SalidaProgramada (ver LOGICA.md): `Ruta` quedó
// reducida a la PLANTILLA reutilizable de corredor (idDestino, observaciones,
// habilitado, sin nombre propio) — la agenda concreta (fecha/hora/estado/convoy/
// paradas) vive ahora en SalidaProgramada, expuesta por /salidas
// (src/features/salidas/services/salidaService.js). Este archivo solo cubre el
// CRUD de la plantilla, contra los 5 endpoints que sigue exponiendo /rutas en el
// backend (routes/rutas.js): GET /, GET /:id, POST /, PUT /:id,
// PATCH /:id/toggle-habilitado.

export const getRutas = (params = {}, signal) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/rutas${suffix}`, { signal })
}
export const getRutaById = (id) => fetchWithAuth(`/rutas/${id}`)
export const createRuta  = (datos) => fetchWithAuth('/rutas', { method: 'POST', body: JSON.stringify(datos) })
export const updateRuta  = (id, datos) => fetchWithAuth(`/rutas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const toggleHabilitadoRuta = (id) => fetchWithAuth(`/rutas/${id}/toggle-habilitado`, { method: 'PATCH' })

export default {
  getRutas, getRutaById, createRuta, updateRuta, toggleHabilitadoRuta,
}
