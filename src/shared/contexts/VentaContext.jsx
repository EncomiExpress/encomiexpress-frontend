import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as ventaService from '../services/ventaService'
import { useAuth } from './AuthContext'

const VentaContext = createContext()

export const useVentas = () => useContext(VentaContext)

export const ESTADOS_ENCOMIENDA = [
  'Programada',
  'En Tránsito',
  'Entregada',
  'Cancelada',
]

export const METODOS_PAGO = ['Contraentrega', 'Efectivo', 'Transferencia', 'Nequi']

export const ESTADOS_PAGO = ['Pendiente', 'Pagado']

// El backend devuelve destinatarios[] y paquetes[] — tomamos el primero de cada uno
const normalize = (e) => ({
  ...e,
  destinatario: e.destinatarios?.[0] || null,
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

  const cambiarEstadoVenta = useCallback(async (id, nuevoEstado) => {
    await ventaService.cambiarEstadoEncomienda(id, nuevoEstado)
    setVentas(prev =>
      prev.map(v => v.idEncomiendaVenta === id ? { ...v, estado: nuevoEstado } : v)
    )
  }, [])

  const cambiarEstadoPagoVenta = useCallback(async (id, nuevoEstadoPago) => {
    await ventaService.cambiarEstadoPagoEncomienda(id, nuevoEstadoPago)
    setVentas(prev =>
      prev.map(v => v.idEncomiendaVenta === id ? { ...v, estadoPago: nuevoEstadoPago } : v)
    )
  }, [])

  const toggleHabilitadoVenta = useCallback(async (id) => {
    const res = await ventaService.toggleHabilitadoEncomienda(id)
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
      cambiarEstadoVenta,
      cambiarEstadoPagoVenta,
      toggleHabilitadoVenta,
      ESTADOS_ENCOMIENDA,
      METODOS_PAGO,
      ESTADOS_PAGO,
    }}>
      {children}
    </VentaContext.Provider>
  )
}
