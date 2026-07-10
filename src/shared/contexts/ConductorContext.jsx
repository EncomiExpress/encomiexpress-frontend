import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as conductorService from '../services/conductorService'
import { useAuth } from './AuthContext'

const ConductorContext = createContext()

export const useConductor = () => useContext(ConductorContext)

const normalizarConductor = (c) => ({
  ...c,
  nombre: c.usuario?.nombre || c.nombre || '',
  apellido: c.usuario?.apellido || c.apellido || '',
  telefono: c.usuario?.telefono || c.telefono || '',
  email: c.usuario?.email || c.email || '',
  tipoIdentificacion: c.usuario?.tipoIdentificacion || c.tipoIdentificacion || '',
  numeroIdentificacion: c.usuario?.numeroIdentificacion || c.numeroIdentificacion || '',
  licenciaConduccion: c.categoriaLicencia || '',
  numeroLicencia: c.numeroLicencia || '',
  fechaVencimientoLicencia: c.vencimientoLicencia || '',
})

export const ConductorProvider = ({ children }) => {
  const { token } = useAuth()
  const [conductores, setConductores] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConductores = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.getConductores(signal, params)
      if (response?.success) {
        setConductores(response.data.map(normalizarConductor))
        setTotal(response.total || response.data.length)
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
    fetchConductores(abortController.signal, { limit: 1000 })
    return () => abortController.abort()
  }, [fetchConductores, token])

  // ─── Lecturas locales ─────────────────────────────────────────────────────
  const getConductores = useCallback(() => conductores, [conductores])

  const getConductorById = useCallback(
    (id) => conductores.find(c => c.idConductor === parseInt(id)),
    [conductores]
  )

  const getConductoresHabilitados = useCallback(
    () => conductores.filter(c => c.habilitado),
    [conductores]
  )

  // ─── Obtener conductor individual desde API ───────────────────────────────
  const fetchConductorById = useCallback(async (id) => {
    try {
      const response = await conductorService.getConductorById(id)
      return response.data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  // ─── Registrar conductor ──────────────────────────────────────────────────
  const registrarConductor = useCallback(async (nuevoConductor) => {
    const payload = {
      tipoIdentificacion: nuevoConductor.tipoIdentificacion,
      numeroIdentificacion: nuevoConductor.numeroIdentificacion,
      nombre: nuevoConductor.nombre,
      apellido: nuevoConductor.apellido,
      telefono: nuevoConductor.telefono,
      email: nuevoConductor.email,
      password: nuevoConductor.password,
      categoriaLicencia: nuevoConductor.licenciaConduccion,
      numeroLicencia: nuevoConductor.numeroLicencia || null,
      vencimientoLicencia: nuevoConductor.fechaVencimientoLicencia,
    }
    const response = await conductorService.createConductor(payload)
    if (response.success) {
      setConductores(prev => [...prev, normalizarConductor(response.data)])
      return response.data
    }
    throw new Error(response.message || 'Error al registrar conductor')
  }, [])

  // ─── Actualizar conductor (recibe objeto completo) ────────────────────────
  const actualizarConductor = useCallback(async (conductorActualizado) => {
    const payload = {
      tipoIdentificacion: conductorActualizado.tipoIdentificacion,
      numeroIdentificacion: conductorActualizado.numeroIdentificacion,
      nombre: conductorActualizado.nombre,
      apellido: conductorActualizado.apellido,
      telefono: conductorActualizado.telefono,
      email: conductorActualizado.email,
      categoriaLicencia: conductorActualizado.licenciaConduccion,
      vencimientoLicencia: conductorActualizado.fechaVencimientoLicencia,
    }
    const response = await conductorService.updateConductor(conductorActualizado.idConductor, payload)
    if (response.success) {
      setConductores(prev => prev.map(c =>
        c.idConductor === conductorActualizado.idConductor ? normalizarConductor(response.data) : c
      ))
      return true
    }
    throw new Error(response.message || 'Error al actualizar conductor')
  }, [])

  // ─── Actualizar conductor (recibe id y datos separados — usado por ActualizarConductor.jsx) ──
  const actualizarConductorApi = useCallback(async (id, data) => {
    const response = await conductorService.updateConductor(id, data)
    if (response.success) {
      setConductores(prev => prev.map(c =>
        c.idConductor === id ? normalizarConductor(response.data) : c
      ))
      return response
    }
  }, [])

  // ─── Habilitar / Inhabilitar ──────────────────────────────────────────────
  const toggleHabilitado = useCallback(async (id) => {
    const response = await conductorService.toggleHabilitadoConductor(id)
    if (response.success) {
      setConductores(prev => prev.map(c =>
        c.idConductor === id ? { ...c, habilitado: response.data.habilitado } : c
      ))
      return true
    }
    throw new Error(response.message || 'Error al cambiar el estado')
  }, [])

  // ─── Cambiar estado operativo (Disponible / En Ruta) ─────────────────────
  const updateEstado = useCallback(async (id, nuevoEstado) => {
    const response = await conductorService.cambiarEstadoConductor(id, nuevoEstado)
    if (response.success) {
      setConductores(prev => prev.map(c =>
        c.idConductor === id ? { ...c, estado: response.data.estadoActual } : c
      ))
      return true
    }
    return false
  }, [])

  // ─── Eliminar conductor ───────────────────────────────────────────────────
  const eliminarConductor = useCallback(async (id) => {
    const response = await conductorService.deleteConductor(id)
    if (response.success) {
      setConductores(prev => prev.filter(c => c.idConductor !== id))
      return response
    }
  }, [])

  const value = {
    conductores,
    total,
    loading,
    error,
    getConductores,
    getConductorById,
    getConductoresHabilitados,
    registrarConductor,
    actualizarConductor,
    actualizarConductorApi,
    toggleHabilitado,
    updateEstado,
    eliminarConductor,
    fetchConductores,
    fetchConductorById,
  }

  return (
    <ConductorContext.Provider value={value}>
      {children}
    </ConductorContext.Provider>
  )
}
