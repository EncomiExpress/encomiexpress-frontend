import theme from '../../../shared/styles/theme.js'
import { useState, useEffect } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
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
import CloseIcon from '@mui/icons-material/Close'
import { useVentas } from '../../../shared/contexts/VentaContext'
import { useClientes } from '../../../shared/contexts/ClienteContext'
import { FormField, FormSelect, formFieldStyles } from '../../../shared/components/FormularioEstandarizado'

const COLORS = theme.palette

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
        <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}
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

const ActualizarVenta = ({ open, onClose, venta, onSuccess }) => {
    const { actualizarVenta, cambiarEstadoVenta } = useVentas()
    const { clientes } = useClientes()
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
        if (!venta) return
        setActiveStep(0)
        setErrores({})
        setSinCambios(false)
        const ventaData = venta
        setVentaOriginal(ventaData)
        const destinatario = ventaData.destinatarios?.[0] || null
        const paquete = ventaData.paquetes?.[0] || null
        setEstadoOriginal(ventaData.estado || '')
        const datosForm = {
            idCliente: ventaData.cliente?.id || ventaData.idCliente || '',
            numeroIdentificacion: ventaData.cliente?.numeroIdentificacion || '',
            nombreRemitente: ventaData.cliente?.nombre || '',
            apellidoRemitente: ventaData.cliente?.apellido || '',
            telefonoRemitente: ventaData.cliente?.telefono || '',
            emailRemitente: ventaData.cliente?.email || '',
            direccionRemitente: ventaData.cliente?.direccion || '',
            nombreDestinatario: destinatario?.nombreDestinatario || '',
            telefonoDestinatario: destinatario?.telefonoDestinatario || '',
            direccionDestinatario: destinatario?.direccionDestinatario || '',
            descripcionContenido: paquete?.descripcionContenido || '',
            peso: paquete?.peso || '',
            alto: paquete?.alto || '',
            ancho: paquete?.ancho || '',
            profundidad: paquete?.profundidad || '',
            valorDeclarado: paquete?.valorDeclarado || '',
            idRuta: ventaData.idRuta || ventaData.ruta?.idRuta || '',
            destino: ventaData.ruta?.destino || ventaData.ruta?.destino?.nombre || '',
            fechaEstimadaEntrega: ventaData.fechaEstimadaEntrega
                ? ventaData.fechaEstimadaEntrega.split('T')[0]
                : '',
            observaciones: ventaData.observaciones || '',
            estado: ventaData.estado || 'pendiente de recogida',
            metodoPago: ventaData.metodoPago || '',
            valorServicio: ventaData.valorServicio || '',
            impuestos: ventaData.impuestos || '',
            total: ventaData.total || '',
            estadoPago: ventaData.estadoPago || 'Pendiente',
        }
        setForm(datosForm)
        setFormOriginal(datosForm)
    }, [venta])

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
            const numId = venta?.idEncomiendaVenta || venta?.id
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
            setTimeout(() => {
                if (onClose) onClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al actualizar la venta.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => {
        if (onClose) onClose()
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
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
                                helperText={errores.nombreRemitente} icon={PersonOutlinedIcon}
                                inputProps={{ maxLength: 50 }} />
                            <FormField label="Apellidos" name="apellidoRemitente" value={form.apellidoRemitente}
                                onChange={handleChange} required error={errores.apellidoRemitente}
                                helperText={errores.apellidoRemitente} icon={PersonOutlinedIcon}
                                inputProps={{ maxLength: 50 }} />
                            <FormField label="Número de identificación" name="numeroIdentificacion" value={form.numeroIdentificacion}
                                onChange={handleChange} required error={errores.numeroIdentificacion}
                                helperText={errores.numeroIdentificacion} icon={BadgeOutlinedIcon}
                                inputProps={{ maxLength: 15 }} />
                            <FormField label="Teléfono" name="telefonoRemitente" value={form.telefonoRemitente}
                                onChange={handleChange} required error={errores.telefonoRemitente}
                                helperText={errores.telefonoRemitente || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                                inputProps={{ maxLength: 10 }} />
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormField label="Correo electrónico" name="emailRemitente" type="email" value={form.emailRemitente}
                                    onChange={handleChange} required error={errores.emailRemitente}
                                    helperText={errores.emailRemitente} icon={EmailOutlinedIcon}
                                    inputProps={{ maxLength: 100 }} />
                            </Box>
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormField label="Dirección" name="direccionRemitente" value={form.direccionRemitente}
                                    onChange={handleChange} required error={errores.direccionRemitente}
                                    helperText={errores.direccionRemitente || `${(form.direccionRemitente || '').length}/200`} icon={HomeOutlinedIcon}
                                    inputProps={{ maxLength: 200 }} />
                            </Box>
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                            onChange={handleChange} required error={errores.nombreDestinatario}
                            helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} />
                        <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                            onChange={handleChange} required error={errores.telefonoDestinatario}
                            helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                            inputProps={{ maxLength: 10 }} />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                                onChange={handleChange} required error={errores.direccionDestinatario}
                                helperText={errores.direccionDestinatario || `${(form.direccionDestinatario || '').length}/300`} icon={HomeOutlinedIcon} multiline rows={2}
                                inputProps={{ maxLength: 300 }} />
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
                            <FormSelect label="Ruta" name="idRuta" value={form.idRuta}
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
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Remitente</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del remitente</Typography>
                                <ConfirmRow label="Nombre" value={`${form.nombreRemitente} ${form.apellidoRemitente}`} />
                                <ConfirmRow label="Identificación" value={form.numeroIdentificacion} />
                                <ConfirmRow label="Teléfono" value={form.telefonoRemitente} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Destinatario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del destinatario</Typography>
                                <ConfirmRow label="Nombre" value={form.nombreDestinatario} />
                                <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} />
                                <ConfirmRow label="Dirección" value={form.direccionDestinatario} />
                            </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Paquete</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos del paquete</Typography>
                                <ConfirmRow label="Contenido" value={form.descripcionContenido} />
                                <ConfirmRow label="Peso" value={form.peso ? `${form.peso} kg` : null} />
                                <ConfirmRow label="Dimensiones" value={form.alto ? `${form.alto}×${form.ancho}×${form.profundidad} cm` : null} />
                                <ConfirmRow label="Valor declarado" value={form.valorDeclarado ? `$${parseFloat(form.valorDeclarado).toLocaleString()}` : '$0'} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Envío y Pago</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Ruta, estado y valores</Typography>
                                <ConfirmRow label="Ruta" value={form.destino} />
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
            <Dialog open={open} onClose={() => onClose && onClose()} maxWidth="md" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: theme.palette.gradient.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AssignmentIndOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Editar Venta</Typography>
                    </Box>
                    <IconButton onClick={() => onClose && onClose()} sx={{ color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                        <Typography color={theme.palette.text.secondary}>Cargando datos de la venta...</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        )
    }

    if (!ventaOriginal && apiError) {
        return (
            <Dialog open={open} onClose={() => onClose && onClose()} maxWidth="md" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: theme.palette.gradient.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AssignmentIndOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Editar Venta</Typography>
                    </Box>
                    <IconButton onClick={() => onClose && onClose()} sx={{ color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onClose={() => onClose && onClose()} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Editar Venta
                    </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                        {ventaOriginal?.numeroGuia
                            ? `Modificando guía: ${ventaOriginal.numeroGuia}`
                            : 'Modifica los campos que necesites.'
                        }
                    </Typography>
                </Box>
                <IconButton onClick={() => onClose && onClose()} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>

                <Stepper activeStep={activeStep} alternativeLabel
                    sx={{
                        mb: 3, mt: 2,
                        '& .MuiStepIcon-root': { color: theme.palette.divider },
                        '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
                        '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
                        '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
                        '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
                        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
                        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
                        '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
                        '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
                        '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
                    }}
                >
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                    {renderStepContent()}
                </Box>

                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}`,
                }}>
                    <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                        startIcon={<ArrowBackOutlinedIcon />} disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
                            color: theme.palette.text.primary, fontWeight: 500,
                            '&:hover': { borderColor: '#BDBDBD', backgroundColor: theme.palette.background.subtle },
                            '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
                        }}>
                        Anterior
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Button onClick={handleCancelar} disableRipple
                            sx={{
                                textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                                '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
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
                                backgroundColor: theme.palette.primary.main,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                                '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: '#9E9E9E' },
                            }}>
                            {activeStep < steps.length - 1
                                ? 'Siguiente'
                                : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'
                            }
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Venta actualizada exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default ActualizarVenta
