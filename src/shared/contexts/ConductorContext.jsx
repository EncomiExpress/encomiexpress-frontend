import { createContext, useContext, useState, useCallback } from 'react'
import * as conductorService from '../services/conductorService'

const ConductorContext = createContext()

export const useConductor = () => useContext(ConductorContext)

// Mock data inicial para conductores
const conductoresMock = [
  { 
    idConductor: 1, 
    tipoIdentificacion: 'CC', 
    numeroIdentificacion: '1038648135', 
    nombre: 'Juan', 
    apellido: 'Gómez López', 
    telefono: '3104776919', 
    email: 'juan.gomez@gmail.com',
    licenciaConduccion: 'A2',
    fechaVencimientoLicencia: '2026-12-31',
    estado: 'Activo',
    habilitado: true,
    fechaRegistro: '2024-01-15'
  },
  { 
    idConductor: 2, 
    tipoIdentificacion: 'CC', 
    numeroIdentificacion: '71234567', 
    nombre: 'Pedro', 
    apellido: 'Martínez Díaz', 
    telefono: '3154321098', 
    email: 'pedro.martinez@gmail.com',
    licenciaConduccion: 'B2',
    fechaVencimientoLicencia: '2025-06-30',
    estado: 'Activo',
    habilitado: true,
    fechaRegistro: '2024-02-20'
  },
  { 
    idConductor: 3, 
    tipoIdentificacion: 'CC', 
    numeroIdentificacion: '43210987', 
    nombre: 'María', 
    apellido: 'Torres Ruiz', 
    telefono: '3209876543', 
    email: 'maria.torres@gmail.com',
    licenciaConduccion: 'C1',
    fechaVencimientoLicencia: '2025-03-15',
    estado: 'Inactivo',
    habilitado: false,
    fechaRegistro: '2024-03-10'
  },
  { 
    idConductor: 4, 
    tipoIdentificacion: 'CE', 
    numeroIdentificacion: '987654321', 
    nombre: 'Carlos', 
    apellido: 'Rodríguez Smith', 
    telefono: '3001234567', 
    email: 'carlos.rodriguez@gmail.com',
    licenciaConduccion: 'A1',
    fechaVencimientoLicencia: '2026-08-20',
    estado: 'Activo',
    habilitado: true,
    fechaRegistro: '2024-04-05'
  },
]

export const ConductorProvider = ({ children }) => {
  const [conductores, setConductores] = useState(conductoresMock)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los conductores
  const getConductores = useCallback(() => {
    return conductores
  }, [conductores])

  // Obtener conductor por ID
  const getConductorById = useCallback((id) => {
    return conductores.find(c => c.idConductor === parseInt(id))
  }, [conductores])

  // Obtener conductores habilitados
  const getConductoresHabilitados = useCallback(() => {
    return conductores.filter(c => c.habilitado)
  }, [conductores])

  // Registrar conductor
  const registrarConductor = useCallback((nuevoConductor) => {
    const maxId = Math.max(...conductores.map(c => c.idConductor))
    const nuevo = {
      ...nuevoConductor,
      idConductor: maxId + 1,
      habilitado: true,
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    }
    setConductores(prev => [...prev, nuevo])
    return nuevo
  }, [conductores])

  // Actualizar conductor
  const actualizarConductor = useCallback((conductorActualizado) => {
    const index = conductores.findIndex(c => c.idConductor === conductorActualizado.idConductor)
    if (index !== -1) {
      setConductores(prev => {
        const newConductores = [...prev]
        newConductores[index] = { ...newConductores[index], ...conductorActualizado }
        return newConductores
      })
      return true
    }
    return false
  }, [conductores])

  // Habilitar/Inhabilitar conductor
  const toggleHabilitado = useCallback(async (id) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await conductorService.toggleHabilitadoConductor(id)
        if (res.success) {
          setConductores(prev => prev.map(c => c.idConductor === id ? res.data : c))
          return true
        }
      } catch (e) {
        console.error('Error toggling conductor:', e)
        return false
      }
    }

    const index = conductores.findIndex(c => c.idConductor === id)
    if (index !== -1) {
      setConductores(prev => {
        const newConductores = [...prev]
        newConductores[index] = { 
          ...newConductores[index], 
          habilitado: !newConductores[index].habilitado,
          estado: !newConductores[index].habilitado ? 'Activo' : 'Inactivo'
        }
        return newConductores
      })
      return true
    }
    return false
  }, [conductores])

  // Cambiar estado del conductor
  const updateEstado = useCallback((id, nuevoEstado) => {
    const index = conductores.findIndex(c => c.idConductor === id)
    if (index !== -1) {
      setConductores(prev => {
        const newConductores = [...prev]
        newConductores[index] = { 
          ...newConductores[index], 
          estado: nuevoEstado
        }
        return newConductores
      })
      return true
    }
    return false
  }, [conductores])

// Llamadas a API (para cuando esté implementado el backend)
   const fetchConductores = useCallback(async () => {
     setLoading(true)
     setError(null)
     try {
       const response = await conductorService.getConductores()
       if (response.success) {
         const datos = response.data.map(c => ({
           ...c,
           nombre: c.usuario?.nombre || c.nombre || '',
           apellido: c.usuario?.apellido || c.apellido || '',
           telefono: c.usuario?.telefono || c.telefono || '',
           email: c.usuario?.email || c.email || '',
           tipoIdentificacion: c.usuario?.tipoIdentificacion || c.tipoIdentificacion || '',
           numeroIdentificacion: c.usuario?.numeroIdentificacion || c.numeroIdentificacion || '',
           licenciaConduccion: c.categoriaLicencia || c.licenciaConduccion || '',
           fechaVencimientoLicencia: c.vencimientoLicencia || c.fechaVencimientoLicencia || '',
         }))
         setConductores(datos)
       }
     } catch (err) {
       setError(err.message)
       console.error('Error fetching conductores:', err)
     } finally {
       setLoading(false)
     }
   }, [])

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

  const crearConductor = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.createConductor(data)
      if (response.success) {
        setConductores(prev => [...prev, response.data])
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error creating conductor:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarConductorApi = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.updateConductor(id, data)
      if (response.success) {
        setConductores(prev => prev.map(c => c.idConductor === id ? response.data : c))
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error updating conductor:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarConductor = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await conductorService.deleteConductor(id)
      if (response.success) {
        setConductores(prev => prev.filter(c => c.idConductor !== id))
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error deleting conductor:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    conductores,
    loading,
    error,
    getConductores,
    getConductorById,
    getConductoresHabilitados,
    registrarConductor,
    actualizarConductor,
    toggleHabilitado,
    updateEstado,
    fetchConductores,
    fetchConductorById,
    crearConductor,
    actualizarConductorApi,
    eliminarConductor,
    cargarConductores: fetchConductores,
  }

  return (
    <ConductorContext.Provider value={value}>
      {children}
    </ConductorContext.Provider>
  )
}

