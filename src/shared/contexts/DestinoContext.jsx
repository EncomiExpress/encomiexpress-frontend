import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as destinoService from '../services/destinoService'

const DestinoContext = createContext()

export const useDestino = () => useContext(DestinoContext)

export const DestinoProvider = ({ children }) => {
  const { token } = useAuth()
  const [destinos, setDestinos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar todos los destinos desde la API
  const fetchDestinos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await destinoService.getDestinos()
      if (res.success) {
        setDestinos(res.data)
      } else {
        setError('Error al cargar destinos')
      }
    } catch (e) {
      setError(e.message || 'Error al cargar destinos')
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