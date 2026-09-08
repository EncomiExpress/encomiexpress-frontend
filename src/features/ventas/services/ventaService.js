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

// ── Paquetes — reparto local ──────────────────────────────────────────────────
// Solo admin. El paquete debe estar "En sede de destino" (ver LOGICA.md, "Paquetes
// — entrega en sede y reasignación local"). No hay un paqueteService.js aparte en
// el backend tampoco — esta acción vive junto al resto de Ventas.
export const asignarRepartidorLocal = (idPaquete, idConductor) =>
  fetchWithAuth(`/paquetes/${idPaquete}/repartidor-local`, { method: 'PATCH', body: JSON.stringify({ idConductor }) })