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

// Reactiva una venta "Cancelada" a "Programada" sin editar nada — solo cuando la
// ruta ya volvió a servir sola. Ver EstadoVentaCancelada.jsx / LOGICA.md.
export const reactivarEncomienda = (id) =>
  fetchWithAuth(`/encomiendas/${id}/reactivar`, { method: 'PATCH' })

export const cambiarEstadoPagoEncomienda = (id, estadoPago) =>
  fetchWithAuth(`/encomiendas/${id}/estado-pago`, { method: 'PATCH', body: JSON.stringify({ estadoPago }) })

export const getPageOfEncomienda = (id, limit = 10) =>
  fetchWithAuth(`/encomiendas/${id}/page-of?limit=${limit}`)

// { primerRegistro, ultimoRegistro } (YYYY-MM-DD) — límites reales para el filtro
// de período del Dashboard, calculados en la BD (MIN/MAX), no sobre datos ya cargados.
export const getRangoFechasVentas = () =>
  fetchWithAuth('/encomiendas/rango-fechas')

// Historial completo de la entrega final de un paquete (una fila por cada
// Intento/Entregado/Devuelto registrado por el distribuidor) — ver
// ModalHistorialEntrega.jsx y LOGICA.md, "Historial de entrega final".
export const getHistorialEntregaPaquete = (idPaquete) =>
  fetchWithAuth(`/paquetes/${idPaquete}/historial-entrega`)
