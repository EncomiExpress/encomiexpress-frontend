import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as destinoService from '../services/destinoService'

const DestinoContext = createContext()

export const useDestino = () => useContext(DestinoContext)

export const DestinoProvider = ({ children }) => {
  const { token } = useAuth()
  const [destinos, setDestinos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDestinos = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await destinoService.getDestinos(signal, params)
      if (res?.success) {
        setDestinos(res.data)
        setTotal(res.total ?? res.data.length)
      } else {
        setError('Error al cargar destinos')
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        setError(e.message || 'Error al cargar destinos')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener destino por ID (desde el estado local)
  const getDestinoById = useCallback((id) => {
    return destinos.find(d => d.idDestino === parseInt(id))
  }, [destinos])

  // Obtener destinos habilitados (desde el estado local)
  const getDestinosHabilitados = useCallback(() => {
    return destinos.filter(d => d.habilitado)
  }, [destinos])

  // ⬇️ NUEVO: cargar destinos cuando haya token
  useEffect(() => {
    if (!token) return

    const abortController = new AbortController()
    fetchDestinos(abortController.signal)

    return () => abortController.abort()
  }, [token, fetchDestinos]);

  // Registrar destino vía API
  const registrarDestino = useCallback(async (nuevoDestino) => {
    const res = await destinoService.createDestino(nuevoDestino)
    if (res.success) {
      setDestinos(prev => [...prev, res.data])
      return res.data
    }
    throw new Error(res.message || 'Error al registrar el destino')
  }, [])

  // Actualizar destino vía API
  const actualizarDestino = useCallback(async (destinoActualizado) => {
    const { idDestino, ...datos } = destinoActualizado
    const res = await destinoService.updateDestino(idDestino, datos)
    if (res.success) {
      setDestinos(prev => prev.map(d => d.idDestino === idDestino ? res.data : d))
      return res.data
    }
    throw new Error(res.message || 'Error al actualizar el destino')
  }, [])

  // Habilitar/Inhabilitar destino vía API
  const toggleHabilitado = useCallback(async (id) => {
    const res = await destinoService.toggleHabilitadoDestino(id)
    if (res.success) {
      setDestinos(prev => prev.map(d => d.idDestino === id ? res.data : d))
      return res.data
    }
    throw new Error(res.message || 'Error al cambiar el estado del destino')
  }, [])

  const value = {
    destinos,
    total,
    loading,
    error,
    fetchDestinos,
    getDestinoById,
    getDestinosHabilitados,
    registrarDestino,
    actualizarDestino,
    toggleHabilitado,
  }

  return (
    <DestinoContext.Provider value={value}>
      {children}
    </DestinoContext.Provider>
  )
}