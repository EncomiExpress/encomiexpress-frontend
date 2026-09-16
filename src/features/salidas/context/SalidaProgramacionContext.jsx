import { createContext, useContext, useState, useCallback } from 'react'
import {
  getSalidas,
  getSalidaById,
  createSalida,
  updateSalida,
  toggleHabilitadoSalida,
  updateEstadoSalida,
  crearRegresoDesdeSede,
} from '../services/salidaService.js'
import { useVehiculo } from '../../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'

const SalidaProgramacionContext = createContext()

export const useSalidaProgramacion = () => useContext(SalidaProgramacionContext)

export const SalidaProgramacionProvider = ({ children }) => {
  const [salidasProgramadas, setSalidasProgramadas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { fetchVehiculos } = useVehiculo()
  const { fetchConductores } = useConductor()

  const fetchSalidasProgramadas = useCallback(async (params = {}, signal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSalidas(params, signal)
      const data = res?.data ?? []
      setSalidasProgramadas(data)
      setTotal(res?.total ?? data.length)
      return data
    } catch (err) {
      if (err.name === 'AbortError') return []
      setError(err.message || 'Error al cargar salidas')
      return []
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const getSalidaProgramadaById = useCallback(async (id) => {
    const res = await getSalidaById(id)
    return res?.data ?? null
  }, [])

  const registrarSalidaProgramada = useCallback(async (nuevaSalida) => {
    const res = await createSalida(nuevaSalida)
    const creada = res?.data
    if (creada) {
      setSalidasProgramadas(prev => [creada, ...prev])
    }
    return creada
  }, [])

  const actualizarSalidaProgramada = useCallback(async (salidaActualizada) => {
    const { idSalida, ...datos } = salidaActualizada
    const res = await updateSalida(idSalida, datos)
    const actualizada = res?.data
    if (actualizada) {
      setSalidasProgramadas(prev =>
        prev.map(s => (s.idSalida === idSalida ? { ...s, ...actualizada } : s))
      )
    }
    // `message` viaja el aviso dinámico armado en salidaProgramadaController.update
    // (ventas sincronizadas, reactivación automática a Programada).
    return { salida: actualizada, message: res?.message }
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    const res = await toggleHabilitadoSalida(id)
    const actualizada = res?.data
    if (actualizada) {
      setSalidasProgramadas(prev =>
        // `estado` también puede cambiar acá (rehabilitar una Programada con fecha/hora
        // vencida la deja Cancelada) — no se mergea el objeto completo porque `data` es
        // la fila cruda sin las asociaciones (vehículo/conductor, etc.).
        prev.map(s => (s.idSalida === id ? { ...s, habilitado: actualizada.habilitado, estado: actualizada.estado } : s))
      )
    }
    return { salida: actualizada, message: res?.message }
  }, [])

  // operador_sede: dispara el regreso de su sede (WS4, "Sedes remotas") — solo
  // fecha/hora de salida, el backend arma el resto a partir de la ida.
  const programarRegresoSede = useCallback(async (idSalidaIda, datos) => {
    const res = await crearRegresoDesdeSede(idSalidaIda, datos)
    const creada = res?.data
    if (creada) {
      setSalidasProgramadas(prev => [creada, ...prev])
    }
    return creada
  }, [])

  const updateEstado = useCallback(async (id, nuevoEstado, extra = {}) => {
    const res = await updateEstadoSalida(id, nuevoEstado, extra)
    const actualizada = res?.data
    if (actualizada) {
      setSalidasProgramadas(prev =>
        prev.map(s => (s.idSalida === id ? { ...s, estado: actualizada.estado } : s))
      )
      await Promise.all([fetchVehiculos(), fetchConductores()])
    }
    return actualizada
  }, [fetchVehiculos, fetchConductores])

  return (
    <SalidaProgramacionContext.Provider value={{
      salidasProgramadas,
      total,
      loading,
      error,
      fetchSalidasProgramadas,
      getSalidaProgramadaById,
      registrarSalidaProgramada,
      actualizarSalidaProgramada,
      toggleHabilitado,
      updateEstado,
      programarRegresoSede,
    }}>
      {children}
    </SalidaProgramacionContext.Provider>
  )
}
