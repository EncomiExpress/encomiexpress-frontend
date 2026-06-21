import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import {
  getRutas,
  getRutaById,
  createRuta,
  updateRuta,
  toggleHabilitadoRuta,
  updateEstadoRuta
} from '../services/rutaService'
import { useAuth } from './AuthContext'
import { useDestino } from './DestinoContext'
import { useVehiculo } from './VehiculoContext'

const RutaProgramacionContext = createContext()

export const useRutaProgramacion = () => useContext(RutaProgramacionContext)

export const RutaProgramacionProvider = ({ children }) => {
  const [rutasProgramadas, setRutasProgramadas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const { destinos, fetchDestinos } = useDestino()
  const { fetchVehiculos } = useVehiculo()
  const fetchingRef = useRef(false)

  const fetchRutasProgramadas = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRutas(params)
      const data = res?.data ?? []
      setRutasProgramadas(data)
      setTotal(res?.total ?? data.length)
      return data
    } catch (err) {
      setError(err.message || 'Error al cargar rutas')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener ruta por ID desde la API
  const getRutaProgramadaById = useCallback(async (id) => {
    try {
      const res = await getRutaById(id)
      return res?.data ?? null
    } catch (err) {
      throw err
    }
  }, [])

  // Registrar ruta en la API
  const registrarRutaProgramada = useCallback(async (nuevaRuta) => {
    const res = await createRuta(nuevaRuta)
    const creada = res?.data
    if (creada) {
      setRutasProgramadas(prev => [creada, ...prev])
    }
    return creada
  }, [])

  // Actualizar ruta en la API
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

  // Habilitar/Inhabilitar ruta
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

  // Cambiar estado de la ruta
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

  const value = {
    rutasProgramadas,
    total,
    loading,
    error,
    fetchRutasProgramadas,
    getRutaProgramadaById,
    registrarRutaProgramada,
    actualizarRutaProgramada,
    toggleHabilitado,
    updateEstado
  }

  return (
    <RutaProgramacionContext.Provider value={value}>
      {children}
    </RutaProgramacionContext.Provider>
  )
}