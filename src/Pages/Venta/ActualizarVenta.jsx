import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Autocomplete } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import { useVentas } from '../../Context/VentaContext'
import { useClientes } from '../../Context/ClienteContext'
import * as ventaService from '../../services/ventaService'
import { FormField, FormSelect, formFieldStyles } from '../../Components/FormularioEstandarizado'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const getEstadoColor = (estado) => {
    switch (estado) {
        case 'pendiente de recogida': return { bg: '#FEF3C7', color: '#92400E' }
        case 'en recogida': return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'programada': return { bg: '#E0E7FF', color: '#3730A3' }
        case 'en tránsito': return { bg: '#CFFAFE', color: '#155E75' }
        case 'entregado': return { bg: '#D1FAE5', color: '#065F46' }
        case 'devuelto': return { bg: '#FEE2E2', color: '#991B1B' }
        default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

const getPagoColor = (estadoPago) =>
    estadoPago?.toLowerCase() === 'pagado'
        ? { bg: '#D1FAE5', color: '#065F46' }
        : { bg: '#FEE2E2', color: '#991B1B' }

const steps = ['Remitente', 'Destinatario', 'Paquete', 'Envío', 'Pago', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const ConfirmRowChip = ({ label, value, colors }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            backgroundColor: colors?.bg || '#F3F4F6', 
            color: colors?.color || '#6B7280', 
            px: 1.5, 
            py: 0.3, 
            borderRadius: 10,
            fontWeight: 600,
            fontSize: '0.75rem',
        }}>
            {value || '—'}
        </Box>
    </Box>
)

const ActualizarVenta = () => {
    const { actualizarVenta, cambiarEstadoVenta } = useVentas()
    const { clientes } = useClientes()
    const navigate = useNavigate()
    const { id } = useParams()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [ventaOriginal, setVentaOriginal] = useState(null)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)

    // TODO: reemplazar por datos reales cuando el módulo de Rutas esté listo
    const rutasMock = [
        { idRuta: 1, destino: 'Caucasia', tarifa: 15000 },
        { idRuta: 2, destino: 'El Bagre', tarifa: 20000 },
        { idRuta: 3, destino: 'Nechí', tarifa: 18000 },
        { idRuta: 4, destino: 'Zaragoza', tarifa: 17000 },
        { idRuta: 5, destino: 'Cáceres', tarifa: 16000 },
        { idRuta: 6, destino: 'Tarazá', tarifa: 22000 },
        { idRuta: 7, destino: 'Montería', tarifa: 40000 },
    ]

    const estadosEncomienda = ['pendiente de recogida', 'en recogida', 'programada', 'en tránsito', 'entregado', 'devuelto']
    const [estadoOriginal, setEstadoOriginal] = useState('')

    const [form, setForm] = useState({
        idCliente: '',
        numeroIdentificacion: '',
        nombreRemitente: '',
        apellidoRemitente: '',
        telefonoRemitente: '',
        emailRemitente: '',
        direccionRemitente: '',
        nombreDestinatario: '',
        telefonoDestinatario: '',
        direccionDestinatario: '',
        descripcionContenido: '',
        peso: '',
        alto: '',
        ancho: '',
        profundidad: '',
        valorDeclarado: '',
        idRuta: '',
        destino: '',
        fechaEstimadaEntrega: '',
        observaciones: '',
        estado: '',
        metodoPago: '',
        valorServicio: '',
        impuestos: '',
        total: '',
        estadoPago: '',
    })

    useEffect(() => {
        ventaService.getEncomiendaById(id)
            .then(res => {
                const venta = res.data
                // normalizar arrays → singular
                const destinatario = venta.destinatarios?.[0] || null
                const paquete = venta.paquetes?.[0] || null
                setVentaOriginal(venta)
                setEstadoOriginal(venta.estado || '')
                const datosForm = {
                    idCliente: venta.cliente?.id || venta.idCliente || '',
                    numeroIdentificacion: venta.cliente?.numeroIdentificacion || '',
                    nombreRemitente: venta.cliente?.nombre || '',
                    apellidoRemitente: venta.cliente?.apellido || '',
                    telefonoRemitente: venta.cliente?.telefono || '',
                    emailRemitente: venta.cliente?.email || '',
                    direccionRemitente: venta.cliente?.direccion || '',
                    nombreDestinatario: destinatario?.nombreDestinatario || '',
                    telefonoDestinatario: destinatario?.telefonoDestinatario || '',
                    direccionDestinatario: destinatario?.direccionDestinatario || '',
                    descripcionContenido: paquete?.descripcionContenido || '',
                    peso: paquete?.peso || '',
                    alto: paquete?.alto || '',
                    ancho: paquete?.ancho || '',
                    profundidad: paquete?.profundidad || '',
                    valorDeclarado: paquete?.valorDeclarado || '',
                    idRuta: venta.idRuta || venta.ruta?.idRuta || '',
                    destino: venta.ruta?.destino || venta.ruta?.destino?.nombre || '',
                    fechaEstimadaEntrega: venta.fechaEstimadaEntrega
                        ? venta.fechaEstimadaEntrega.split('T')[0]
                        : '',
                    observaciones: venta.observaciones || '',
                    estado: venta.estado || 'pendiente de recogida',
                    metodoPago: venta.metodoPago || '',
                    valorServicio: venta.valorServicio || '',
                    impuestos: venta.impuestos || '',
                    total: venta.total || '',
                    estadoPago: venta.estadoPago || 'Pendiente',
                }
                setForm(datosForm)
                setFormOriginal(datosForm)
            })
            .catch(() => setApiError('No se pudo cargar la venta. Verifica la conexión.'))
    }, [id])

    const NUMERIC_LIMITS = {
        peso: 9999, alto: 9999, ancho: 9999, profundidad: 9999,
        valorDeclarado: 999999999, valorServicio: 999999999, impuestos: 999999999,
    }

    const handleChange = (e) => {
        let { name, value } = e.target

        // Bloquear valores numéricos fuera de rango
        if (name in NUMERIC_LIMITS && value !== '') {
            const num = parseFloat(value)
            if (!isNaN(num) && (num > NUMERIC_LIMITS[name] || num < 0)) return
        }

        // Solo letras y espacios en campos de nombre
        if (['nombreRemitente', 'apellidoRemitente', 'nombreDestinatario', 'descripcionContenido'].includes(name)) {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        // Solo dígitos en teléfonos e identificación
        if (['telefonoRemitente', 'telefonoDestinatario', 'numeroIdentificacion'].includes(name)) {
            value = value.replace(/[^0-9]/g, '')
        }
        // Solo letras sin tildes, números, puntos, guiones y guiones bajos en el correo
        if (name === 'emailRemitente') {
            value = value.replace(/[^a-zA-Z0-9._-]/g, '')
        }
        // Solo letras sin tildes, números, espacios y caracteres especiales básicos en dirección
        if (name === 'direccionRemitente' || name === 'direccionDestinatario') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#\/']/g, '')
        }
        // Solo letras, números, espacios y caracteres básicos en observaciones
        if (name === 'observaciones') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
        }

        if (name === 'idCliente') {
            const cliente = clientes.find(c => c.idCliente === parseInt(value))
            if (cliente) {
                setForm(prev => ({
                    ...prev,
                    idCliente: value,
                    numeroIdentificacion: cliente.numeroIdentificacion,
                    nombreRemitente: cliente.nombre,
                    apellidoRemitente: cliente.apellido,
                    telefonoRemitente: cliente.telefono,
                    emailRemitente: cliente.email,
                    direccionRemitente: cliente.direccion,
                }))
            }
            return
        }

        if (name === 'idRuta') {
            const ruta = rutasMock.find(r => r.idRuta === parseInt(value))
            if (ruta) {
                const impuestos = Math.round(ruta.tarifa * 0.10)
                setForm(prev => ({
                    ...prev,
                    idRuta: value,
                    destino: ruta.destino,
                    valorServicio: ruta.tarifa,
                    impuestos,
                    total: ruta.tarifa + impuestos,
                }))
            }
            return
        }

        setForm(prev => {
            const updated = { ...prev, [name]: value }
            if (name === 'valorServicio' || name === 'impuestos') {
                const vs = parseFloat(name === 'valorServicio' ? value : prev.valorServicio) || 0
                const imp = parseFloat(name === 'impuestos' ? value : prev.impuestos) || 0
                updated.total = vs + imp
            }
            return updated
        })
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (step === 0) {
            if (!form.idCliente) e.idCliente = 'Selecciona un cliente'
            if (!form.numeroIdentificacion) e.numeroIdentificacion = 'El número de identificación es obligatorio'
            if (!form.nombreRemitente.trim()) e.nombreRemitente = 'El nombre es obligatorio'
            if (!form.apellidoRemitente.trim()) e.apellidoRemitente = 'El apellido es obligatorio'
            if (!form.telefonoRemitente.trim()) e.telefonoRemitente = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefonoRemitente)) e.telefonoRemitente = 'Debe tener 10 dígitos'
            if (!form.emailRemitente.trim()) e.emailRemitente = 'El correo es obligatorio'
            else if (!emailValido.test(form.emailRemitente)) e.emailRemitente = 'Correo inválido'
            if (!form.direccionRemitente.trim()) e.direccionRemitente = 'La dirección es obligatoria'
        }

        if (step === 1) {
            if (!form.nombreDestinatario.trim()) e.nombreDestinatario = 'El nombre es obligatorio'
            if (!form.telefonoDestinatario.trim()) e.telefonoDestinatario = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefonoDestinatario)) e.telefonoDestinatario = 'Debe tener 10 dígitos'
            if (!form.direccionDestinatario.trim()) e.direccionDestinatario = 'La dirección es obligatoria'
            else if (form.direccionDestinatario.length > 300) e.direccionDestinatario = 'Máximo 300 caracteres'
        }

        if (step === 2) {
            if (!form.descripcionContenido.trim()) e.descripcionContenido = 'La descripción es obligatoria'
            else if (form.descripcionContenido.length > 300) e.descripcionContenido = 'Máximo 300 caracteres'

            const pesoNum = parseFloat(form.peso)
            if (!form.peso) e.peso = 'El peso es obligatorio'
            else if (isNaN(pesoNum) || pesoNum <= 0) e.peso = 'Debe ser un número mayor a 0'
            else if (pesoNum > 9999) e.peso = 'Máximo 9999 kg'

            const altoNum = parseFloat(form.alto)
            if (!form.alto) e.alto = 'El alto es obligatorio'
            else if (isNaN(altoNum) || altoNum <= 0) e.alto = 'Debe ser un número mayor a 0'
            else if (altoNum > 9999) e.alto = 'Máximo 9999 cm'

            const anchoNum = parseFloat(form.ancho)
            if (!form.ancho) e.ancho = 'El ancho es obligatorio'
            else if (isNaN(anchoNum) || anchoNum <= 0) e.ancho = 'Debe ser un número mayor a 0'
            else if (anchoNum > 9999) e.ancho = 'Máximo 9999 cm'

            const profNum = parseFloat(form.profundidad)
            if (!form.profundidad) e.profundidad = 'La profundidad es obligatoria'
            else if (isNaN(profNum) || profNum <= 0) e.profundidad = 'Debe ser un número mayor a 0'
            else if (profNum > 9999) e.profundidad = 'Máximo 9999 cm'

            if (form.valorDeclarado) {
                const vdNum = parseFloat(form.valorDeclarado)
                if (isNaN(vdNum) || vdNum < 0) e.valorDeclarado = 'Debe ser un número positivo'
                else if (vdNum > 999999999) e.valorDeclarado = 'Valor demasiado alto'
            }

            if (form.observaciones && form.observaciones.length > 500) e.observaciones = 'Máximo 500 caracteres'
        }

        if (step === 3) {
            if (!form.fechaEstimadaEntrega) e.fechaEstimadaEntrega = 'La fecha es obligatoria'
        }

        if (step === 4) {
            if (!form.metodoPago) e.metodoPago = 'Selecciona un método de pago'
        }

        return e
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        // Verificar si hubo cambios comparado con los datos originales
        if (formOriginal) {
            const hayCambios = Object.keys(form).some(key => {
                const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
                const actual = form[key] !== undefined ? String(form[key]) : ''
                return original !== actual
            })
            
            if (!hayCambios) {
                setSinCambios(true)
                setActiveStep(5) // Ir al paso de confirmación para mostrar la alerta
                return
            }
        }
        
        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            const numId = parseInt(id)
            const payload = {
                // TODO: habilitar cuando el módulo de rutas esté implementado
                // ...(form.idRuta && { idRuta: parseInt(form.idRuta) }),
                fechaEstimadaEntrega: form.fechaEstimadaEntrega || null,
                observaciones: form.observaciones || null,
                metodoPago: form.metodoPago,
                valorServicio: parseFloat(form.valorServicio) || 0,
                impuestos: parseFloat(form.impuestos) || 0,
                estadoPago: form.estadoPago,
                // Datos del destinatario
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario || null,
                    direccionDestinatario: form.direccionDestinatario || null,
                },
                // Datos del paquete
                paquetes: [{
                    descripcionContenido: form.descripcionContenido || null,
                    peso: form.peso ? parseFloat(form.peso) : null,
                    alto: form.alto ? parseFloat(form.alto) : null,
                    ancho: form.ancho ? parseFloat(form.ancho) : null,
                    profundidad: form.profundidad ? parseFloat(form.profundidad) : null,
                    valorDeclarado: form.valorDeclarado ? parseFloat(form.valorDeclarado) : null,
                }],
            }
            await actualizarVenta(numId, payload)

            // Si el estado cambió, lo actualizamos por separado
            if (form.estado && form.estado !== estadoOriginal) {
                await cambiarEstadoVenta(numId, form.estado).catch(() => null)
            }

            setExito(true)
            setTimeout(() => navigate('/ventas/listar'), 1500)
        } catch (err) {
            setApiError(err.message || 'Error al actualizar la venta.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => navigate('/ventas/listar')

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: 'white',
        overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Autocomplete
                            options={clientes.filter(c => c.habilitado)}
                            getOptionLabel={(option) => `${option.nombre} ${option.apellido} — ${option.numeroIdentificacion}`}
                            value={clientes.find(c => c.idCliente === parseInt(form.idCliente)) || null}
                            onChange={(_, newValue) => {
                                handleChange({ target: { name: 'idCliente', value: newValue ? newValue.idCliente : '' } })
                            }}
                            noOptionsText="No se encontraron clientes"
                            renderInput={(params) => (
                                <TextField {...params} label="Cliente *"
                                    error={!!errores.idCliente} helperText={errores.idCliente}
                                    InputLabelProps={{ shrink: !!form.idCliente }}
                                    sx={formFieldStyles} />
                            )}
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Nombres" name="nombreRemitente" value={form.nombreRemitente}
                                onChange={handleChange} required error={errores.nombreRemitente}
                                helperText={errores.nombreRemitente} icon={PersonOutlinedIcon} />
                            <FormField label="Apellidos" name="apellidoRemitente" value={form.apellidoRemitente}
                                onChange={handleChange} required error={errores.apellidoRemitente}
                                helperText={errores.apellidoRemitente} icon={PersonOutlinedIcon} />
                            <FormField label="Número de identificación" name="numeroIdentificacion" value={form.numeroIdentificacion}
                                onChange={handleChange} required error={errores.numeroIdentificacion}
                                helperText={errores.numeroIdentificacion} icon={BadgeOutlinedIcon} />
                            <FormField label="Teléfono" name="telefonoRemitente" value={form.telefonoRemitente}
                                onChange={handleChange} required error={errores.telefonoRemitente}
                                helperText={errores.telefonoRemitente || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon} />
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormField label="Correo electrónico" name="emailRemitente" type="email" value={form.emailRemitente}
                                    onChange={handleChange} required error={errores.emailRemitente}
                                    helperText={errores.emailRemitente} icon={EmailOutlinedIcon} />
                            </Box>
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormField label="Dirección" name="direccionRemitente" value={form.direccionRemitente}
                                    onChange={handleChange} required error={errores.direccionRemitente}
                                    helperText={errores.direccionRemitente} icon={HomeOutlinedIcon} />
                            </Box>
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                            onChange={handleChange} required error={errores.nombreDestinatario}
                            helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon} />
                        <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                            onChange={handleChange} required error={errores.telefonoDestinatario}
                            helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon} />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                                onChange={handleChange} required error={errores.direccionDestinatario}
                                helperText={errores.direccionDestinatario} icon={HomeOutlinedIcon} multiline rows={2} />
                        </Box>
                    </Box>
                )
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormField label="Descripción del contenido" name="descripcionContenido" value={form.descripcionContenido}
                            onChange={handleChange} required error={errores.descripcionContenido}
                            helperText={errores.descripcionContenido || `${(form.descripcionContenido || '').length}/300`}
                            multiline rows={2} inputProps={{ maxLength: 300 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                            <FormField label="Peso (kg)" name="peso" type="number" value={form.peso}
                                onChange={handleChange} required error={errores.peso}
                                helperText={errores.peso || 'Ej: 1.5'}
                                inputProps={{ min: 0.01, max: 9999, step: 0.01 }} />
                            <FormField label="Alto (cm)" name="alto" type="number" value={form.alto}
                                onChange={handleChange} required error={errores.alto}
                                helperText={errores.alto || 'Ej: 30'}
                                inputProps={{ min: 1, max: 9999, step: 1 }} />
                            <FormField label="Ancho (cm)" name="ancho" type="number" value={form.ancho}
                                onChange={handleChange} required error={errores.ancho}
                                helperText={errores.ancho || 'Ej: 20'}
                                inputProps={{ min: 1, max: 9999, step: 1 }} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Profundidad (cm)" name="profundidad" type="number" value={form.profundidad}
                                onChange={handleChange} required error={errores.profundidad}
                                helperText={errores.profundidad || 'Ej: 15'}
                                inputProps={{ min: 1, max: 9999, step: 1 }} />
                            <FormField label="Valor declarado ($)" name="valorDeclarado" type="number" value={form.valorDeclarado}
                                onChange={handleChange} helperText={errores.valorDeclarado || 'Opcional'}
                                error={errores.valorDeclarado}
                                inputProps={{ min: 0, max: 999999999, step: 1 }} />
                        </Box>
                    </Box>
                )
            case 3:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormSelect label="Destino" name="idRuta" value={form.idRuta}
                                onChange={handleChange} required error={errores.idRuta}>
                                {rutasMock.map(r => (
                                    <MenuItem key={r.idRuta} value={r.idRuta}>
                                        {r.destino} — ${r.tarifa.toLocaleString()}
                                    </MenuItem>
                                ))}
                            </FormSelect>
                            <TextField fullWidth label="Fecha estimada de entrega" name="fechaEstimadaEntrega"
                                type="date" value={form.fechaEstimadaEntrega} onChange={handleChange} required
                                error={!!errores.fechaEstimadaEntrega} helperText={errores.fechaEstimadaEntrega}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={formFieldStyles} />
                            <FormSelect label="Estado de la encomienda" name="estado" value={form.estado} onChange={handleChange}>
                                {estadosEncomienda.map(e => {
                                    const styles = getEstadoColor(e)
                                    return (
                                        <MenuItem key={e} value={e}>
                                            <Box sx={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center',
                                                backgroundColor: styles.bg, 
                                                color: styles.color, 
                                                px: 1.5, 
                                                py: 0.3, 
                                                borderRadius: 10,
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                            }}>
                                                {e.charAt(0).toUpperCase() + e.slice(1)}
                                            </Box>
                                        </MenuItem>
                                    )
                                })}
                            </FormSelect>
                        </Box>
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange} multiline rows={2}
                            helperText={errores.observaciones || `Opcional ${(form.observaciones || '').length}/500`}
                            error={errores.observaciones}
                            inputProps={{ maxLength: 500 }} />
                    </Box>
                )
            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormSelect label="Método de pago" name="metodoPago" value={form.metodoPago}
                                onChange={handleChange} required error={errores.metodoPago}>
                                <MenuItem value="Contraentrega">Contraentrega</MenuItem>
                                <MenuItem value="Efectivo">Efectivo</MenuItem>
                                <MenuItem value="Transferencia">Transferencia</MenuItem>
                                <MenuItem value="Nequi">Nequi</MenuItem>
                            </FormSelect>
                            <FormSelect label="Estado de pago" name="estadoPago" value={form.estadoPago} onChange={handleChange}>
                                <MenuItem value="Pendiente">
                                    <Box sx={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center',
                                        backgroundColor: '#FEE2E2', 
                                        color: '#991B1B', 
                                        px: 1.5, 
                                        py: 0.3, 
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                    }}>
                                        Pendiente
                                    </Box>
                                </MenuItem>
                                <MenuItem value="Pagado">
                                    <Box sx={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center',
                                        backgroundColor: '#D1FAE5', 
                                        color: '#065F46', 
                                        px: 1.5, 
                                        py: 0.3, 
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                    }}>
                                        Pagado
                                    </Box>
                                </MenuItem>
                            </FormSelect>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                            <FormField label="Valor del servicio ($)" name="valorServicio" type="number"
                                value={form.valorServicio} onChange={handleChange}
                                inputProps={{ min: 0, step: 1 }} />
                            <FormField label="Impuestos ($)" name="impuestos" type="number"
                                value={form.impuestos} onChange={handleChange}
                                inputProps={{ min: 0, step: 1 }} />
                            <FormField label="Total a pagar ($)" name="total" type="number"
                                value={form.total} onChange={handleChange} disabled={true} />
                        </Box>
                    </Box>
                )
            case 5:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {sinCambios && (
                            <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                                No has realizado ningún cambio. Los datos ya están actualizados.
                            </Alert>
                        )}
                        {apiError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Remitente</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información del remitente</Typography>
                                <ConfirmRow label="Nombre" value={`${form.nombreRemitente} ${form.apellidoRemitente}`} />
                                <ConfirmRow label="Identificación" value={form.numeroIdentificacion} />
                                <ConfirmRow label="Teléfono" value={form.telefonoRemitente} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Destinatario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información del destinatario</Typography>
                                <ConfirmRow label="Nombre" value={form.nombreDestinatario} />
                                <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} />
                                <ConfirmRow label="Dirección" value={form.direccionDestinatario} />
                            </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Paquete</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica los datos del paquete</Typography>
                                <ConfirmRow label="Contenido" value={form.descripcionContenido} />
                                <ConfirmRow label="Peso" value={form.peso ? `${form.peso} kg` : null} />
                                <ConfirmRow label="Dimensiones" value={form.alto ? `${form.alto}×${form.ancho}×${form.profundidad} cm` : null} />
                                <ConfirmRow label="Valor declarado" value={form.valorDeclarado ? `$${parseFloat(form.valorDeclarado).toLocaleString()}` : '$0'} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PaymentOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Envío y Pago</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Destino, estado y valores</Typography>
                                <ConfirmRow label="Destino" value={form.destino} />
                                <ConfirmRow label="Fecha entrega" value={form.fechaEstimadaEntrega} />
                                <ConfirmRowChip label="Estado" value={form.estado?.charAt(0).toUpperCase() + form.estado?.slice(1)} colors={getEstadoColor(form.estado)} />
                                <ConfirmRow label="Método de pago" value={form.metodoPago} />
                                <ConfirmRowChip label="Estado de pago" value={form.estadoPago} colors={getPagoColor(form.estadoPago)} />
                                <ConfirmRow label="Total" value={form.total ? `$${parseFloat(form.total).toLocaleString()}` : null} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default:
                return null
        }
    }

    if (!ventaOriginal && !apiError) {
        return (
            <Box sx={{ p: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <Typography color={COLORS.textMuted}>Cargando datos de la venta...</Typography>
            </Box>
        )
    }

    if (!ventaOriginal && apiError) {
        return (
            <Box sx={{ p: 3.5 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} color={COLORS.text}>Editar Venta</Typography>
                <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                    {ventaOriginal?.numeroGuia
                        ? `Modificando guía: ${ventaOriginal.numeroGuia}`
                        : 'Modifica los campos que necesites.'
                    }
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                {/* ── Stepper ── */}
                <Box sx={{ px: 4, pt: 3.5, pb: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
                    <Stepper activeStep={activeStep} alternativeLabel
                        sx={{
                            '& .MuiStepIcon-root': { color: '#E0E0E0' },
                            '& .MuiStepIcon-root.Mui-active': { color: COLORS.primary },
                            '& .MuiStepIcon-root.Mui-completed': { color: COLORS.primary },
                            '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
                            '& .MuiStepConnector-line': { borderColor: COLORS.border },
                            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: COLORS.primary },
                            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: COLORS.primary },
                            '& .MuiStepLabel-label': { fontSize: '0.8rem', color: COLORS.textMuted, mt: 0.5 },
                            '& .MuiStepLabel-label.Mui-active': { color: COLORS.text, fontWeight: 600 },
                            '& .MuiStepLabel-label.Mui-completed': { color: COLORS.primary, fontWeight: 500 },
                        }}
                    >
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                </Box>

                {/* ── Contenido ── */}
                <Box sx={{ px: 4, py: 3.5 }}>
                    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>

                {/* ── Botones ── */}
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    px: 4, py: 2.5, borderTop: `1px solid ${COLORS.border}`, backgroundColor: '#FAFAFA',
                }}>
                    <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                        startIcon={<ArrowBackOutlinedIcon />} disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, borderColor: COLORS.border,
                            color: COLORS.text, fontWeight: 500,
                            '&:hover': { borderColor: '#BDBDBD', backgroundColor: COLORS.hoverBg },
                            '&.Mui-disabled': { borderColor: COLORS.border, color: COLORS.textMuted },
                        }}>
                        Anterior
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Button onClick={handleCancelar} disableRipple
                            sx={{
                                textTransform: 'none', color: COLORS.textMuted, fontWeight: 500, borderRadius: 2,
                                '&:hover': { backgroundColor: COLORS.hoverBg, color: COLORS.text },
                            }}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                            variant="contained"
                            disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                                '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
                            }}>
                            {activeStep < steps.length - 1
                                ? 'Siguiente'
                                : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'
                            }
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" sx={{ fontWeight: 600 }}>
                    ¡Venta actualizada exitosamente!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ActualizarVenta
