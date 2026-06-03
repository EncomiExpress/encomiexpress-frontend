import { fetchWithAuth } from './authService'

// ── Encomiendas / Ventas ──────────────────────────────────────────────────────

export const getEncomiendas = (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/encomiendas${suffix}`, { method: 'GET', signal })
}

export const getEncomiendaById = (id, signal) =>
  fetchWithAuth(`/encomiendas/${id}`, { method: 'GET', signal })

export const createEncomienda = (datos) =>
  fetchWithAuth('/encomiendas', { method: 'POST', body: JSON.stringify(datos) })

export const updateEncomienda = (id, datos) =>
  fetchWithAuth(`/encomiendas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })

export const toggleHabilitadoEncomienda = (id) =>
  fetchWithAuth(`/encomiendas/${id}/toggle-habilitado`, { method: 'PATCH' })

export const cambiarEstadoEncomienda = (id, estado) =>
  fetchWithAuth(`/encomiendas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) })

// ── Rutas (para el selector de ruta en Registrar/Actualizar) ─────────────────

export const getRutas = () =>
  fetchWithAuth('/rutas')