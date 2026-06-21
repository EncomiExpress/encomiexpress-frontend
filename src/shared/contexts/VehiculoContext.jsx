import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as vehiculoService from '../services/vehiculoService'
import { useAuth } from './AuthContext'

const VehiculoContext = createContext()

export const useVehiculo = () => useContext(VehiculoContext)

export const VehiculoProvider = ({ children }) => {
  const auth = useAuth() || {}
  const token = auth?.token || null
  const [vehiculos, setVehiculos] = useState([])
  const [total, setTotal] = useState(0)

  const getVehiculos = useCallback(() => vehiculos, [vehiculos])
  const getTotal = useCallback(() => total, [total])

  const getVehiculoById = useCallback((id) => {
    return vehiculos.find(v => v.idVehiculo === parseInt(id))
  }, [vehiculos])

  const fetchVehiculos = useCallback(async (signal, params = {}) => {
    try {
      const response = await vehiculoService.getVehiculos(signal, params)
      if (response?.success) {
        setVehiculos(response.data)
        setTotal(response.total ?? response.data.length)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Error fetching vehiculos:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return
    const abortController = new AbortController()
    fetchVehiculos(abortController.signal)
    return () => abortController.abort()
  }, [fetchVehiculos, token])

  const registrarVehiculo = useCallback(async (nuevoVehiculo) => {
    try {
      const response = await vehiculoService.createVehiculo(nuevoVehiculo)
      if (response.success) {
        await fetchVehiculos()
        return response.data
      }
      throw new Error(response.message || 'Error al registrar vehículo')
    } catch (err) {
      console.error('Error creating vehiculo:', err)
      throw err
    }
  }, [fetchVehiculos])

  const toggleHabilitado = useCallback(async (id) => {
    try {
      const res = await vehiculoService.toggleHabilitadoVehiculo(id)
      if (res && res.success) {
        await fetchVehiculos()
        return true
      }
      throw new Error(res?.message || 'Error al cambiar el estado')
    } catch (err) {
      throw err
    }
  }, [fetchVehiculos])

  const updateEstado = useCallback(async (id, nuevoEstado) => {
    try {
      const estadoBackend = nuevoEstado.toLowerCase()
      const response = await vehiculoService.cambiarEstadoVehiculo(id, estadoBackend)
      if (response.success) {
        await fetchVehiculos()
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating vehiculo estado:', err)
      return false
    }
  }, [fetchVehiculos])

  const actualizarVehiculo = useCallback(async (vehiculoActualizado) => {
    try {
      const response = await vehiculoService.updateVehiculo(vehiculoActualizado.idVehiculo, vehiculoActualizado)
      if (response.success) {
        await fetchVehiculos()
        return response.data
      }
      throw new Error(response.message || 'Error al actualizar vehículo')
    } catch (err) {
      console.error('Error updating vehiculo:', err)
      throw err
    }
  }, [fetchVehiculos])

  const getVehiculosHabilitados = useCallback(() => {
    return vehiculos.filter(v => v.habilitado)
  }, [vehiculos])

  return (
    <VehiculoContext.Provider value={{
      getVehiculos, getVehiculoById, getTotal,
      registrarVehiculo,
      actualizarVehiculo, toggleHabilitado, updateEstado, getVehiculosHabilitados,
      fetchVehiculos,
    }}>
      {children}
    </VehiculoContext.Provider>
  )
}
