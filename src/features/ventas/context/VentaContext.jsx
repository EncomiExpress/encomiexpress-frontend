import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as ventaService from '../services/ventaService'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'

const VentaContext = createContext()

export const useVentas = () => useContext(VentaContext)

export const ESTADOS_ENCOMIENDA = [
  'Programada',
  'En Ruta',
  'Entregada',
  'Completada con novedades',
  'Cancelada',
]

export const MODALIDADES_RECAUDO = ['Pago Inmediato', 'Contraentrega']

// Rollup derivado de EncomiendaVenta.estadoPago (lo calcula el backend,
// paqueteStateUtils.determinarEstadoPago) — 'Pendiente' es el genérico "en
// curso" (solo ocurre en Contraentrega mientras algún paquete no tiene el pago
// definido); 'Pagada'/'Pago parcial'/'Sin pago' son los 3 desenlaces terminales.
export const ESTADOS_PAGO = ['Pendiente', 'Pagada', 'Pago parcial', 'Sin pago']

// El backend devuelve destinatario como objeto singular (1:1) y paquetes[] (1:N) —
// paquete queda como atajo al primero para las vistas que aún no muestran la lista completa.
// Exportada porque ListarVenta.jsx también la necesita para su propio fetch paginado
// (ver comentario en ese archivo sobre por qué ya no comparte fetchVentas/ventas de acá).
export const normalize = (e) => ({
  ...e,
  destinatario: e.destinatario || null,
  paquete: e.paquetes?.[0] || null,
})

export const VentaProvider = ({ children }) => {
  const { token } = useAuth()
  const [ventas, setVentas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVentas = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await ventaService.getEncomiendas(signal, params)
      if (res?.success) {
        setVentas((res.data ?? []).map(normalize))
        setTotal(res.total ?? 0)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    const abortController = new AbortController()
    fetchVentas(abortController.signal)
    return () => abortController.abort()
  }, [token, fetchVentas])

  const agregarVenta = useCallback(async (datos) => {
    const res = await ventaService.createEncomienda(datos)
    const normalizada = normalize(res.data)
    setVentas(prev => [normalizada, ...prev])
    return normalizada
  }, [])

  const actualizarVenta = useCallback(async (id, datos) => {
    const res = await ventaService.updateEncomienda(id, datos)
    const normalizada = normalize(res.data)
    setVentas(prev => prev.map(v => v.idEncomiendaVenta === id ? normalizada : v))
    return normalizada
  }, [])

  const toggleHabilitadoVenta = useCallback(async (id) => {
    const res = await ventaService.toggleHabilitadoEncomienda(id)
    const normalizada = normalize(res.data)
    setVentas(prev => prev.map(v => v.idEncomiendaVenta === id ? normalizada : v))
    return { venta: normalizada, message: res?.message }
  }, [])

  // Reactiva una venta "Cancelada" a "Programada" sin editar nada — ver
  // EstadoVentaCancelada.jsx.
  const reactivarVenta = useCallback(async (id) => {
    const res = await ventaService.reactivarEncomienda(id)
    const normalizada = normalize(res.data)
    setVentas(prev => prev.map(v => v.idEncomiendaVenta === id ? normalizada : v))
    return normalizada
  }, [])

  return (
    <VentaContext.Provider value={{
      ventas, total, loading, error,
      fetchVentas,
      agregarVenta,
      actualizarVenta,
      toggleHabilitadoVenta,
      reactivarVenta,
      ESTADOS_ENCOMIENDA,
      MODALIDADES_RECAUDO,
      ESTADOS_PAGO,
    }}>
      {children}
    </VentaContext.Provider>
  )
}
