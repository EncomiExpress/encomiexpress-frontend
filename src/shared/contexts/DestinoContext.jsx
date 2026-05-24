import { createContext, useContext, useState, useCallback } from 'react'

const DestinoContext = createContext()

export const useDestino = () => useContext(DestinoContext)

// Mock data inicial para destinos
const destinosMock = [
  { 
    idDestino: 1, 
    nombre: 'Terminal de Medellín', 
    direccion: 'Cra 50 #30-25',
    ciudad: 'Medellín',
    departamento: 'Antioquia',
    telefono: '6041234567',
    contacto: 'Juan Pérez',
    estado: 'Activo',
    habilitado: true,
    fechaRegistro: '2024-01-15'
  },
  { 
    idDestino: 2, 
    nombre: 'Terminal de Bogotá', 
    direccion: 'Av El Dorado #100-10',
    ciudad: 'Bogotá',
    departamento: 'Cundinamarca',
    telefono: '6017894561',
    contacto: 'María López',
    estado: 'Activo',
    habilitado: true,
    fechaRegistro: '2024-02-20'
  },
  { 
    idDestino: 3, 
    nombre: 'Punto Cali Norte', 
    direccion: 'Cll 5 #50-30',
    ciudad: 'Cali',
    departamento: 'Valle del Cauca',
    telefono: '6023456789',
    contacto: 'Carlos Rodríguez',
    estado: 'Activo',
    habilitado: true,
    fechaRegistro: '2024-03-10'
  },
  { 
    idDestino: 4, 
    nombre: 'Oficina Barranquilla', 
    direccion: 'Cra 50 #70-20',
    ciudad: 'Barranquilla',
    departamento: 'Atlántico',
    telefono: '6054567890',
    contacto: 'Ana Martínez',
    estado: 'Inactivo',
    habilitado: false,
    fechaRegistro: '2024-04-05'
  },
]

export const DestinoProvider = ({ children }) => {
  const [destinos, setDestinos] = useState(destinosMock)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los destinos
  const getDestinos = useCallback(() => {
    return destinos
  }, [destinos])

  // Obtener destino por ID
  const getDestinoById = useCallback((id) => {
    return destinos.find(d => d.idDestino === parseInt(id))
  }, [destinos])

  // Obtener destinos habilitados
  const getDestinosHabilitados = useCallback(() => {
    return destinos.filter(d => d.habilitado)
  }, [destinos])

  // Registrar destino
  const registrarDestino = useCallback((nuevoDestino) => {
    const maxId = Math.max(...destinos.map(d => d.idDestino))
    const nuevo = {
      ...nuevoDestino,
      idDestino: maxId + 1,
      habilitado: true,
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    }
    setDestinos(prev => [...prev, nuevo])
    return nuevo
  }, [destinos])

  // Actualizar destino
  const actualizarDestino = useCallback((destinoActualizado) => {
    const index = destinos.findIndex(d => d.idDestino === destinoActualizado.idDestino)
    if (index !== -1) {
      setDestinos(prev => {
        const newDestinos = [...prev]
        newDestinos[index] = { ...newDestinos[index], ...destinoActualizado }
        return newDestinos
      })
      return true
    }
    return false
  }, [destinos])

  // Habilitar/Inhabilitar destino
  const toggleHabilitado = useCallback(async (id) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const destinoService = await import('../services/destinoService')
        const res = await destinoService.toggleHabilitadoDestino(id)
        if (res.success) {
          setDestinos(prev => prev.map(d => d.idDestino === id ? res.data : d))
          return true
        }
      } catch (e) {
        console.error('Error toggling destino:', e)
        return false
      }
    }

    const index = destinos.findIndex(d => d.idDestino === id)
    if (index !== -1) {
      setDestinos(prev => {
        const newDestinos = [...prev]
        newDestinos[index] = { 
          ...newDestinos[index], 
          habilitado: !newDestinos[index].habilitado,
          estado: !newDestinos[index].habilitado ? 'Activo' : 'Inactivo'
        }
        return newDestinos
      })
      return true
    }
    return false
  }, [destinos])

  // Cambiar estado del destino
  const updateEstado = useCallback((id, nuevoEstado) => {
    const index = destinos.findIndex(d => d.idDestino === id)
    if (index !== -1) {
      setDestinos(prev => {
        const newDestinos = [...prev]
        newDestinos[index] = { 
          ...newDestinos[index], 
          estado: nuevoEstado
        }
        return newDestinos
      })
      return true
    }
    return false
  }, [destinos])

  const value = {
    destinos,
    loading,
    error,
    getDestinos,
    getDestinoById,
    getDestinosHabilitados,
    registrarDestino,
    actualizarDestino,
    toggleHabilitado,
    updateEstado
  }

  return (
    <DestinoContext.Provider value={value}>
      {children}
    </DestinoContext.Provider>
  )
}

