import { createContext, useContext, useState } from 'react'

const AnticipoExcedenteContext = createContext()

export const useAnticipos = () => useContext(AnticipoExcedenteContext)

export const conductoresMock = [
  { idConductor: 1, nombre: 'Juan Carlos Ríos' },
  { idConductor: 2, nombre: 'Pedro Hernández' },
  { idConductor: 3, nombre: 'Luis Morales' },
  { idConductor: 4, nombre: 'Andrés Castaño' },
  { idConductor: 5, nombre: 'Jorge Saldarriaga' },
]

export const rutasMock = [
  { idRuta: 1, nombre: 'Medellín - Caucasia' },
  { idRuta: 2, nombre: 'Medellín - Tarazá' },
  { idRuta: 3, nombre: 'Medellín - Zaragoza' },
  { idRuta: 4, nombre: 'Medellín - El Bagre' },
  { idRuta: 5, nombre: 'Medellín - Nechí' },
  { idRuta: 6, nombre: 'Caucasia - Tarazá' },
  { idRuta: 7, nombre: 'Caucasia - Zaragoza' },
]

// Soportes simulados — representan lo que el conductor subiría desde el móvil
const soportesMock = [
  {
    id: 's1',
    nombre: 'recibo_combustible.jpg',
    tipo: 'image',
    url: 'https://placehold.co/400x300/e8f5e9/2e7d32?text=Recibo+Combustible',
    subidoPor: 'Conductor',
    fecha: '2025-01-12',
  },
  {
    id: 's2',
    nombre: 'peaje_norte.jpg',
    tipo: 'image',
    url: 'https://placehold.co/400x300/e3f2fd/1565c0?text=Soporte+Peaje',
    subidoPor: 'Conductor',
    fecha: '2025-01-13',
  },
  {
    id: 's3',
    nombre: 'hospedaje.jpg',
    tipo: 'image',
    url: 'https://placehold.co/400x300/fff8e1/f57f17?text=Comprobante+Hospedaje',
    subidoPor: 'Conductor',
    fecha: '2025-01-14',
  },
]

export const AnticipoExcedenteProvider = ({ children }) => {
  const [anticipos, setAnticipos] = useState([
    {
      idAnticipoExcedente: 1,
      idConductor: 1,
      idRuta: 1,
      valorAnticipo: 500000,
      valorGastado: 450000,
      excedente: 50000,
      estado: 'legalizado',
      habilitado: true,
      observaciones: 'Viaje sin novedades, combustible y peaje pagados.',
      soportes: soportesMock,
      fechaEntrega: '2025-01-10',
      fechaLegalizacion: '2025-01-15',
      fechaEntregaExcedente: '2025-01-16',
    },
    {
      idAnticipoExcedente: 2,
      idConductor: 2,
      idRuta: 3,
      valorAnticipo: 800000,
      valorGastado: 0,
      excedente: 0,
      estado: 'entregado',
      habilitado: true,
      observaciones: '',
      soportes: [],
      fechaEntrega: '2025-02-01',
      fechaLegalizacion: '',
      fechaEntregaExcedente: '',
    },
    {
      idAnticipoExcedente: 3,
      idConductor: 3,
      idRuta: 2,
      valorAnticipo: 600000,
      valorGastado: 620000,
      excedente: 0,
      estado: 'en legalización',
      habilitado: false,
      observaciones: 'Gasto adicional por desvío de vía.',
      soportes: [soportesMock[0], soportesMock[2]],
      fechaEntrega: '2025-02-05',
      fechaLegalizacion: '',
      fechaEntregaExcedente: '',
    },
  ])

  const agregarAnticipo = (nuevo) => {
    setAnticipos(prev => [
      ...prev,
      {
        ...nuevo,
        idAnticipoExcedente: prev.length + 1,
        excedente: parseFloat(nuevo.valorAnticipo || 0) - parseFloat(nuevo.valorGastado || 0),
        soportes: [],
      },
    ])
  }

  const actualizarAnticipo = (actualizado) => {
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === actualizado.idAnticipoExcedente
          ? {
              ...actualizado,
              excedente:
                parseFloat(actualizado.valorAnticipo || 0) -
                parseFloat(actualizado.valorGastado || 0),
            }
          : a
      )
    )
  }

  const cambiarEstado = (id, nuevoEstado) => {
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === id ? { ...a, estado: nuevoEstado } : a
      )
    )
  }

  const toggleHabilitado = (id) => {
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === id ? { ...a, habilitado: !a.habilitado } : a
      )
    )
  }

  // En producción esto sería un upload al servidor; aquí simula agregar la referencia
  const agregarSoporte = (idAnticipo, soporte) => {
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === idAnticipo
          ? { ...a, soportes: [...(a.soportes || []), soporte] }
          : a
      )
    )
  }

  const eliminarSoporte = (idAnticipo, idSoporte) => {
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === idAnticipo
          ? { ...a, soportes: a.soportes.filter(s => s.id !== idSoporte) }
          : a
      )
    )
  }

  return (
    <AnticipoExcedenteContext.Provider
      value={{
        anticipos,
        agregarAnticipo,
        actualizarAnticipo,
        cambiarEstado,
        toggleHabilitado,
        agregarSoporte,
        eliminarSoporte,
      }}
    >
      {children}
    </AnticipoExcedenteContext.Provider>
  )
}

export default AnticipoExcedenteProvider