import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as anticipoService from '../services/anticipoService'
import { useAuth } from './AuthContext'
import { useConductor } from './ConductorContext'
import { useRutaProgramacion } from './RutaProgramacionContext'

const AnticipoExcedenteContext = createContext()

export const useAnticipos = () => useContext(AnticipoExcedenteContext)

export const AnticipoExcedenteProvider = ({ children }) => {
  const { token } = useAuth()
  const { conductores } = useConductor()
  const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()

  const [anticipos, setAnticipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar anticipos cuando hay token
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const abortController = new AbortController()
    const loadAnticipos = async () => {
      try {
        const res = await anticipoService.getAnticipos(abortController.signal)
        if (res?.data) {
          setAnticipos(res.data)
        }
      } catch (err) {
        if (err?.name !== 'AbortError' && err.status !== 403) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadAnticipos()
    return () => abortController.abort()
  }, [token])

  // Cargar rutas al montar siempre que haya token,
  // independientemente de si el array ya tiene datos en el contexto padre
  useEffect(() => {
    if (token) {
      fetchRutasProgramadas()
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Normalizar conductores para el selector: { idConductor, nombre }
  const conductoresNormalizados = conductores.map((c) => ({
    idConductor: c.idConductor,
    nombre:
      c.nombre && c.apellido
        ? `${c.nombre} ${c.apellido}`
        : c.nombre || `Conductor ${c.idConductor}`,
  }))

  // Normalizar rutas para el selector: { idRuta, nombre }
  const rutasNormalizadas = rutasProgramadas.map((r) => ({
    idRuta: r.idRuta,
    nombre: r.nombreRuta || r.nombre || `Ruta ${r.idRuta}`,
  }))

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const agregarAnticipo = useCallback(async (datos) => {
    const res = await anticipoService.createAnticipo(datos)
    const nuevo = res.data
    if (nuevo) setAnticipos((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const actualizarAnticipo = useCallback(async (datosActualizados) => {
    const id = datosActualizados.idAnticipoExcedente
    const res = await anticipoService.updateAnticipo(id, datosActualizados)
    const actualizado = res.data
    if (actualizado) {
      setAnticipos((prev) =>
        prev.map((a) => (a.idAnticipoExcedente === id ? actualizado : a))
      )
    }
    return actualizado
  }, [])

  const cambiarEstado = useCallback(async (id, nuevoEstado) => {
    await anticipoService.cambiarEstadoAnticipo(id, nuevoEstado)
    setAnticipos((prev) =>
      prev.map((a) =>
        a.idAnticipoExcedente === id ? { ...a, estado: nuevoEstado } : a
      )
    )
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    await anticipoService.toggleHabilitadoAnticipo(id)
    setAnticipos((prev) =>
      prev.map((a) =>
        a.idAnticipoExcedente === id ? { ...a, habilitado: !a.habilitado } : a
      )
    )
  }, [])

  return (
    <AnticipoExcedenteContext.Provider
      value={{
        anticipos,
        conductores: conductoresNormalizados,
        rutas: rutasNormalizadas,
        loading,
        error,
        agregarAnticipo,
        actualizarAnticipo,
        cambiarEstado,
        toggleHabilitado,
      }}
    >
      {children}
    </AnticipoExcedenteContext.Provider>
  )
}

export default AnticipoExcedenteProvider