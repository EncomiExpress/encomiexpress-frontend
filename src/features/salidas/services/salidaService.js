import { fetchWithAuth } from '../../../shared/services/authService.js'

// Agenda concreta de viajes (SalidaProgramada) — fecha/hora/estado/convoy sobre
// una plantilla de /rutas (ver src/features/rutas). Contrato confirmado contra
// encomiexpress-backend/src/routes/salidas.js y
// src/validators/salidasValidator.js:
//   POST/PUT body: idRuta (solo create, requerido), pares[]{idVehiculo,idConductor},
//   observaciones, fechaSalida, horaSalida, fechaLlegadaEstimada, horaLlegadaEstimada,
//   estado, idSalidaIda (opcional, solo create).

export const getSalidas = (params = {}, signal) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/salidas${suffix}`, { signal })
}
export const getSalidaById = (id) => fetchWithAuth(`/salidas/${id}`)
export const createSalida  = (datos) => fetchWithAuth('/salidas', { method: 'POST', body: JSON.stringify(datos) })
export const updateSalida  = (id, datos) => fetchWithAuth(`/salidas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
// `extra` queda como punto de extensión (hoy no se envía nada) — el backend solo
// necesita { estado }.
export const updateEstadoSalida = (id, estado, extra = {}) => fetchWithAuth(`/salidas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado, ...extra }) })
export const toggleHabilitadoSalida = (id) => fetchWithAuth(`/salidas/${id}/toggle-habilitado`, { method: 'PATCH' })
export const getPageOfSalida = (id, limit = 10) => fetchWithAuth(`/salidas/${id}/page-of?limit=${limit}`)
export const getAniosDisponiblesSalida = () => fetchWithAuth('/salidas/anios-disponibles')

// idVehiculos/idConductores: arrays de ids. idSalidaExcluir: opcional, para editar
// sin chocar contra la propia salida. Usado por CalendarioDisponibilidad.jsx.
export const getDisponibilidadSalida = ({ idVehiculos = [], idConductores = [], idSalidaExcluir } = {}) => {
  const qs = new URLSearchParams()
  if (idVehiculos.length) qs.set('idVehiculos', idVehiculos.join(','))
  if (idConductores.length) qs.set('idConductores', idConductores.join(','))
  if (idSalidaExcluir) qs.set('idSalidaExcluir', idSalidaExcluir)
  return fetchWithAuth(`/salidas/disponibilidad?${qs.toString()}`)
}

// operador_sede: dispara el regreso de su sede con solo fecha/hora de salida — el
// resto (convoy, origen, destino) lo arma el backend a partir de la ida.
export const crearRegresoDesdeSede = (idSalidaIda, { fechaSalida, horaSalida, fechaLlegadaEstimada, horaLlegadaEstimada }) =>
  fetchWithAuth(`/salidas/${idSalidaIda}/regreso-sede`, { method: 'POST', body: JSON.stringify({ fechaSalida, horaSalida, fechaLlegadaEstimada, horaLlegadaEstimada }) })

export default {
  getSalidas, getSalidaById, createSalida, updateSalida, updateEstadoSalida,
  toggleHabilitadoSalida, getPageOfSalida, getAniosDisponiblesSalida,
  getDisponibilidadSalida, crearRegresoDesdeSede,
}
