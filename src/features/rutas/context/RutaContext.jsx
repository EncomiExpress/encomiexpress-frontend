import { createContext, useContext, useCallback, useState, useEffect } from 'react'
import {
  getRutas,
  getRutaById as getRutaByIdApi,
  createRuta,
  updateRuta,
  toggleHabilitadoRuta,
} from '../services/rutaService.js'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'

// CRUD de la plantilla reutilizable de corredor (Ruta): idDestino, observaciones,
// habilitado -- sin nombre propio, ver utils/rutaResolvers.js. Mismo patrón que DestinoContext.jsx — el arreglo
// `rutas` es una lista "completa" (limit alto) para Autocompletes/selectores de
// otras pantallas (ej. el paso "Elegir Ruta" del wizard de Salidas); las tablas
// paginadas (ListarRuta.jsx) mantienen su propio estado local, igual que
// ListarDestino.jsx (ver LOGICA.md, "Bug transversal — listas paginadas
// corrompidas por prefetch compartido").
const RutaContext = createContext()

export const useRuta = () => useContext(RutaContext)

export const RutaProvider = ({ children }) => {
  const { token } = useAuth()
  const [rutas, setRutas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRutas = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRutas(params, signal)
      setRutas(res?.data ?? [])
      setTotal(res?.total ?? (res?.data ?? []).length)
      return res?.data ?? []
    } catch (err) {
      if (err?.name === 'AbortError') return []
      setError(err.message || 'Error al cargar rutas')
      return []
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  // Carga inicial de todas las plantillas habilitadas -- mismo patrón que
  // DestinoContext.jsx: `rutas` acá funciona como catálogo completo para
  // Autocompletes (ej. el paso "Elegir Ruta" del wizard de Salidas), no como la
  // tabla paginada de ListarRuta.jsx (que trae su propia página directo del servicio).
  useEffect(() => {
    if (!token) return
    const abortController = new AbortController()
    fetchRutas(abortController.signal, { limit: 1000 })
    return () => abortController.abort()
  }, [token, fetchRutas])

  const getRutaByIdLocal = useCallback((id) => rutas.find(r => r.idRuta === parseInt(id)), [rutas])

  const getRutasHabilitadas = useCallback(() => rutas.filter(r => r.habilitado !== false), [rutas])

  const getRutaByIdRemoto = useCallback(async (id) => {
    const res = await getRutaByIdApi(id)
    return res?.data ?? null
  }, [])

  const registrarRuta = useCallback(async (datos) => {
    const res = await createRuta(datos)
    const creada = res?.data
    if (creada) setRutas(prev => [creada, ...prev])
    return creada
  }, [])

  const actualizarRuta = useCallback(async ({ idRuta, ...datos }) => {
    const res = await updateRuta(idRuta, datos)
    const actualizada = res?.data
    if (actualizada) setRutas(prev => prev.map(r => (r.idRuta === idRuta ? { ...r, ...actualizada } : r)))
    return { ruta: actualizada, message: res?.message }
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    const res = await toggleHabilitadoRuta(id)
    const actualizada = res?.data
    if (actualizada) setRutas(prev => prev.map(r => (r.idRuta === id ? { ...r, ...actualizada } : r)))
    return { ruta: actualizada, message: res?.message }
  }, [])

  return (
    <RutaContext.Provider value={{
      rutas,
      total,
      loading,
      error,
      fetchRutas,
      getRutaById: getRutaByIdLocal,
      getRutaByIdRemoto,
      getRutasHabilitadas,
      registrarRuta,
      actualizarRuta,
      toggleHabilitado,
    }}>
      {children}
    </RutaContext.Provider>
  )
}
