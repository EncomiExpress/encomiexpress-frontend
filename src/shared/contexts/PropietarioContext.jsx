import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as propietarioService from '../services/propietarioService'
import { useAuth } from './AuthContext'

const PropietarioContext = createContext()

export const usePropietario = () => useContext(PropietarioContext)

export const PropietarioProvider = ({ children }) => {
  const { token } = useAuth()
  const [propietarios, setPropietarios] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPropietarios = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.getPropietarios(signal, params)
      if (response?.success) {
        setPropietarios(response.data)
        setTotal(response.total ?? response.data.length)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    const abortController = new AbortController()
    fetchPropietarios(abortController.signal)
    return () => abortController.abort()
  }, [fetchPropietarios, token])

  // Re-fetch cuando un vehículo cambia de propietario
  useEffect(() => {
    const handler = () => fetchPropietarios()
    window.addEventListener('vehiculo:toggled', handler)
    return () => window.removeEventListener('vehiculo:toggled', handler)
  }, [fetchPropietarios])

  // ─── Lecturas locales ─────────────────────────────────────────────────────
  const getPropietarios = useCallback(() => propietarios, [propietarios])

  const getPropietarioById = useCallback(
    (id) => propietarios.find(p => p.idPropietario === parseInt(id)),
    [propietarios]
  )

  const getPropietariosHabilitados = useCallback(
    () => propietarios.filter(p => p.habilitado),
    [propietarios]
  )

  // ─── Obtener propietario individual desde API ─────────────────────────────
  const fetchPropietarioById = useCallback(async (id) => {
    try {
      const response = await propietarioService.getPropietarioById(id)
      return response.data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  // ─── Registrar propietario ────────────────────────────────────────────────
  const registrarPropietario = useCallback(async (data) => {
    const response = await propietarioService.createPropietario(data)
    if (response.success) {
      setPropietarios(prev => [...prev, response.data])
      setTotal(prev => prev + 1)
      return response.data
    }
    throw new Error(response.message || 'Error al registrar propietario')
  }, [])

  // ─── Actualizar propietario ───────────────────────────────────────────────
  const actualizarPropietario = useCallback(async (data) => {
    const { idPropietario, ...payload } = data
    const response = await propietarioService.updatePropietario(idPropietario, payload)
    if (response.success) {
      setPropietarios(prev => prev.map(p => p.idPropietario === idPropietario ? response.data : p))
      return true
    }
    throw new Error(response.message || 'Error al actualizar propietario')
  }, [])

  // ─── Habilitar / Inhabilitar ──────────────────────────────────────────────
  const toggleHabilitado = useCallback(async (id) => {
    const res = await propietarioService.toggleHabilitadoPropietario(id)
    if (res.success) {
      setPropietarios(prev => prev.map(p => p.idPropietario === id ? res.data : p))
      return true
    }
    throw new Error(res.message || 'Error al cambiar el estado')
  }, [])

  const value = {
    propietarios,
    total,
    loading,
    error,
    getPropietarios,
    getPropietarioById,
    getPropietariosHabilitados,
    fetchPropietarios,
    fetchPropietarioById,
    registrarPropietario,
    actualizarPropietario,
    toggleHabilitado,
  }

  return (
    <PropietarioContext.Provider value={value}>
      {children}
    </PropietarioContext.Provider>
  )
}
