import { fetchWithAuth } from '../../../shared/services/authService.js'
import { getEncomiendas } from '../../../shared/services/encomiendaConsultaService.js'

// ── Encomiendas / Ventas ──────────────────────────────────────────────────────

export { getEncomiendas }

export const createEncomienda = (datos) =>
  fetchWithAuth('/encomiendas', { method: 'POST', body: JSON.stringify(datos) })

export const updateEncomienda = (id, datos) =>
  fetchWithAuth(`/encomiendas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const toggleHabilitadoEncomienda = (id) =>
  fetchWithAuth(`/encomiendas/${id}/toggle-habilitado`, { method: 'PATCH' })

export const cambiarEstadoEncomienda = (id, estado) =>
  fetchWithAuth(`/encomiendas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })

export const cambiarEstadoPagoEncomienda = (id, estadoPago) =>
  fetchWithAuth(`/encomiendas/${id}/estado-pago`, { method: 'PATCH', body: JSON.stringify({ estadoPago }) })

export const getPageOfEncomienda = (id, limit = 10) =>
  fetchWithAuth(`/encomiendas/${id}/page-of?limit=${limit}`)

// { primerRegistro, ultimoRegistro } (YYYY-MM-DD) — límites reales para el filtro
// de período del Dashboard, calculados en la BD (MIN/MAX), no sobre datos ya cargados.
export const getRangoFechasVentas = () =>
  fetchWithAuth('/encomiendas/rango-fechas')