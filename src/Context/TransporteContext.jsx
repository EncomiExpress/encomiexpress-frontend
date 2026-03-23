import { createContext, useContext, useState } from 'react'

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
  const getTransportes = () => {
    return transportes
  }

  // Obtener transporte por ID
  const getTransporteById = (id) => {
    return transportes.find(t => t.idVehiculo === id)
  }

  // Registrar transporte
  const registrarTransporte = (nuevoTransporte) => {
    const maxId = Math.max(...transportes.map(t => t.idVehiculo))
    const nuevo = {
      ...nuevoTransporte,
      idVehiculo: maxId + 1,
      habilitado: true,
      fechaRegistro: new Date().toISOString().split('T')[0]
    }
    transportes.push(nuevo)
    return nuevo
  }

  // Actualizar transporte
  const actualizarTransporte = (transporteActualizado) => {
    const index = transportes.findIndex(t => t.idVehiculo === transporteActualizado.idVehiculo)
    if (index !== -1) {
      transportes[index] = { ...transportes[index], ...transporteActualizado }
      return true
    }
    return false
  }

  // Habilitar/Inhabilitar transporte
  const toggleHabilitado = (id) => {
    const index = transportes.findIndex(t => t.idVehiculo === id)
    if (index !== -1) {
      transportes[index] = { 
        ...transportes[index], 
        habilitado: !transportes[index].habilitado 
      }
      return true
    }
    return false
  }

  // Obtener transportes habilitados
  const getTransportesHabilitados = () => {
    return transportes.filter(t => t.habilitado)
  }

  return (
    <TransporteContext.Provider value={{
      getTransportes,
      getTransporteById,
      registrarTransporte,
      actualizarTransporte,
      toggleHabilitado,
      getTransportesHabilitados,
    }}>
      {children}
    </TransporteContext.Provider>
  )
}
