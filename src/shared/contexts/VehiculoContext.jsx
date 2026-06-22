import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as vehiculoService from '../services/vehiculoService'
import { useAuth } from './AuthContext'

const VehiculoContext = createContext()

export const useVehiculo = () => useContext(VehiculoContext)

export const VehiculoProvider = ({ children }) => {
  const { token } = useAuth()
  const [vehiculos, setVehiculos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Getters funcionales — usados por rutas y dashboard para lookups
  const getVehiculos = useCallback(() => vehiculos, [vehiculos])
  const getTotal = useCallback(() => total, [total])
  const getVehiculoById = useCallback((id) => vehiculos.find(v => v.idVehiculo === parseInt(id)), [vehiculos])
  const getVehiculosHabilitados = useCallback(() => vehiculos.filter(v => v.habilitado), [vehiculos])

  const fetchVehiculos = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await vehiculoService.getVehiculos(signal, params)
      if (response?.success) {
        setVehiculos(response.data)
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
    fetchVehiculos(abortController.signal)
    return () => abortController.abort()
  }, [fetchVehiculos, token])

  const registrarVehiculo = useCallback(async (nuevoVehiculo) => {
    const response = await vehiculoService.createVehiculo(nuevoVehiculo)
    if (response.success) {
      setVehiculos(prev => [...prev, response.data])
      setTotal(prev => prev + 1)
      return response.data
    }
    throw new Error(response.message || 'Error al registrar vehículo')
  }, [])

  const actualizarVehiculo = useCallback(async (vehiculoActualizado) => {
    const response = await vehiculoService.updateVehiculo(vehiculoActualizado.idVehiculo, vehiculoActualizado)
    if (response.success) {
      setVehiculos(prev => prev.map(v => v.idVehiculo === vehiculoActualizado.idVehiculo ? response.data : v))
      return response.data
    }
    throw new Error(response.message || 'Error al actualizar vehículo')
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    const res = await vehiculoService.toggleHabilitadoVehiculo(id)
    if (res?.success) {
      setVehiculos(prev => prev.map(v => v.idVehiculo === id ? res.data : v))
      return true
    }
    throw new Error(res?.message || 'Error al cambiar el estado')
  }, [])

  const updateEstado = useCallback(async (id, nuevoEstado) => {
    const estadoBackend = nuevoEstado.toLowerCase()
    const response = await vehiculoService.cambiarEstadoVehiculo(id, estadoBackend)
    if (response.success) {
      setVehiculos(prev => prev.map(v =>
        v.idVehiculo === id ? { ...v, estado: response.data.estado, estadoEfectivo: response.data.estadoEfectivo } : v
      ))
      return true
    }
    return false
  }, [])

  return (
    <VehiculoContext.Provider value={{
      vehiculos,
      total,
      loading,
      error,
      getVehiculos,
      getVehiculoById,
      getTotal,
      getVehiculosHabilitados,
      fetchVehiculos,
      registrarVehiculo,
      actualizarVehiculo,
      toggleHabilitado,
      updateEstado,
    }}>
      {children}
    </VehiculoContext.Provider>
  )
}
