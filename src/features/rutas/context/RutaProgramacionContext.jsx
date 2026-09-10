import { createContext, useContext, useState, useCallback } from 'react'
import {
  getRutas,
  getRutaById,
  createRuta,
  updateRuta,
  toggleHabilitadoRuta,
  updateEstadoRuta,
  crearRegresoDesdeSede
} from '../services/rutaService'
import { useVehiculo } from '../../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'

const RutaProgramacionContext = createContext()

export const useRutaProgramacion = () => useContext(RutaProgramacionContext)

export const RutaProgramacionProvider = ({ children }) => {
  const [rutasProgramadas, setRutasProgramadas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { fetchVehiculos } = useVehiculo()
  const { fetchConductores } = useConductor()

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
    // `message` viaja el aviso dinámico armado en rutaController.update (ventas
    // sincronizadas, reactivación automática a Programada) — antes se descartaba acá y
    // el toast siempre mostraba un texto fijo, sin importar qué hubiera pasado de verdad.
    return { ruta: actualizada, message: res?.message }
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    const res = await toggleHabilitadoRuta(id)
    const actualizada = res?.data
    if (actualizada) {
      setRutasProgramadas(prev =>
        // `estado` también puede cambiar acá ahora (rehabilitar una Programada con
        // fecha/hora vencida la deja Cancelada, ver rutaService.toggleHabilitado) — no
        // se mergea el objeto completo porque `data` es la fila cruda sin las
        // asociaciones (vehículo/conductor, etc.) que el resto de columnas necesita.
        prev.map(r => (r.idRuta === id ? { ...r, habilitado: actualizada.habilitado, estado: actualizada.estado } : r))
      )
    }
    return { ruta: actualizada, message: res?.message }
  }, [])

  // operador_sede: dispara el regreso de su sede (WS4, "Sedes remotas") —
  // solo fecha/hora de salida, el backend arma el resto a partir de la ida.
  const programarRegresoSede = useCallback(async (idRutaIda, datos) => {
    const res = await crearRegresoDesdeSede(idRutaIda, datos)
    const creada = res?.data
    if (creada) {
      setRutasProgramadas(prev => [creada, ...prev])
    }
    return creada
  }, [])

  const updateEstado = useCallback(async (id, nuevoEstado, extra = {}) => {
    const res = await updateEstadoRuta(id, nuevoEstado, extra)
    const actualizada = res?.data
    if (actualizada) {
      setRutasProgramadas(prev =>
        prev.map(r => (r.idRuta === id ? { ...r, estado: actualizada.estado } : r))
      )
      await Promise.all([fetchVehiculos(), fetchConductores()])
    }
    return actualizada
  }, [fetchVehiculos, fetchConductores])

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
      programarRegresoSede,
    }}>
      {children}
    </RutaProgramacionContext.Provider>
  )
}
