import { createContext, useContext, useState, useCallback } from 'react'

const RutaProgramacionContext = createContext()

export const useRutaProgramacion = () => useContext(RutaProgramacionContext)

// Mock data inicial para rutas programadas
const rutasProgramadasMock = [
  { 
    idRutaProgramada: 1, 
    nombreRuta: 'Ruta Medellín - Bogotá',
    idVehiculo: 1,
    idConductor: 1,
    idDestino: 1,
    fechaSalida: '2024-06-15',
    horaSalida: '06:00',
    horaLlegadaEstimada: '14:00',
    estado: 'Programada',
    observaciones: 'Salida por carrera 50',
    habilitado: true
  },
  { 
    idRutaProgramada: 2, 
    nombreRuta: 'Ruta Cali - Barranquilla',
    idVehiculo: 2,
    idConductor: 2,
    idDestino: 4,
    fechaSalida: '2024-06-15',
    horaSalida: '08:00',
    horaLlegadaEstimada: '18:00',
    estado: 'En Curso',
    observaciones: '',
    habilitado: true
  },
  { 
    idRutaProgramada: 3, 
    nombreRuta: 'Ruta Bogotá - Bucaramanga',
    idVehiculo: 3,
    idConductor: 4,
    idDestino: 3,
    fechaSalida: '2024-06-14',
    horaSalida: '07:00',
    horaLlegadaEstimada: '16:00',
    estado: 'Completada',
    observaciones: 'Ruta normal',
    habilitado: true
  },
  { 
    idRutaProgramada: 4, 
    nombreRuta: 'Ruta Medellín - Pereira',
    idVehiculo: 1,
    idConductor: 1,
    idDestino: 2,
    fechaSalida: '2024-06-16',
    horaSalida: '05:30',
    horaLlegadaEstimada: '08:30',
    estado: 'Programada',
    observaciones: 'Viaje temprano',
    habilitado: true
  },
]

export const RutaProgramacionProvider = ({ children }) => {
  const [rutasProgramadas, setRutasProgramadas] = useState(rutasProgramadasMock)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todas las rutas programadas
  const getRutasProgramadas = useCallback(() => {
    return rutasProgramadas
  }, [rutasProgramadas])

  // Obtener ruta programada por ID
  const getRutaProgramadaById = useCallback((id) => {
    return rutasProgramadas.find(r => r.idRutaProgramada === parseInt(id))
  }, [rutasProgramadas])

  // Registrar ruta programada
  const registrarRutaProgramada = useCallback((nuevaRuta) => {
    const maxId = Math.max(...rutasProgramadas.map(r => r.idRutaProgramada))
    const nuevo = {
      ...nuevaRuta,
      idRutaProgramada: maxId + 1,
      habilitado: true
    }
    setRutasProgramadas(prev => [...prev, nuevo])
    return nuevo
  }, [rutasProgramadas])

  // Actualizar ruta programada
  const actualizarRutaProgramada = useCallback((rutaActualizada) => {
    const index = rutasProgramadas.findIndex(r => r.idRutaProgramada === rutaActualizada.idRutaProgramada)
    if (index !== -1) {
      setRutasProgramadas(prev => {
        const newRutas = [...prev]
        newRutas[index] = { ...newRutas[index], ...rutaActualizada }
        return newRutas
      })
      return true
    }
    return false
  }, [rutasProgramadas])

  // Habilitar/Inhabilitar ruta programada
  const toggleHabilitado = useCallback((id) => {
    const index = rutasProgramadas.findIndex(r => r.idRutaProgramada === id)
    if (index !== -1) {
      setRutasProgramadas(prev => {
        const newRutas = [...prev]
        newRutas[index] = { 
          ...newRutas[index], 
          habilitado: !newRutas[index].habilitado
        }
        return newRutas
      })
      return true
    }
    return false
  }, [rutasProgramadas])

  // Cambiar estado de la ruta
  const updateEstado = useCallback((id, nuevoEstado) => {
    const index = rutasProgramadas.findIndex(r => r.idRutaProgramada === id)
    if (index !== -1) {
      // No permitir cambios si la ruta ya está completada
      if (rutasProgramadas[index].estado === 'Completada') {
        console.warn('No se puede cambiar el estado de una ruta completada')
        return false
      }
      setRutasProgramadas(prev => {
        const newRutas = [...prev]
        newRutas[index] = { 
          ...newRutas[index], 
          estado: nuevoEstado
        }
        return newRutas
      })
      return true
    }
    return false
  }, [rutasProgramadas])

  const value = {
    rutasProgramadas,
    loading,
    error,
    getRutasProgramadas,
    getRutaProgramadaById,
    registrarRutaProgramada,
    actualizarRutaProgramada,
    toggleHabilitado,
    updateEstado
  }

  return (
    <RutaProgramacionContext.Provider value={value}>
      {children}
    </RutaProgramacionContext.Provider>
  )
}