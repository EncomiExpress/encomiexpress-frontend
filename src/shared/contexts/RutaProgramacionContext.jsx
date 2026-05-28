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
import { useTransporte } from './TransporteContext'

const RutaProgramacionContext = createContext()

export const useRutaProgramacion = () => useContext(RutaProgramacionContext)

export const RutaProgramacionProvider = ({ children }) => {
  const [rutasProgramadas, setRutasProgramadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const { destinos, fetchDestinos } = useDestino()
  const { getTransportes, fetchVehiculos } = useTransporte()
  const fetchingRef = useRef(false)

  // Pre-carga destinos y vehículos cuando existe token, para que los selectores
  // de RegistrarRuta / ActualizarRuta tengan datos sin depender del orden
  // de navegación del usuario.
  useEffect(() => {
    if (!token) return

    const ac = new AbortController()
    const load = async () => {
      if (fetchingRef.current) return
      fetchingRef.current = true
      try {
        if (destinos.length === 0) await fetchDestinos(ac.signal)
        if (getTransportes().length === 0) await fetchVehiculos(ac.signal)
      } finally {
        fetchingRef.current = false
      }
    }

    load()
    return () => ac.abort()
  }, [token, destinos.length, fetchDestinos, fetchVehiculos, getTransportes])

  // Obtener todas las rutas desde la API
  const fetchRutasProgramadas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRutas()
      const data = res?.data ?? []
      setRutasProgramadas(data)
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
    }
    return actualizada
  }, [])

  const value = {
    rutasProgramadas,
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