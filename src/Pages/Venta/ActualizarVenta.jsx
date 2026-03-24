import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, Grid, MenuItem, Stepper, Step, StepLabel } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import InventoryIcon from '@mui/icons-material/Inventory'
import PaymentIcon from '@mui/icons-material/Payment'
import { useVentas } from '../../Context/VentaContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const steps = ['Datos del Remitente', 'Datos del Destinatario', 'Características del Paquete', 'Datos del Envío', 'Datos del Pago', 'Confirmación']

const ActualizarVenta = () => {
  const { obtenerVentaPorId, actualizarVenta } = useVentas()
  const navigate = useNavigate()
  const { id } = useParams()
  const [exito, setExito] = useState(false)
  const [errores, setErrores] = useState({})
  const [activeStep, setActiveStep] = useState(0)
  const [ventaOriginal, setVentaOriginal] = useState(null)

  // Datos quemados para selects
  const clientesMock = [
    { id: 1, nombre: 'Santiago Suárez Durán', identificacion: '1038648135', telefono: '3101234567', email: 'santiago@email.com', direccion: 'Calle 45 #20-10', ciudad: 'Bogotá' },
    { id: 2, nombre: 'Sebastian Valencia Pérez', identificacion: '1013343818', telefono: '3202345678', email: 'sebastian@email.com', direccion: 'Carrera 30 #15-22', ciudad: 'Medellín' },
    { id: 3, nombre: 'Valeria Paz Arana', identificacion: '1106634727', telefono: '3103456789', email: 'valeria@email.com', direccion: 'Avenida 50 #25-30', ciudad: 'Cali' },
    { id: 4, nombre: 'Carlos Gómez López', identificacion: '900123456', telefono: '3004567890', email: 'carlos@empresa.com', direccion: 'Calle 10 #5-15', ciudad: 'Barranquilla' },
    { id: 5, nombre: 'María Torres Ruiz', identificacion: '987654321', telefono: '3105678901', email: 'maria@email.com', direccion: 'Carrera 20 #8-40', ciudad: 'Bucaramanga' },
  ]

  const rutasMock = [
    { idRuta: 1, destino: 'Medellín', tarifa: 25000 },
    { idRuta: 2, destino: 'Bogotá', tarifa: 20000 },
    { idRuta: 3, destino: 'Cali', tarifa: 30000 },
    { idRuta: 4, destino: 'Barranquilla', tarifa: 35000 },
    { idRuta: 5, destino: 'Bucaramanga', tarifa: 28000 },
  ]

  const estadosEncomienda = ['pendiente de recogida', 'en recogida', 'programada', 'en tránsito', 'entregado', 'devuelto']
  const metodosPago = ['contraentrega', 'efectivo', 'transferencia', 'Nequi']
  const estadosPago = ['pendiente', 'pagado']

  const [form, setForm] = useState({
    // Cliente/Remitente
    idCliente: '',
    numeroIdentificacion: '',
    nombreRemitente: '',
    apellidoRemitente: '',
    telefonoRemitente: '',
    emailRemitente: '',
    direccionRemitente: '',
    ciudadRemitente: '',
    // Destinatario
    nombreDestinatario: '',
    telefonoDestinatario: '',
    direccionDestinatario: '',
    // Paquete
    descripcionContenido: '',
    peso: '',
    alto: '',
    ancho: '',
    profundidad: '',
    valorDeclarado: '',
    // Envío
    idRuta: '',
    destino: '',
    fechaEstimadaEntrega: '',
    observaciones: '',
    estado: '',
    // Pago
    metodoPago: '',
    valorServicio: '',
    impuestos: '',
    total: '',
    estadoPago: '',
  })

  // Cargar datos de la venta al iniciar
  useEffect(() => {
    const venta = obtenerVentaPorId(id)
    if (venta) {
      setVentaOriginal(venta)
      setForm({
        idCliente: venta.cliente?.idCliente || '',
        numeroIdentificacion: venta.cliente?.numeroIdentificacion || '',
        nombreRemitente: venta.cliente?.nombre || '',
        apellidoRemitente: venta.cliente?.apellido || '',
        telefonoRemitente: venta.cliente?.telefono || '',
        emailRemitente: venta.cliente?.email || '',
        direccionRemitente: venta.cliente?.direccion || '',
        ciudadRemitente: venta.cliente?.ciudad || '',
        nombreDestinatario: venta.destinatario?.nombreDestinatario || '',
        telefonoDestinatario: venta.destinatario?.telefonoDestinatario || '',
        direccionDestinatario: venta.destinatario?.direccionDestinatario || '',
        descripcionContenido: venta.paquete?.descripcionContenido || '',
        peso: venta.paquete?.peso || '',
        alto: venta.paquete?.alto || '',
        ancho: venta.paquete?.ancho || '',
        profundidad: venta.paquete?.profundidad || '',
        valorDeclarado: venta.paquete?.valorDeclarado || '',
        idRuta: venta.ruta?.idRuta || '',
        destino: venta.ruta?.destino || '',
        fechaEstimadaEntrega: venta.fechaEstimadaEntrega || '',
        observaciones: venta.observaciones || '',
        estado: venta.estado || 'pendiente de recogida',
        metodoPago: venta.metodoPago || '',
        valorServicio: venta.valorServicio || '',
        impuestos: venta.impuestos || '',
        total: venta.total || '',
        estadoPago: venta.estadoPago || 'pendiente',
      })
    }
  }, [id, obtenerVentaPorId])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Si cambia el cliente, cargar sus datos
    if (name === 'idCliente') {
      const cliente = clientesMock.find(c => c.id === parseInt(value))
      if (cliente) {
        setForm(prev => ({
          ...prev,
          idCliente: value,
          numeroIdentificacion: cliente.identificacion,
          nombreRemitente: cliente.nombre.split(' ')[0],
          apellidoRemitente: cliente.nombre.split(' ').slice(1).join(' '),
          telefonoRemitente: cliente.telefono,
          emailRemitente: cliente.email,
          direccionRemitente: cliente.direccion,
          ciudadRemitente: cliente.ciudad,
        }))
      }
      return
    }

    // Si cambia la ruta, actualizar destino y tarifa
    if (name === 'idRuta') {
      const ruta = rutasMock.find(r => r.idRuta === parseInt(value))
      if (ruta) {
        const tarifaBase = ruta.tarifa
        const impuestos = Math.round(tarifaBase * 0.10)
        setForm(prev => ({
          ...prev,
          idRuta: value,
          destino: ruta.destino,
          valorServicio: tarifaBase,
          impuestos: impuestos,
          total: tarifaBase + impuestos,
        }))
      }
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validarPaso = (step) => {
    const e = {}
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (step === 0) { // Datos del Remitente
      if (!form.idCliente) e.idCliente = 'Selecciona un cliente'
      if (!form.nombreRemitente.trim()) e.nombreRemitente = 'El nombre es obligatorio'
      if (!form.apellidoRemitente.trim()) e.apellidoRemitente = 'El apellido es obligatorio'
      if (!form.telefonoRemitente.trim()) e.telefonoRemitente = 'El teléfono es obligatorio'
      else if (!/^\d{10}$/.test(form.telefonoRemitente)) e.telefonoRemitente = 'El teléfono debe tener 10 dígitos'
      if (!form.emailRemitente.trim()) e.emailRemitente = 'El correo es obligatorio'
      else if (!emailValido.test(form.emailRemitente)) e.emailRemitente = 'Correo inválido'
      if (!form.direccionRemitente.trim()) e.direccionRemitente = 'La dirección es obligatoria'
      if (!form.ciudadRemitente.trim()) e.ciudadRemitente = 'La ciudad es obligatoria'
    }

    if (step === 1) { // Datos del Destinatario
      if (!form.nombreDestinatario.trim()) e.nombreDestinatario = 'El nombre del destinatario es obligatorio'
      if (!form.telefonoDestinatario.trim()) e.telefonoDestinatario = 'El teléfono del destinatario es obligatorio'
      else if (!/^\d{10}$/.test(form.telefonoDestinatario)) e.telefonoDestinatario = 'El teléfono debe tener 10 dígitos'
      if (!form.direccionDestinatario.trim()) e.direccionDestinatario = 'La dirección del destinatario es obligatoria'
    }

    if (step === 2) { // Características del Paquete
      if (!form.descripcionContenido.trim()) e.descripcionContenido = 'La descripción del contenido es obligatoria'
      if (!form.peso) e.peso = 'El peso es obligatorio'
      if (!form.alto) e.alto = 'El alto es obligatorio'
      if (!form.ancho) e.ancho = 'El ancho es obligatorio'
      if (!form.profundidad) e.profundidad = 'La profundidad es obligatoria'
    }

    if (step === 3) { // Datos del Envío
      if (!form.idRuta) e.idRuta = 'Selecciona un destino'
      if (!form.fechaEstimadaEntrega) e.fechaEstimadaEntrega = 'La fecha estimada es obligatoria'
    }

    if (step === 4) { // Datos del Pago
      if (!form.metodoPago) e.metodoPago = 'Selecciona un método de pago'
    }

    return e
  }

  const validar = () => {
    const e = {}
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.idCliente) e.idCliente = 'Selecciona un cliente'
    if (!form.nombreRemitente.trim()) e.nombreRemitente = 'El nombre es obligatorio'
    if (!form.apellidoRemitente.trim()) e.apellidoRemitente = 'El apellido es obligatorio'
    if (!form.telefonoRemitente.trim()) e.telefonoRemitente = 'El teléfono es obligatorio'
    else if (!/^\d{10}$/.test(form.telefonoRemitente)) e.telefonoRemitente = 'El teléfono debe tener 10 dígitos'
    if (!form.emailRemitente.trim()) e.emailRemitente = 'El correo es obligatorio'
    else if (!emailValido.test(form.emailRemitente)) e.emailRemitente = 'Correo inválido'
    if (!form.direccionRemitente.trim()) e.direccionRemitente = 'La dirección es obligatoria'
    if (!form.ciudadRemitente.trim()) e.ciudadRemitente = 'La ciudad es obligatoria'

    if (!form.nombreDestinatario.trim()) e.nombreDestinatario = 'El nombre del destinatario es obligatorio'
    if (!form.telefonoDestinatario.trim()) e.telefonoDestinatario = 'El teléfono del destinatario es obligatorio'
    else if (!/^\d{10}$/.test(form.telefonoDestinatario)) e.telefonoDestinatario = 'El teléfono debe tener 10 dígitos'
    if (!form.direccionDestinatario.trim()) e.direccionDestinatario = 'La dirección del destinatario es obligatoria'

    if (!form.descripcionContenido.trim()) e.descripcionContenido = 'La descripción del contenido es obligatoria'
    if (!form.peso) e.peso = 'El peso es obligatorio'
    if (!form.alto) e.alto = 'El alto es obligatorio'
    if (!form.ancho) e.ancho = 'El ancho es obligatorio'
    if (!form.profundidad) e.profundidad = 'La profundidad es obligatoria'

    if (!form.idRuta) e.idRuta = 'Selecciona un destino'
    if (!form.fechaEstimadaEntrega) e.fechaEstimadaEntrega = 'La fecha estimada es obligatoria'

    if (!form.metodoPago) e.metodoPago = 'Selecciona un método de pago'

    return e
  }

  const handleNext = () => {
    const erroresEncontrados = validarPaso(activeStep)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    const erroresEncontrados = validar()

    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    // Crear objeto de venta actualizado
    const ventaActualizada = {
      ...ventaOriginal,
      numeroGuia: ventaOriginal?.numeroGuia,
      numeroFactura: ventaOriginal?.numeroFactura,
      fechaRegistro: ventaOriginal?.fechaRegistro,
      fechaHoraEmision: ventaOriginal?.fechaHoraEmision,
      cliente: {
        idCliente: parseInt(form.idCliente),
        tipoIdentificacion: 'CC',
        numeroIdentificacion: form.numeroIdentificacion,
        nombre: form.nombreRemitente,
        apellido: form.apellidoRemitente,
        telefono: form.telefonoRemitente,
        email: form.emailRemitente,
        direccion: form.direccionRemitente,
        ciudad: form.ciudadRemitente
      },
      destinatario: {
        nombreDestinatario: form.nombreDestinatario,
        telefonoDestinatario: form.telefonoDestinatario,
        direccionDestinatario: form.direccionDestinatario
      },
      paquete: {
        descripcionContenido: form.descripcionContenido,
        peso: parseFloat(form.peso),
        alto: parseFloat(form.alto),
        ancho: parseFloat(form.ancho),
        profundidad: parseFloat(form.profundidad),
        valorDeclarado: form.valorDeclarado ? parseFloat(form.valorDeclarado) : 0
      },
      ruta: {
        idRuta: parseInt(form.idRuta),
        destino: form.destino
      },
      fechaEstimadaEntrega: form.fechaEstimadaEntrega,
      observaciones: form.observaciones,
      estado: form.estado,
      metodoPago: form.metodoPago,
      valorServicio: parseFloat(form.valorServicio),
      impuestos: parseFloat(form.impuestos),
      total: parseFloat(form.total),
      estadoPago: form.estadoPago,
      habilitado: ventaOriginal?.habilitado
    }

    actualizarVenta(ventaActualizada)
    setExito(true)
    setTimeout(() => navigate('/ventas/listar'), 1500)
  }

  const handleCancelar = () => {
    navigate('/ventas/listar')
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Datos del Remitente
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Datos del Remitente
            </Typography>
            
            <FormSelect
              label="Cliente"
              name="idCliente"
              value={form.idCliente}
              onChange={handleChange}
              required
              error={errores.idCliente}
            >
              <MenuItem value="">Seleccione un cliente</MenuItem>
              {clientesMock.map(cliente => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.identificacion}
                </MenuItem>
              ))}
            </FormSelect>

            <FormField
              label="Número de identificación"
              name="numeroIdentificacion"
              value={form.numeroIdentificacion}
              onChange={handleChange}
              required
              error={errores.numeroIdentificacion}
            />

            <FormField
              label="Nombres"
              name="nombreRemitente"
              value={form.nombreRemitente}
              onChange={handleChange}
              required
              error={errores.nombreRemitente}
              icon={PersonIcon}
            />

            <FormField
              label="Apellidos"
              name="apellidoRemitente"
              value={form.apellidoRemitente}
              onChange={handleChange}
              required
              error={errores.apellidoRemitente}
              icon={PersonIcon}
            />

            <FormField
              label="Teléfono"
              name="telefonoRemitente"
              value={form.telefonoRemitente}
              onChange={handleChange}
              required
              error={errores.telefonoRemitente}
              helperText="Número de 10 dígitos"
            />

            <FormField
              label="Correo electrónico"
              name="emailRemitente"
              type="email"
              value={form.emailRemitente}
              onChange={handleChange}
              required
              error={errores.emailRemitente}
            />

            <FormField
              label="Dirección"
              name="direccionRemitente"
              value={form.direccionRemitente}
              onChange={handleChange}
              required
              error={errores.direccionRemitente}
            />

            <FormField
              label="Ciudad"
              name="ciudadRemitente"
              value={form.ciudadRemitente}
              onChange={handleChange}
              required
              error={errores.ciudadRemitente}
            />
          </FormFieldsContainer>
        )
      case 1: // Datos del Destinatario
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Datos del Destinatario
            </Typography>

            <FormField
              label="Nombre completo"
              name="nombreDestinatario"
              value={form.nombreDestinatario}
              onChange={handleChange}
              required
              error={errores.nombreDestinatario}
              icon={PersonIcon}
            />

            <FormField
              label="Teléfono"
              name="telefonoDestinatario"
              value={form.telefonoDestinatario}
              onChange={handleChange}
              required
              error={errores.telefonoDestinatario}
              helperText="Número de 10 dígitos"
            />

            <FormField
              label="Dirección de entrega"
              name="direccionDestinatario"
              value={form.direccionDestinatario}
              onChange={handleChange}
              required
              error={errores.direccionDestinatario}
              multiline
              rows={2}
            />
          </FormFieldsContainer>
        )
      case 2: // Características del Paquete
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Características del Paquete
            </Typography>

            <FormField
              label="Descripción del contenido"
              name="descripcionContenido"
              value={form.descripcionContenido}
              onChange={handleChange}
              required
              error={errores.descripcionContenido}
              multiline
              rows={2}
            />

            <FormField
              label="Peso (kg)"
              name="peso"
              type="number"
              value={form.peso}
              onChange={handleChange}
              required
              error={errores.peso}
              placeholder="0.0"
            />

            <FormField
              label="Alto (cm)"
              name="alto"
              type="number"
              value={form.alto}
              onChange={handleChange}
              required
              error={errores.alto}
              placeholder="0"
            />

            <FormField
              label="Ancho (cm)"
              name="ancho"
              type="number"
              value={form.ancho}
              onChange={handleChange}
              required
              error={errores.ancho}
              placeholder="0"
            />

            <FormField
              label="Profundidad (cm)"
              name="profundidad"
              type="number"
              value={form.profundidad}
              onChange={handleChange}
              required
              error={errores.profundidad}
              placeholder="0"
            />

            <FormField
              label="Valor declarado ($)"
              name="valorDeclarado"
              type="number"
              value={form.valorDeclarado}
              onChange={handleChange}
              placeholder="0"
            />
          </FormFieldsContainer>
        )
      case 3: // Datos del Envío
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Datos del Envío
            </Typography>

            <FormSelect
              label="Destino"
              name="idRuta"
              value={form.idRuta}
              onChange={handleChange}
              required
              error={errores.idRuta}
            >
              <MenuItem value="">Seleccione un destino</MenuItem>
              {rutasMock.map(ruta => (
                <MenuItem key={ruta.idRuta} value={ruta.idRuta}>
                  {ruta.destino} - ${ruta.tarifa.toLocaleString()}
                </MenuItem>
              ))}
            </FormSelect>

            <FormField
              label="Fecha estimada de entrega"
              name="fechaEstimadaEntrega"
              type="date"
              value={form.fechaEstimadaEntrega}
              onChange={handleChange}
              required
              error={errores.fechaEstimadaEntrega}
            />

            <FormSelect
              label="Estado de la encomienda"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              required
            >
              {estadosEncomienda.map(estado => (
                <MenuItem key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </MenuItem>
              ))}
            </FormSelect>

            <FormField
              label="Observaciones"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="Observaciones adicionales sobre el envío"
            />
          </FormFieldsContainer>
        )
      case 4: // Datos del Pago
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Datos del Pago
            </Typography>

            <FormSelect
              label="Método de pago"
              name="metodoPago"
              value={form.metodoPago}
              onChange={handleChange}
              required
              error={errores.metodoPago}
            >
              <MenuItem value="">Seleccione método de pago</MenuItem>
              {metodosPago.map(mp => (
                <MenuItem key={mp} value={mp}>
                  {mp.charAt(0).toUpperCase() + mp.slice(1)}
                </MenuItem>
              ))}
            </FormSelect>

            <FormSelect
              label="Estado de pago"
              name="estadoPago"
              value={form.estadoPago}
              onChange={handleChange}
              required
            >
              {estadosPago.map(ep => (
                <MenuItem key={ep} value={ep}>
                  {ep.charAt(0).toUpperCase() + ep.slice(1)}
                </MenuItem>
              ))}
            </FormSelect>

            <FormField
              label="Valor del servicio"
              name="valorServicio"
              type="number"
              value={form.valorServicio}
              onChange={handleChange}
              disabled
            />

            <FormField
              label="Impuestos (10%)"
              name="impuestos"
              type="number"
              value={form.impuestos}
              onChange={handleChange}
              disabled
            />

            <FormField
              label="Total"
              name="total"
              type="number"
              value={form.total}
              onChange={handleChange}
              disabled
            />
          </FormFieldsContainer>
        )
      case 5: // Confirmación
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Confirmar Información
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                backgroundColor: '#fafafa', 
                borderRadius: 2,
                border: `1px solid ${theme.primary}30`
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 600, borderBottom: '1px solid #e2e8f0', pb: 1 }}>
                  Datos del Remitente
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Nombre:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.nombreRemitente || 'No especificado'} {form.apellidoRemitente}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Identificación:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.numeroIdentificacion || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Teléfono:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.telefonoRemitente || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Ciudad:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.ciudadRemitente || 'No especificado'}</Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 600, borderBottom: '1px solid #e2e8f0', pb: 1, mt: 1 }}>
                  Datos del Destinatario
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Nombre:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.nombreDestinatario || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Dirección:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.direccionDestinatario || 'No especificado'}</Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 600, borderBottom: '1px solid #e2e8f0', pb: 1, mt: 1 }}>
                  Datos del Envío
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Destino:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.destino || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Estado:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.estado || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Fecha de entrega:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.fechaEstimadaEntrega || 'No especificado'}</Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 600, borderBottom: '1px solid #e2e8f0', pb: 1, mt: 1 }}>
                  Datos del Pago
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Método de pago:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.metodoPago || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Estado de pago:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.estadoPago || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Total a pagar:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>${form.total ? form.total.toLocaleString() : '0'}</Typography>
                </Box>
              </Box>
            </Paper>
          </FormFieldsContainer>
        )
      default:
        return null
    }
  }

  if (!ventaOriginal) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Cargando datos de la venta...</Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          maxWidth: 900, 
          mx: 'auto',
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Título */}
        <FormHeader 
          icon={EditIcon} 
          title="Actualizar Venta / Encomienda" 
          subtitle={`Editando guía: ${ventaOriginal?.numeroGuia}`}
        />

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontWeight: activeStep === index ? 600 : 400,
                    color: activeStep === index ? theme.primary : '#64748b'
                  } 
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderStepContent()}
        </Box>

        {/* Botones */}
        <FormButtonGroup justify="space-between">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton 
              onClick={handleBack} 
              disabled={activeStep === 0}
              children="Anterior"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton 
              onClick={handleCancelar}
              children="Cancelar"
            />
            {activeStep < steps.length - 1 ? (
              <PrimaryButton 
                onClick={handleNext}
                children="Siguiente"
              />
            ) : (
              <PrimaryButton 
                onClick={handleSubmit}
                children="Actualizar"
              />
            )}
          </Box>
        </FormButtonGroup>
      </Paper>
    </Box>
  )
}

export default ActualizarVenta