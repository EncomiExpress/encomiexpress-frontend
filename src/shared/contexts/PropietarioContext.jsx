import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as propietarioService from '../services/propietarioService'
import { useAuth } from './AuthContext'

const PropietarioContext = createContext()

export const usePropietario = () => useContext(PropietarioContext)

// Mock data inicial para propietarios
const propietariosMock = [
  { 
    idPropietario: 1, tipoIdentificacion: 'CC', numeroIdentificacion: '1038648135',
    nombre: 'Carlos', apellido: 'Gómez López', telefono: '3104776919',
    email: 'carlos.gomez@gmail.com', direccion: 'Cll 45 #20-10',
    ciudad: 'Medellín', estado: 'Activo', habilitado: true, fechaRegistro: '2024-01-15'
  },
  { 
    idPropietario: 2, tipoIdentificacion: 'NIT', numeroIdentificacion: '900123456',
    nombre: 'Transportes Express SAS', apellido: '', telefono: '3001234567',
    email: 'contacto@transportesexpress.com', direccion: 'Cll 10 #5-40',
    ciudad: 'Bogotá', estado: 'Activo', habilitado: true, fechaRegistro: '2024-02-20'
  },
  { 
    idPropietario: 3, tipoIdentificacion: 'CC', numeroIdentificacion: '71234567',
    nombre: 'Andrés', apellido: 'Martínez Díaz', telefono: '3154321098',
    email: 'andres.martinez@gmail.com', direccion: 'Cll 70 #45-20',
    ciudad: 'Barranquilla', estado: 'Inactivo', habilitado: false, fechaRegistro: '2024-03-10'
  },
  { 
    idPropietario: 4, tipoIdentificacion: 'CC', numeroIdentificacion: '43210987',
    nombre: 'María', apellido: 'Torres Ruiz', telefono: '3209876543',
    email: 'maria.torres@gmail.com', direccion: 'Cra 50 #30-15',
    ciudad: 'Cali', estado: 'Activo', habilitado: true, fechaRegistro: '2024-04-05'
  },
]

export const PropietarioProvider = ({ children }) => {
  const { token } = useAuth()
  const [propietarios, setPropietarios] = useState(propietariosMock)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los propietarios
  const getPropietarios = useCallback(() => {
    return propietarios
  }, [propietarios])

  // Obtener propietario por ID
  const getPropietarioById = useCallback((id) => {
    return propietarios.find(p => p.idPropietario === parseInt(id))
  }, [propietarios])

  // Obtener propietarios habilitados
  const getPropietariosHabilitados = useCallback(() => {
    return propietarios.filter(p => p.habilitado)
  }, [propietarios])

  // Registrar propietario
  const registrarPropietario = useCallback((nuevoPropietario) => {
    const maxId = Math.max(...propietarios.map(p => p.idPropietario))
    const nuevo = {
      ...nuevoPropietario,
      idPropietario: maxId + 1,
      habilitado: true,
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    }
    setPropietarios(prev => [...prev, nuevo])
    return nuevo
  }, [propietarios])

  // Actualizar propietario
  const actualizarPropietario = useCallback((propietarioActualizado) => {
    const index = propietarios.findIndex(p => p.idPropietario === propietarioActualizado.idPropietario)
    if (index !== -1) {
      setPropietarios(prev => {
        const newPropietarios = [...prev]
        newPropietarios[index] = { ...newPropietarios[index], ...propietarioActualizado }
        return newPropietarios
      })
      return true
    }
    return false
  }, [propietarios])

  // Habilitar/Inhabilitar propietario
  const toggleHabilitado = useCallback(async (id) => {
    if (token) {
      try {
        const res = await propietarioService.toggleHabilitadoPropietario(id)
        if (res.success) {
          setPropietarios(prev => prev.map(p => p.idPropietario === id ? res.data : p))
          return true
        }
      } catch (e) {
        console.error('Error toggling propietario:', e)
        return false
      }
    }

    const index = propietarios.findIndex(p => p.idPropietario === id)
    if (index !== -1) {
      setPropietarios(prev => {
        const newPropietarios = [...prev]
        newPropietarios[index] = { 
          ...newPropietarios[index], 
          habilitado: !newPropietarios[index].habilitado,
          estado: !newPropietarios[index].habilitado ? 'Activo' : 'Inactivo'
        }
        return newPropietarios
      })
      return true
    }
    return false
  }, [propietarios, token])

  // Cambiar estado del propietario
  const updateEstado = useCallback((id, nuevoEstado) => {
    const index = propietarios.findIndex(p => p.idPropietario === id)
    if (index !== -1) {
      setPropietarios(prev => {
        const newPropietarios = [...prev]
        newPropietarios[index] = { ...newPropietarios[index], estado: nuevoEstado }
        return newPropietarios
      })
      return true
    }
    return false
  }, [propietarios])

  // Llamadas a API (para cuando esté implementado el backend)
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

  useEffect(() => {
    const handler = (e) => {
      // Si se provee idPropietario, podemos opcionalmente optimizar, pero
      // por simplicidad refrescamos toda la lista desde el backend
      fetchPropietarios()
    }
    window.addEventListener('vehiculo:toggled', handler)
    return () => window.removeEventListener('vehiculo:toggled', handler)
  }, [fetchPropietarios])

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

  const crearPropietario = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.createPropietario(data)
      if (response.success) {
        setPropietarios(prev => [...prev, response.data])
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error creating propietario:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarPropietarioApi = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.updatePropietario(id, data)
      if (response.success) {
        setPropietarios(prev => prev.map(p => p.idPropietario === id ? response.data : p))
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error updating propietario:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarPropietario = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await propietarioService.deletePropietario(id)
      if (response.success) {
        setPropietarios(prev => prev.filter(p => p.idPropietario !== id))
        return response
      }
    } catch (err) {
      setError(err.message)
      console.error('Error deleting propietario:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    propietarios, loading, error,
    getPropietarios, getPropietarioById, getPropietariosHabilitados,
    registrarPropietario, actualizarPropietario, toggleHabilitado, updateEstado,
    fetchPropietarios, fetchPropietarioById, crearPropietario,
    actualizarPropietarioApi, eliminarPropietario
  }

  return (
    <PropietarioContext.Provider value={value}>
      {children}
    </PropietarioContext.Provider>
  )
}