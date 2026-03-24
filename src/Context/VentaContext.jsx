import { createContext, useContext, useState } from 'react'

const VentaContext = createContext()

export const useVentas = () => useContext(VentaContext)

// Estados de la encomienda
export const ESTADOS_ENCOMIENDA = [
  'pendiente de recogida',
  'en recogida',
  'programada',
  'en tránsito',
  'entregado',
  'devuelto'
]

// Métodos de pago
export const METODOS_PAGO = ['contraentrega', 'efectivo', 'transferencia', 'Nequi']

// Estados de pago
export const ESTADOS_PAGO = ['pendiente', 'pagado']

// Datos quemados de ventas/encomiendas
const ventasIniciales = [
  {
    idEncomiendaVenta: 1,
    numeroGuia: 'EE-2024-000001',
    numeroFactura: 'FACT-001',
    fechaRegistro: '2024-01-15',
    fechaHoraEmision: '2024-01-15T10:30:00',
    fechaEstimadaEntrega: '2024-01-18',
    estado: 'entregado',
    observaciones: 'Entrega exitosa',
    valorServicio: 25000,
    impuestos: 2500,
    total: 27500,
    metodoPago: 'efectivo',
    estadoPago: 'pagado',
    habilitado: true,
    // Datos del cliente/remitente
    cliente: {
      idCliente: 1,
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '1038648135',
      nombre: 'Santiago',
      apellido: 'Suárez Durán',
      telefono: '3104776919',
      email: 'santiago@gmail.com',
      direccion: 'Cll 45 #20-10',
      ciudad: 'Medellín'
    },
    // Datos del destinatario
    destinatario: {
      nombreDestinatario: 'María López García',
      telefonoDestinatario: '3001234567',
      direccionDestinatario: 'Cra 50 #30-15, Bogotá'
    },
    // Datos del paquete
    paquete: {
      descripcionContenido: 'Ropa y accesorios',
      peso: 2.5,
      alto: 30,
      ancho: 20,
      profundidad: 15,
      valorDeclarado: 150000
    },
    // Ruta
    ruta: {
      idRuta: 1,
      destino: 'Bogotá'
    }
  },
  {
    idEncomiendaVenta: 2,
    numeroGuia: 'EE-2024-000002',
    numeroFactura: 'FACT-002',
    fechaRegistro: '2024-01-16',
    fechaHoraEmision: '2024-01-16T14:20:00',
    fechaEstimadaEntrega: '2024-01-20',
    estado: 'en tránsito',
    observaciones: 'En camino hacia destino',
    valorServicio: 30000,
    impuestos: 3000,
    total: 33000,
    metodoPago: 'transferencia',
    estadoPago: 'pagado',
    habilitado: true,
    cliente: {
      idCliente: 2,
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '1013343818',
      nombre: 'Sebastian',
      apellido: 'Valencia Pérez',
      telefono: '3117772135',
      email: 'sebastian@gmail.com',
      direccion: 'Cra 80 #50-30',
      ciudad: 'Medellín'
    },
    destinatario: {
      nombreDestinatario: 'Carlos Gómez Ruiz',
      telefonoDestinatario: '3209876543',
      direccionDestinatario: 'Av El Poblado #1-20, Cali'
    },
    paquete: {
      descripcionContenido: 'Electrónicos',
      peso: 1.2,
      alto: 20,
      ancho: 15,
      profundidad: 10,
      valorDeclarado: 500000
    },
    ruta: {
      idRuta: 2,
      destino: 'Cali'
    }
  },
  {
    idEncomiendaVenta: 3,
    numeroGuia: 'EE-2024-000003',
    numeroFactura: 'FACT-003',
    fechaRegistro: '2024-01-17',
    fechaHoraEmision: '2024-01-17T09:15:00',
    fechaEstimadaEntrega: '2024-01-22',
    estado: 'pendiente de recogida',
    observaciones: 'Pendiente de recolección',
    valorServicio: 28000,
    impuestos: 2800,
    total: 30800,
    metodoPago: 'Nequi',
    estadoPago: 'pendiente',
    habilitado: true,
    cliente: {
      idCliente: 4,
      tipoIdentificacion: 'NIT',
      numeroIdentificacion: '900123456',
      nombre: 'Carlos',
      apellido: 'Gómez López',
      telefono: '3001234567',
      email: 'carlos@empresa.com',
      direccion: 'Cll 10 #5-40',
      ciudad: 'Bogotá'
    },
    destinatario: {
      nombreDestinatario: 'Ana Martínez Soto',
      telefonoDestinatario: '3158765432',
      direccionDestinatario: 'Cra 65 #12-08, Bucaramanga'
    },
    paquete: {
      descripcionContenido: 'Documentos importantes',
      peso: 0.5,
      alto: 25,
      ancho: 18,
      profundidad: 5,
      valorDeclarado: 100000
    },
    ruta: {
      idRuta: 3,
      destino: 'Bucaramanga'
    }
  },
  {
    idEncomiendaVenta: 4,
    numeroGuia: 'EE-2024-000004',
    numeroFactura: 'FACT-004',
    fechaRegistro: '2024-01-18',
    fechaHoraEmision: '2024-01-18T16:45:00',
    fechaEstimadaEntrega: '2024-01-21',
    estado: 'devuelto',
    observations: 'Paquete devuelto por dirección incorrecta',
    valorServicio: 35000,
    impuestos: 3500,
    total: 38500,
    metodoPago: 'contraentrega',
    estadoPago: 'pagado',
    habilitado: false,
    cliente: {
      idCliente: 5,
      tipoIdentificacion: 'CE',
      numeroIdentificacion: '987654321',
      nombre: 'María',
      apellido: 'Torres Ruiz',
      telefono: '3209876543',
      email: 'maria@gmail.com',
      direccion: 'Cra 50 #30-15',
      ciudad: 'Cali'
    },
    destinatario: {
      nombreDestinatario: 'Pedro Hernández Díaz',
      telefonoDestinatario: '3161234567',
      direccionDestinatario: 'Cll 70 #45-20, Barranquilla'
    },
    paquete: {
      descripcionContenido: 'Libros y cuadernos',
      peso: 3.0,
      alto: 35,
      ancho: 25,
      profundidad: 20,
      valorDeclarado: 80000
    },
    ruta: {
      idRuta: 4,
      destino: 'Barranquilla'
    }
  },
  {
    idEncomiendaVenta: 5,
    numeroGuia: 'EE-2024-000005',
    numeroFactura: 'FACT-005',
    fechaRegistro: '2024-01-19',
    fechaHoraEmision: '2024-01-19T11:00:00',
    fechaEstimadaEntrega: '2024-01-23',
    estado: 'programada',
    observaciones: 'Programada para mañana',
    valorServicio: 20000,
    impuestos: 2000,
    total: 22000,
    metodoPago: 'efectivo',
    estadoPago: 'pagado',
    habilitado: true,
    cliente: {
      idCliente: 7,
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '43210987',
      nombre: 'Luisa',
      apellido: 'Hernández Castro',
      telefono: '3168765432',
      email: 'luisa@gmail.com',
      direccion: 'Cra 65 #12-08',
      ciudad: 'Bucaramanga'
    },
    destinatario: {
      nombreDestinatario: 'Jorge Ramírez Vargas',
      telefonoDestinatario: '3105556789',
      direccionDestinatario: 'Av principal #100-50, Medellín'
    },
    paquete: {
      descripcionContenido: 'Zapatos y ropa',
      peso: 1.8,
      alto: 40,
      ancho: 30,
      profundidad: 25,
      valorDeclarado: 200000
    },
    ruta: {
      idRuta: 1,
      destino: 'Medellín'
    }
  },
  {
    idEncomiendaVenta: 6,
    numeroGuia: 'EE-2024-000006',
    numeroFactura: 'FACT-006',
    fechaRegistro: '2024-01-20',
    fechaHoraEmision: '2024-01-20T13:30:00',
    fechaEstimadaEntrega: '2024-01-24',
    estado: 'en recogida',
    observaciones: 'Conductor en camino a recoger',
    valorServicio: 28000,
    impuestos: 2800,
    total: 30800,
    metodoPago: 'transferencia',
    estadoPago: 'pendiente',
    habilitado: true,
    cliente: {
      idCliente: 1,
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '1038648135',
      nombre: 'Santiago',
      apellido: 'Suárez Durán',
      telefono: '3104776919',
      email: 'santiago@gmail.com',
      direccion: 'Cll 45 #20-10',
      ciudad: 'Medellín'
    },
    destinatario: {
      nombreDestinatario: 'Laura Flores Moreno',
      telefonoDestinatario: '3179876543',
      direccionDestinatario: 'Cll 80 #60-40, Bogotá'
    },
    paquete: {
      descripcionContenido: 'Regalos',
      peso: 2.0,
      alto: 45,
      ancho: 35,
      profundidad: 20,
      valorDeclarado: 250000
    },
    ruta: {
      idRuta: 2,
      destino: 'Bogotá'
    }
  }
]

export const VentaProvider = ({ children }) => {
  const [ventas, setVentas] = useState(ventasIniciales)

  // Generar número de guía único
  const generarNumeroGuia = () => {
    const year = new Date().getFullYear()
    const ultimoId = ventas.length > 0 ? Math.max(...ventas.map(v => v.idEncomiendaVenta)) : 0
    const nuevoNumero = String(ultimoId + 1).padStart(6, '0')
    return `EE-${year}-${nuevoNumero}`
  }

  // Generar número de factura
  const generarNumeroFactura = () => {
    const ultimoId = ventas.length > 0 ? Math.max(...ventas.map(v => v.idEncomiendaVenta)) : 0
    return `FACT-${String(ultimoId + 1).padStart(3, '0')}`
  }

  // Agregar una nueva venta
  const agregarVenta = (nuevaVenta) => {
    const nuevoId = ventas.length > 0 ? Math.max(...ventas.map(v => v.idEncomiendaVenta)) + 1 : 1
    const fechaActual = new Date().toISOString().split('T')[0]
    
    const ventaCompleta = {
      ...nuevaVenta,
      idEncomiendaVenta: nuevoId,
      numeroGuia: generarNumeroGuia(),
      numeroFactura: generarNumeroFactura(),
      fechaRegistro: fechaActual,
      fechaHoraEmision: new Date().toISOString(),
      estado: 'pendiente de recogida',
      estadoPago: nuevaVenta.metodoPago === 'contraentrega' ? 'pendiente' : 'pagado',
      habilitado: true
    }
    
    setVentas(prev => [...prev, ventaCompleta])
    return ventaCompleta
  }

  // Actualizar una venta
  const actualizarVenta = (ventaActualizada) => {
    setVentas(prev =>
      prev.map(v =>
        v.idEncomiendaVenta === ventaActualizada.idEncomiendaVenta ? ventaActualizada : v
      )
    )
  }

  // Cambiar estado de la encomienda
  const cambiarEstadoVenta = (id, nuevoEstado) => {
    setVentas(prev =>
      prev.map(v =>
        v.idEncomiendaVenta === id ? { ...v, estado: nuevoEstado } : v
      )
    )
  }

  // Cambiar estado de pago
  const cambiarEstadoPago = (id, nuevoEstadoPago) => {
    setVentas(prev =>
      prev.map(v =>
        v.idEncomiendaVenta === id ? { ...v, estadoPago: nuevoEstadoPago } : v
      )
    )
  }

  // Habilitar/Inhabilitar venta (toggle)
  const invalidateVenta = (id) => {
    setVentas(prev =>
      prev.map(v =>
        v.idEncomiendaVenta === id ? { ...v, habilitado: !v.habilitado } : v
      )
    )
  }

  // Obtener una venta por ID
  const obtenerVentaPorId = (id) => {
    return ventas.find(v => v.idEncomiendaVenta === parseInt(id))
  }

  return (
    <VentaContext.Provider value={{
      ventas,
      agregarVenta,
      actualizarVenta,
      cambiarEstadoVenta,
      cambiarEstadoPago,
      invalidateVenta,
      obtenerVentaPorId,
      ESTADOS_ENCOMIENDA,
      METODOS_PAGO,
      ESTADOS_PAGO
    }}>
      {children}
    </VentaContext.Provider>
  )
}

export default VentaContext