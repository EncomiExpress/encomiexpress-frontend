import { createContext, useContext, useState, useCallback } from 'react'
import * as vehiculoService from '../services/vehiculoService'

const TransporteContext = createContext()

export const useTransporte = () => useContext(TransporteContext)

// Mock data para vehículos
let transportesMock = [
  { 
    idVehiculo: 1, 
    idConductor: 4, 
    idPropietario: 6, 
    placa: 'ABC-123', 
    marca: 'Toyota', 
    modelo: 'Hilux', 
    color: 'Blanco', 
    tipo: 'Camioneta', 
    capacidad: 1500, 
    estado: 'Activo', 
    habilitado: true, 
    fechaRegistro: '2024-01-15', 
    vencimientoSOAT: '2025-06-20', 
    vencimientoRevisionTecnica: '2025-08-15', 
    vencimientoSeguroTerceros: '2025-12-01' 
  },
  { 
    idVehiculo: 2, 
    idConductor: 7, 
    idPropietario: 8, 
    placa: 'XYZ-789', 
    marca: 'Ford', 
    modelo: 'Ranger', 
    color: 'Negro', 
    tipo: 'Camioneta', 
    capacidad: 1200, 
    estado: 'Activo', 
    habilitado: true, 
    fechaRegistro: '2024-02-20', 
    vencimientoSOAT: '2025-07-10', 
    vencimientoRevisionTecnica: '2025-09-01', 
    vencimientoSeguroTerceros: '2025-11-15' 
  },
  { 
    idVehiculo: 3, 
    idConductor: 9, 
    idPropietario: 10, 
    placa: 'DEF-456', 
    marca: 'Nissan', 
    modelo: 'Navara', 
    color: 'Gris', 
    tipo: 'Camioneta', 
    capacidad: 1100, 
    estado: 'Mantenimiento', 
    habilitado: true, 
    fechaRegistro: '2024-03-10', 
    vencimientoSOAT: '2025-05-25', 
    vencimientoRevisionTecnica: '2025-07-20', 
    vencimientoSeguroTerceros: '2025-10-30' 
  },
]

export const TransporteProvider = ({ children }) => {
  const [transportes, setTransportes] = useState(transportesMock)

  // Obtener todos los transportes
  const getTransportes = useCallback(() => {
    return transportes
  }, [transportes])

  // Obtener transporte por ID
  const getTransporteById = useCallback((id) => {
    return transportes.find(t => t.idVehiculo === parseInt(id))
  }, [transportes])

  // Registrar transporte
  const registrarTransporte = useCallback((nuevoTransporte) => {
    setTransportes(prevTransportes => {
      const maxId = prevTransportes.length > 0 
        ? Math.max(...prevTransportes.map(t => t.idVehiculo)) 
        : 0
      const nuevo = {
        ...nuevoTransporte,
        idVehiculo: maxId + 1,
        habilitado: true,
        fechaRegistro: new Date().toISOString().split('T')[0]
      }
      return [...prevTransportes, nuevo]
    })
    return nuevoTransporte
  }, [])

  // Habilitar/Inhabilitar transporte (intenta backend y notifica a propietarios)
  const toggleHabilitado = useCallback(async (id) => {
    // Primero intentar llamada al backend si hay token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await vehiculoService.toggleHabilitadoVehiculo(id)
        if (res && res.success) {
          const updatedVehiculo = res.data
          setTransportes(prevTransportes => prevTransportes.map(t => t.idVehiculo === id ? updatedVehiculo : t))
          // Disparar evento global para que los propietarios se sincronicen
          try {
            window.dispatchEvent(new CustomEvent('vehiculo:toggled', { detail: { idPropietario: updatedVehiculo.idPropietario } }))
          } catch (e) {
            console.error('Error dispatching vehiculo:toggled', e)
          }
          return true
        }
      } catch (err) {
        console.error('Error toggling vehiculo via API:', err)
        // continuar con fallback local
      }
    }

    // Fallback local
    setTransportes(prevTransportes => {
      const index = prevTransportes.findIndex(t => t.idVehiculo === id)
      if (index !== -1) {
        const updated = [...prevTransportes]
        updated[index] = { 
          ...updated[index], 
          habilitado: !updated[index].habilitado 
        }
        // Notificar a propietarios localmente
        try {
          window.dispatchEvent(new CustomEvent('vehiculo:toggled', { detail: { idPropietario: updated[index].idPropietario } }))
        } catch (e) {
          console.error('Error dispatching vehiculo:toggled (local)', e)
        }
        return updated
      }
      return prevTransportes
    })
    return true
  }, [])

  // Actualizar estado del transporte (Activo, Inactivo, Mantenimiento, En Reparación)
  const updateEstado = useCallback((id, nuevoEstado) => {
    setTransportes(prevTransportes => {
      const index = prevTransportes.findIndex(t => t.idVehiculo === id)
      if (index !== -1) {
        const updated = [...prevTransportes]
        updated[index] = { 
          ...updated[index], 
          estado: nuevoEstado 
        }
        return updated
      }
      return prevTransportes
    })
    return true
  }, [])

  // Actualizar transporte
  const actualizarTransporte = useCallback((transporteActualizado) => {
    setTransportes(prevTransportes => {
      const index = prevTransportes.findIndex(t => t.idVehiculo === transporteActualizado.idVehiculo)
      if (index !== -1) {
        const updated = [...prevTransportes]
        updated[index] = { ...updated[index], ...transporteActualizado }
        return updated
      }
      return prevTransportes
    })
    return true
  }, [])

  // Obtener transportes habilitados
  const getTransportesHabilitados = useCallback(() => {
    return transportes.filter(t => t.habilitado)
  }, [transportes])

  return (
    <TransporteContext.Provider value={{
      getTransportes,
      getTransporteById,
      registrarTransporte,
      actualizarTransporte,
      toggleHabilitado,
      updateEstado,
      getTransportesHabilitados,
    }}>
      {children}
    </TransporteContext.Provider>
  )
}

