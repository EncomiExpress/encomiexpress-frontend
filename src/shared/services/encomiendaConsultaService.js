import { fetchWithAuth } from './authService.js'

// Consulta de solo lectura de encomiendas/ventas, usada por features que necesitan
// verificar dependencias activas de otra entidad (p. ej. clientes, al inhabilitar,
// necesita saber si tiene ventas activas) sin importar directamente el service
// interno de features/ventas.
export const getEncomiendas = (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/encomiendas${suffix}`, { method: 'GET', signal })
}
