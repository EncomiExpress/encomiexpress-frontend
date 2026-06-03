import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as vehiculoService from '../services/vehiculoService'
import { useAuth } from './AuthContext'

const TransporteContext = createContext()

export const useTransporte = () => useContext(TransporteContext)

export const TransporteProvider = ({ children }) => {
  const auth = useAuth() || {}
  const token = auth?.token || null
  const [transportes, setTransportes] = useState([])
  const [total, setTotal] = useState(0)

  const getTransportes = useCallback(() => transportes, [transportes])
  const getTotal = useCallback(() => total, [total])

  const getTransporteById = useCallback((id) => {
    return transportes.find(t => t.idVehiculo === parseInt(id))
  }, [transportes])

  const fetchVehiculos = useCallback(async (signal, params = {}) => {
    try {
      const response = await vehiculoService.getVehiculos(signal, params)
      if (response?.success) {
        setTransportes(response.data)
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

  const registrarTransporte = useCallback(async (nuevoTransporte) => {
    try {
      const response = await vehiculoService.createVehiculo(nuevoTransporte)
      if (response.success) {
        await fetchVehiculos()
        return response.data
      }
      throw new Error(response.message || 'Error al registrar vehículo')
    } catch (err) {
      console.error('Error creating transporte:', err)
      throw err
    }
  }, [fetchVehiculos])

  // Habilitar/Inhabilitar transporte usando API
  const toggleHabilitado = useCallback(async (id) => {
    try {
      const res = await vehiculoService.toggleHabilitadoVehiculo(id)
      if (res && res.success) {
        await fetchVehiculos()
        return true
      }
      return false
    } catch (err) {
      console.error('Error toggling vehiculo via API:', err)
      return false
    }
  }, [fetchVehiculos])

  // Actualizar estado del transporte usando API
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

  // Actualizar transporte usando API
  const actualizarTransporte = useCallback(async (transporteActualizado) => {
    try {
      const response = await vehiculoService.updateVehiculo(transporteActualizado.idVehiculo, transporteActualizado)
      if (response.success) {
        await fetchVehiculos()
        return response.data
      }
      throw new Error(response.message || 'Error al actualizar vehículo')
    } catch (err) {
      console.error('Error updating transporte:', err)
      throw err
    }
  }, [fetchVehiculos])

  // Obtener transportes habilitados
  const getTransportesHabilitados = useCallback(() => {
    return transportes.filter(t => t.habilitado)
  }, [transportes])

  return (
    <TransporteContext.Provider value={{
      getTransportes, getTransporteById, getTotal,
      registrarTransporte,
      actualizarTransporte, toggleHabilitado, updateEstado, getTransportesHabilitados,
      fetchVehiculos,
    }}>
      {children}
    </TransporteContext.Provider>
  )
}