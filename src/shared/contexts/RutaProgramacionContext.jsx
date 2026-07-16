import { createContext, useContext, useState, useCallback } from 'react'
import {
  getRutas,
  getRutaById,
  createRuta,
  updateRuta,
  toggleHabilitadoRuta,
  updateEstadoRuta
} from '../services/rutaService'
import { useVehiculo } from './VehiculoContext'

const RutaProgramacionContext = createContext()

export const useRutaProgramacion = () => useContext(RutaProgramacionContext)

export const RutaProgramacionProvider = ({ children }) => {
  const [rutasProgramadas, setRutasProgramadas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { fetchVehiculos } = useVehiculo()

  const fetchRutasProgramadas = useCallback(async (params = {}, signal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRutas(params, signal)
      const data = res?.data ?? []
      setRutasProgramadas(data)
      setTotal(res?.total ?? data.length)
      return data
    } catch (err) {
      if (err.name === 'AbortError') return []
      setError(err.message || 'Error al cargar rutas')
      return []
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const getRutaProgramadaById = useCallback(async (id) => {
    const res = await getRutaById(id)
    return res?.data ?? null
  }, [])

  const registrarRutaProgramada = useCallback(async (nuevaRuta) => {
    const res = await createRuta(nuevaRuta)
    const creada = res?.data
    if (creada) {
      setRutasProgramadas(prev => [creada, ...prev])
    }
    return creada
  }, [])

  const actualizarRutaProgramada = useCallback(async (rutaActualizada) => {
    const { idRuta, ...datos } = rutaActualizada
    const id = idRuta ?? rutaActualizada.idRutaProgramada
    const res = await updateRuta(id, datos)
    const actualizada = res?.data
    if (actualizada) {
      setRutasProgramadas(prev =>
        prev.map(r => (r.idRuta === id ? { ...r, ...actualizada } : r))
      )
    }
    return actualizada
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    const res = await toggleHabilitadoRuta(id)
    const actualizada = res?.data
    if (actualizada) {
      setRutasProgramadas(prev =>
        prev.map(r => (r.idRuta === id ? { ...r, habilitado: actualizada.habilitado } : r))
      )
    }
    return actualizada
  }, [])

  const updateEstado = useCallback(async (id, nuevoEstado) => {
    const res = await updateEstadoRuta(id, nuevoEstado)
    const actualizada = res?.data
    if (actualizada) {
      setRutasProgramadas(prev =>
        prev.map(r => (r.idRuta === id ? { ...r, estado: actualizada.estado } : r))
      )
      await fetchVehiculos()
    }
    return actualizada
  }, [fetchVehiculos])

  return (
    <RutaProgramacionContext.Provider value={{
      rutasProgramadas,
      total,
      loading,
      error,
      fetchRutasProgramadas,
      getRutaProgramadaById,
      registrarRutaProgramada,
      actualizarRutaProgramada,
      toggleHabilitado,
      updateEstado,
    }}>
      {children}
    </RutaProgramacionContext.Provider>
  )
}
