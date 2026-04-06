import { createContext, useContext, useState, useEffect } from 'react'
import * as ventaService from '../services/ventaService'

const VentaContext = createContext()

export const useVentas = () => useContext(VentaContext)

// Valores deben coincidir con lo que el backend almacena (lowercase)
export const ESTADOS_ENCOMIENDA = [
  'pendiente de recogida',
  'en recogida',
  'programada',
  'en tránsito',
  'entregado',
  'devuelto'
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
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ventaService.getEncomiendas()
      .then(res => setVentas(res.data.map(normalize)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const agregarVenta = async (datos) => {
    const res = await ventaService.createEncomienda(datos)
    const normalizada = normalize(res.data)
    setVentas(prev => [normalizada, ...prev])
    return normalizada
  }

  const actualizarVenta = async (id, datos) => {
    const res = await ventaService.updateEncomienda(id, datos)
    const normalizada = normalize(res.data)
    setVentas(prev => prev.map(v => v.idEncomiendaVenta === id ? normalizada : v))
    return normalizada
  }

  const cambiarEstadoVenta = async (id, nuevoEstado) => {
    await ventaService.cambiarEstadoEncomienda(id, nuevoEstado)
    setVentas(prev =>
      prev.map(v => v.idEncomiendaVenta === id ? { ...v, estado: nuevoEstado } : v)
    )
  }

  const invalidateVenta = async (id) => {
    const res = await ventaService.toggleHabilitadoEncomienda(id)
    const normalizada = normalize(res.data)
    setVentas(prev => prev.map(v => v.idEncomiendaVenta === id ? normalizada : v))
  }

  return (
    <VentaContext.Provider value={{
      ventas,
      loading,
      error,
      agregarVenta,
      actualizarVenta,
      cambiarEstadoVenta,
      invalidateVenta,
      ESTADOS_ENCOMIENDA,
      METODOS_PAGO,
      ESTADOS_PAGO
    }}>
      {children}
    </VentaContext.Provider>
  )
}

export default VentaContext
