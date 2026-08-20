import { fetchWithAuth } from './authService'

export const getPaquetesDevueltos = (params = {}, signal) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchWithAuth(`/encomiendas/paquetes/devueltos${suffix}`, { signal })
}

export const getAniosDisponiblesPaquetesDevueltos = () =>
  fetchWithAuth('/encomiendas/paquetes/devueltos/anios-disponibles')

export default { getPaquetesDevueltos, getAniosDisponiblesPaquetesDevueltos }
