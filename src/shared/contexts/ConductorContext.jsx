import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as conductorService from '../services/conductorService'
import { useAuth } from './AuthContext'

const ConductorContext = createContext()

export const useConductor = () => useContext(ConductorContext)

export const ConductorProvider = ({ children }) => {
  const { token } = useAuth()
  const [conductores, setConductores] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchConductores = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.getConductores(signal, params)
      if (response?.success) {
        const datos = response.data.map(c => ({
          ...c,
          nombre: c.usuario?.nombre || c.nombre || '',
          apellido: c.usuario?.apellido || c.apellido || '',
          telefono: c.usuario?.telefono || c.telefono || '',
          email: c.usuario?.email || c.email || '',
          tipoIdentificacion: c.usuario?.tipoIdentificacion || c.tipoIdentificacion || '',
          numeroIdentificacion: c.usuario?.numeroIdentificacion || c.numeroIdentificacion || '',
          licenciaConduccion: c.categoriaLicencia || '',
          fechaVencimientoLicencia: c.vencimientoLicencia || '',
        }))
        setConductores(datos)
        setTotal(response.total || datos.length)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err.message)
        console.error('Error fetching conductores:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar conductores cuando hay token disponible
  useEffect(() => {
    if (!token) return

    const abortController = new AbortController()
    fetchConductores(abortController.signal)
    return () => abortController.abort()
  }, [fetchConductores, token])

  // ─── Lecturas locales (sin llamada a API) ─────────────────────────────────
  const getConductores = useCallback(() => conductores, [conductores])

  const getConductorById = useCallback(
    (id) => conductores.find(c => c.idConductor === parseInt(id)),
    [conductores]
  )

  const getConductoresHabilitados = useCallback(
    () => conductores.filter(c => c.habilitado),
    [conductores]
  )

  // ─── Obtener conductor por ID desde la API ────────────────────────────────
  const fetchConductorById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.getConductorById(id)
      return response.data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching conductor:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Registrar conductor ──────────────────────────────────────────────────
  const registrarConductor = useCallback(async (nuevoConductor) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        tipoIdentificacion: nuevoConductor.tipoIdentificacion,
        numeroIdentificacion: nuevoConductor.numeroIdentificacion,
        nombre: nuevoConductor.nombre,
        apellido: nuevoConductor.apellido,
        telefono: nuevoConductor.telefono,
        email: nuevoConductor.email,
        // El form usa "licenciaConduccion"; el backend espera "categoriaLicencia"
        categoriaLicencia: nuevoConductor.licenciaConduccion,
        vencimientoLicencia: nuevoConductor.fechaVencimientoLicencia,
      }
      const response = await conductorService.createConductor(payload)
      if (response.success) {
        await fetchConductores()
        return response.data
      }
      throw new Error(response.message || 'Error al registrar conductor')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchConductores])

  // ─── Actualizar conductor ─────────────────────────────────────────────────
  const actualizarConductor = useCallback(async (conductorActualizado) => {
    setLoading(true)
    setError(null)
    try {
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
        await fetchConductores()
        return true
      }
      throw new Error(response.message || 'Error al actualizar conductor')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchConductores])

  // Alias para componentes que llaman updateConductor con (id, data) separados
  const actualizarConductorApi = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.updateConductor(id, data)
      if (response.success) {
        await fetchConductores()
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error updating conductor:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchConductores])

  // ─── Habilitar / Inhabilitar conductor ───────────────────────────────────
  const toggleHabilitado = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.toggleHabilitadoConductor(id)
      if (response.success) {
        await fetchConductores()
        return true
      }
      return false
    } catch (err) {
      setError(err.message)
      console.error('Error toggling conductor:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchConductores])

  // ─── Cambiar estado operativo (activo / inactivo) ─────────────────────────
  const updateEstado = useCallback(async (id, nuevoEstado) => {
    setLoading(true)
    setError(null)
    try {
      // La vista puede enviar "En ruta"; el backend solo acepta 'activo' | 'inactivo'
      let estadoBackend = nuevoEstado.toLowerCase()
      if (estadoBackend === 'en ruta') estadoBackend = 'activo'
      const response = await conductorService.cambiarEstadoConductor(id, estadoBackend)
      if (response.success) {
        await fetchConductores()
        return true
      }
      return false
    } catch (err) {
      setError(err.message)
      console.error('Error updating conductor estado:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchConductores])

  // ─── Eliminar conductor (inhabilitación lógica vía DELETE) ───────────────
  const eliminarConductor = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.deleteConductor(id)
      if (response.success) {
        await fetchConductores()
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error deleting conductor:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchConductores])

  const value = {
    conductores,
    total,
    loading,
    error,
    // Lecturas
    getConductores,
    getConductorById,
    getConductoresHabilitados,
    // Escrituras
    registrarConductor,
    actualizarConductor,
    actualizarConductorApi,
    toggleHabilitado,
    updateEstado,
    eliminarConductor,
    // Fetches directos a API
    fetchConductores,
    fetchConductorById,
    // Alias para compatibilidad con otros contextos/vistas
    cargarConductores: fetchConductores,
    crearConductor: registrarConductor,
  }

  return (
    <ConductorContext.Provider value={value}>
      {children}
    </ConductorContext.Provider>
  )
}