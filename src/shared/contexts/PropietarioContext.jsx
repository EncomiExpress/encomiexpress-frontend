import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as propietarioService from '../services/propietarioService'
import { useAuth } from './AuthContext'

const PropietarioContext = createContext()

export const usePropietario = () => useContext(PropietarioContext)

export const PropietarioProvider = ({ children }) => {
  const auth = useAuth() || {}
  const token = auth?.token || null
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Fetch todos los propietarios desde la API ─────────────────────────────
  const fetchPropietarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.getPropietarios()
      if (response.success) {
        setPropietarios(response.data)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching propietarios:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch propietario individual ──────────────────────────────────────────
  const fetchPropietarioById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.getPropietarioById(id)
      return response.data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching propietario:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Registrar propietario ─────────────────────────────────────────────────
  const registrarPropietario = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.createPropietario(data)
      if (response.success) {
        await fetchPropietarios()
        return response.data
      }
      throw new Error(response.message || 'Error al registrar propietario')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchPropietarios])

  // ── Actualizar propietario ────────────────────────────────────────────────
  const actualizarPropietario = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const { idPropietario, ...payload } = data
      const response = await propietarioService.updatePropietario(idPropietario, payload)
      if (response.success) {
        await fetchPropietarios()
        return true
      }
      throw new Error(response.message || 'Error al actualizar propietario')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchPropietarios])

  // ── Toggle habilitado / inhabilitado ──────────────────────────────────────
  const toggleHabilitado = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await propietarioService.toggleHabilitadoPropietario(id)
      if (res.success) {
        await fetchPropietarios()
        return true
      }
      return false
    } catch (err) {
      setError(err.message)
      console.error('Error toggling propietario:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchPropietarios])

  // ── Selectores ────────────────────────────────────────────────────────────
  const getPropietarios = useCallback(() => propietarios, [propietarios])

  const getPropietarioById = useCallback(
    (id) => propietarios.find(p => p.idPropietario === parseInt(id)),
    [propietarios]
  )

  const getPropietariosHabilitados = useCallback(
    () => propietarios.filter(p => p.habilitado),
    [propietarios]
  )

  // ── Efectos ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      fetchPropietarios()
    }
  }, [fetchPropietarios, token])

  // Re-fetch cuando un vehículo cambia de estado (puede afectar el toggle)
  useEffect(() => {
    const handler = () => fetchPropietarios()
    window.addEventListener('vehiculo:toggled', handler)
    return () => window.removeEventListener('vehiculo:toggled', handler)
  }, [fetchPropietarios])

  const value = {
    propietarios,
    loading,
    error,
    // Selectores
    getPropietarios,
    getPropietarioById,
    getPropietariosHabilitados,
    // Operaciones CRUD
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