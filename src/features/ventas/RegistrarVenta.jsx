import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, IconButton, Divider } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const steps = ['Partes', 'Paquete', 'Envío', 'Pago', 'Confirmación']

const RegistrarVenta = ({ open, onClose, onSuccess }) => {
    const { agregarVenta } = useVentas()
    const theme = useTheme()
    const { clientes } = useClientes()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [clienteInput, setClienteInput] = useState('')
    const [rutaInput, setRutaInput] = useState('')

    useEffect(() => {
        fetchRutasProgramadas({ limit: 1000 }).catch(() => null)
    }, [fetchRutasProgramadas])

    const [form, setForm] = useState({
        idCliente: '',
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
        fechaSalidaRuta: '',
        fechaEstimadaEntrega: '',
        observaciones: '',
        metodoPago: '',
        estadoPago: 'Pendiente',
        valorServicio: '',
        impuestos: '',
        total: '',
    })

    const handleClose = () => {
        setForm({
            idCliente: '',
            nombreDestinatario: '',
            telefonoDestinatario: '',
            direccionDestinatario: '',
            descripcionContenido: '',
            peso: '', alto: '', ancho: '', profundidad: '',
            valorDeclarado: '', idRuta: '', destino: '', fechaSalidaRuta: '',
            fechaEstimadaEntrega: '', observaciones: '',
            metodoPago: '', estadoPago: 'Pendiente',
            valorServicio: '', impuestos: '', total: '',
        })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setClienteInput('')
        setRutaInput('')
        onClose()
    }

    const NUMERIC_LIMITS = {
        peso: 9999, alto: 9999, ancho: 9999, profundidad: 9999,
        valorDeclarado: 999999999, valorServicio: 999999999, impuestos: 999999999,
    }

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name in NUMERIC_LIMITS) {
            value = value.replace(/[^0-9.]/g, '')
            if (value !== '') {
                const num = parseFloat(value)
                if (!isNaN(num) && (num > NUMERIC_LIMITS[name] || num < 0)) return
            }
        }
        if (name === 'nombreDestinatario') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'telefonoDestinatario') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'direccionDestinatario') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/']/g, '')
        }
        if (name === 'descripcionContenido') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'observaciones') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
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
    }

    const validarPaso = (step) => {
        const e = {}
        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/

        if (step === 0) {
            if (!form.idCliente) e.idCliente = 'Selecciona un cliente remitente'
            if (!form.nombreDestinatario.trim()) e.nombreDestinatario = 'El nombre es obligatorio'
            else if (!soloLetras.test(form.nombreDestinatario)) e.nombreDestinatario = 'Solo se permiten letras'
            if (!form.telefonoDestinatario.trim()) e.telefonoDestinatario = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefonoDestinatario)) e.telefonoDestinatario = 'Debe tener 10 dígitos'
            if (!form.direccionDestinatario.trim()) e.direccionDestinatario = 'La dirección es obligatoria'
        }

        if (step === 1) {
            if (!form.descripcionContenido.trim()) e.descripcionContenido = 'La descripción es obligatoria'
            else if (form.descripcionContenido.length > 300) e.descripcionContenido = 'Máximo 300 caracteres'

            const pesoNum = parseFloat(form.peso)
            if (!form.peso) e.peso = 'El peso es obligatorio'
            else if (isNaN(pesoNum) || pesoNum <= 0) e.peso = 'Debe ser un número mayor a 0'
            else if (pesoNum > 9999) e.peso = 'Máximo 9999 kg'

            const altoNum = parseFloat(form.alto)
            if (!form.alto) e.alto = 'El alto es obligatorio'
            else if (isNaN(altoNum) || altoNum <= 0) e.alto = 'Debe ser un número mayor a 0'

            const anchoNum = parseFloat(form.ancho)
            if (!form.ancho) e.ancho = 'El ancho es obligatorio'
            else if (isNaN(anchoNum) || anchoNum <= 0) e.ancho = 'Debe ser un número mayor a 0'

            const profNum = parseFloat(form.profundidad)
            if (!form.profundidad) e.profundidad = 'La profundidad es obligatoria'
            else if (isNaN(profNum) || profNum <= 0) e.profundidad = 'Debe ser un número mayor a 0'

            if (form.valorDeclarado) {
                const vdNum = parseFloat(form.valorDeclarado)
                if (isNaN(vdNum) || vdNum < 0) e.valorDeclarado = 'Debe ser un número positivo'
            }
        }

        if (step === 2) {
            if (!form.idRuta) e.idRuta = 'Selecciona una ruta'
            if (!form.fechaEstimadaEntrega) e.fechaEstimadaEntrega = 'La fecha es obligatoria'
            else if (form.fechaSalidaRuta && form.fechaEstimadaEntrega < form.fechaSalidaRuta)
                e.fechaEstimadaEntrega = 'No puede ser anterior a la fecha de salida de la ruta'
        }

        if (step === 3) {
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
        setSubmitting(true)
        setApiError(null)
        try {
            await agregarVenta({
                idCliente: parseInt(form.idCliente),
                idRuta: parseInt(form.idRuta),
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario,
                    direccionDestinatario: form.direccionDestinatario,
                },
                paquetes: [{
                    descripcionContenido: form.descripcionContenido,
                    peso: parseFloat(form.peso),
                    alto: parseFloat(form.alto),
                    ancho: parseFloat(form.ancho),
                    profundidad: parseFloat(form.profundidad),
                    valorDeclarado: form.valorDeclarado ? parseFloat(form.valorDeclarado) : 0,
                }],
                fechaEstimadaEntrega: form.fechaEstimadaEntrega || null,
                observaciones: form.observaciones || null,
                metodoPago: form.metodoPago,
                valorServicio: parseFloat(form.valorServicio) || 0,
                impuestos: parseFloat(form.impuestos) || 0,
                estadoPago: form.estadoPago,
            })
            setExito(true)
            setTimeout(() => { handleClose(); if (onSuccess) onSuccess() }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar la venta.')
        } finally {
            setSubmitting(false)
        }
    }

    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(form.idCliente))

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'white', overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Remitente — solo seleccionar cliente */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: theme.palette.text.primary }}>
                                Remitente
                            </Typography>
                            <Autocomplete
                                options={clientes.filter(c => c.habilitado)}
                                getOptionLabel={(option) => {
                                    const nombre = option.apellido ? `${option.nombre} ${option.apellido}` : option.nombre
                                    return `${nombre} — ${option.numeroIdentificacion}`
                                }}
                                isOptionEqualToValue={(opt, val) => opt.idCliente === val.idCliente}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idCliente - a.idCliente).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(c =>
                                        normalizarTexto(c.nombre || '').includes(q) ||
                                        normalizarTexto(c.apellido || '').includes(q) ||
                                        normalizarTexto(c.numeroIdentificacion || '').includes(q)
                                    )
                                }}
                                value={clienteSeleccionado || null}
                                inputValue={clienteInput}
                                onInputChange={(_, val, reason) => {
                                    if (reason === 'input') {
                                        setClienteInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, ''))
                                    } else if (reason === 'reset') {
                                        setClienteInput(val)
                                    } else if (reason === 'clear') {
                                        setClienteInput('')
                                    }
                                }}
                                onChange={(_, newValue) => {
                                    setForm(prev => ({ ...prev, idCliente: newValue ? newValue.idCliente : '' }))
                                    setErrores(prev => ({ ...prev, idCliente: '' }))
                                }}
                                noOptionsText="No se encontraron clientes"
                                renderInput={(params) => (
                                    <TextField {...params} label="Cliente *"
                                        error={!!errores.idCliente} helperText={errores.idCliente || 'Busca por nombre, apellido o documento'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                        sx={formFieldStyles} />
                                )}
                            />
                            {clienteSeleccionado && (
                                <Paper elevation={0} sx={{
                                    mt: 1.5, p: 1.5, borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.background.default,
                                }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Nombre:</Box>
                                            {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>ID:</Box>
                                            {clienteSeleccionado.numeroIdentificacion}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Teléfono:</Box>
                                            {clienteSeleccionado.telefono}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Correo:</Box>
                                            {clienteSeleccionado.email}
                                        </Typography>
                                        {clienteSeleccionado.direccion && (
                                            <Box sx={{ gridColumn: '1 / -1' }}>
                                                <Typography variant="body2">
                                                    <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Dirección:</Box>
                                                    {clienteSeleccionado.direccion}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            )}
                        </Box>

                        <Divider />

                        {/* Destinatario */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: theme.palette.text.primary }}>
                                Destinatario
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                                <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                                    onChange={handleChange} required error={errores.nombreDestinatario}
                                    helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon}
                                    placeholder="Ej: Juan Pérez" inputProps={{ maxLength: 50 }} />
                                <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                                    onChange={handleChange} required error={errores.telefonoDestinatario}
                                    helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                                    inputProps={{ maxLength: 10 }} />
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                                        onChange={handleChange} required error={errores.direccionDestinatario}
                                        placeholder="Ej: Cra 23 #80-5"
                                        helperText={errores.direccionDestinatario || `${(form.direccionDestinatario || '').length}/300`}
                                        icon={HomeOutlinedIcon} multiline rows={2} inputProps={{ maxLength: 300 }} />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormField label="Descripción del contenido" name="descripcionContenido" value={form.descripcionContenido}
                            onChange={handleChange} required error={errores.descripcionContenido}
                            helperText={errores.descripcionContenido || `${form.descripcionContenido.length}/300`}
                            multiline rows={2} inputProps={{ maxLength: 300 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                            <FormField label="Peso (kg)" name="peso" value={form.peso}
                                onChange={handleChange} required error={errores.peso}
                                placeholder="Ej: 1.5" helperText={errores.peso || 'Ej: 1.5'}
                                inputProps={{ maxLength: 7 }} />
                            <FormField label="Alto (cm)" name="alto" value={form.alto}
                                onChange={handleChange} required error={errores.alto}
                                placeholder="Ej: 30" helperText={errores.alto || 'Ej: 30'}
                                inputProps={{ maxLength: 4 }} />
                            <FormField label="Ancho (cm)" name="ancho" value={form.ancho}
                                onChange={handleChange} required error={errores.ancho}
                                placeholder="Ej: 20" helperText={errores.ancho || 'Ej: 20'}
                                inputProps={{ maxLength: 4 }} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Profundidad (cm)" name="profundidad" value={form.profundidad}
                                onChange={handleChange} required error={errores.profundidad}
                                placeholder="Ej: 15" helperText={errores.profundidad || 'Ej: 15'}
                                inputProps={{ maxLength: 4 }} />
                            <FormField label="Valor declarado ($)" name="valorDeclarado" value={form.valorDeclarado}
                                onChange={handleChange} helperText={errores.valorDeclarado || 'Opcional'}
                                placeholder="Ej: 50000" error={errores.valorDeclarado}
                                inputProps={{ maxLength: 9 }} />
                        </Box>
                    </Box>
                )
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <Autocomplete
                                options={rutasProgramadas.filter(r => r.habilitado !== false)}
                                getOptionLabel={(option) => `${option.nombreRuta || 'Sin nombre'} — $${Number(option.destino?.tarifaBase || 0).toLocaleString()}`}
                                isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(r =>
                                        normalizarTexto(r.nombreRuta || '').includes(q) ||
                                        normalizarTexto(r.destino?.ciudad || '').includes(q) ||
                                        normalizarTexto(r.destino?.departamento || '').includes(q)
                                    )
                                }}
                                value={rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta)) || null}
                                inputValue={rutaInput}
                                onInputChange={(_, val, reason) => {
                                    if (reason === 'input') {
                                        setRutaInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, ''))
                                    } else if (reason === 'reset') {
                                        setRutaInput(val)
                                    } else if (reason === 'clear') {
                                        setRutaInput('')
                                    }
                                }}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        const tarifaBase = Number(newValue.destino?.tarifaBase || 0)
                                        const impuestos = Math.round(tarifaBase * 0.10)
                                        const fechaSalida = newValue.fechaSalida || ''
                                        setForm(prev => ({
                                            ...prev,
                                            idRuta: newValue.idRuta,
                                            destino: newValue.nombreRuta || 'Sin nombre',
                                            fechaSalidaRuta: fechaSalida,
                                            fechaEstimadaEntrega: prev.fechaEstimadaEntrega && fechaSalida && prev.fechaEstimadaEntrega < fechaSalida
                                                ? '' : prev.fechaEstimadaEntrega,
                                            valorServicio: tarifaBase,
                                            impuestos,
                                            total: tarifaBase + impuestos,
                                        }))
                                    } else {
                                        setForm(prev => ({ ...prev, idRuta: '', destino: '', fechaSalidaRuta: '' }))
                                    }
                                    setErrores(prev => ({ ...prev, idRuta: '', fechaEstimadaEntrega: '' }))
                                    setApiError(null)
                                }}
                                noOptionsText="No se encontraron rutas"
                                renderInput={(params) => (
                                    <TextField {...params} label="Ruta *"
                                        error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por nombre de ruta o destino'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                        sx={formFieldStyles} />
                                )}
                            />
                            <TextField fullWidth label="Fecha estimada de entrega" name="fechaEstimadaEntrega"
                                type="date" value={form.fechaEstimadaEntrega} onChange={handleChange} required
                                error={!!errores.fechaEstimadaEntrega}
                                helperText={errores.fechaEstimadaEntrega || (form.fechaSalidaRuta ? `Desde el ${form.fechaSalidaRuta}` : 'Selecciona primero una ruta')}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.fechaSalidaRuta || undefined } }}
                                sx={formFieldStyles} />
                        </Box>
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange} multiline rows={2}
                            helperText={errores.observaciones || `Opcional · ${(form.observaciones || '').length}/500`}
                            error={errores.observaciones}
                            inputProps={{ maxLength: 500 }} />
                    </Box>
                )
            case 3:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormSelect label="Método de pago" name="metodoPago" value={form.metodoPago}
                            onChange={handleChange} required error={errores.metodoPago}
                            helperText={errores.metodoPago}>
                            <MenuItem value="Contraentrega">Contraentrega</MenuItem>
                            <MenuItem value="Efectivo">Efectivo</MenuItem>
                            <MenuItem value="Transferencia">Transferencia</MenuItem>
                            <MenuItem value="Nequi">Nequi</MenuItem>
                        </FormSelect>
                        <FormField label="Valor del servicio ($)" name="valorServicio"
                            value={form.valorServicio} onChange={handleChange}
                            inputProps={{ maxLength: 9 }} />
                        <FormField label="Impuestos ($)" name="impuestos"
                            value={form.impuestos} onChange={handleChange}
                            inputProps={{ maxLength: 9 }} />
                        <FormField label="Total a pagar ($)" name="total"
                            value={form.total} onChange={handleChange} disabled />
                    </Box>
                )
            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {apiError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Remitente</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información del cliente</Typography>
                                {clienteSeleccionado && <>
                                    <ConfirmRow label="Nombre" value={`${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`} />
                                    <ConfirmRow label="Identificación" value={clienteSeleccionado.numeroIdentificacion} />
                                    <ConfirmRow label="Teléfono" value={clienteSeleccionado.telefono} />
                                </>}
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Destinatario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información del destinatario</Typography>
                                <ConfirmRow label="Nombre" value={form.nombreDestinatario} />
                                <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} />
                                <ConfirmRow label="Dirección" value={form.direccionDestinatario} />
                            </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Paquete</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Características del paquete</Typography>
                                <ConfirmRow label="Contenido" value={form.descripcionContenido} />
                                <ConfirmRow label="Peso" value={form.peso ? `${form.peso} kg` : null} />
                                <ConfirmRow label="Dimensiones" value={form.alto ? `${form.alto}×${form.ancho}×${form.profundidad} cm` : null} />
                                <ConfirmRow label="Valor declarado" value={form.valorDeclarado ? `$${parseFloat(form.valorDeclarado).toLocaleString()}` : '$0'} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Envío y Pago</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Ruta, fechas y valores</Typography>
                                <ConfirmRow label="Ruta" value={form.destino} />
                                <ConfirmRow label="Fecha entrega" value={form.fechaEstimadaEntrega} />
                                <ConfirmRow label="Método de pago" value={form.metodoPago} />
                                <ConfirmRow label="Total" value={form.total ? `$${parseFloat(form.total).toLocaleString()}` : null} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Venta</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Complete los datos de la nueva encomienda paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Box sx={{ mb: 3 }}>
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
                        }}>
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                </Box>
                <Box sx={{ px: 4, py: 2 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>
            </DialogContent>

            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`,
            }}>
                <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                    startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={{
                        textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
                        color: theme.palette.text.primary, fontWeight: 500,
                        '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
                        '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
                    }}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleClose} disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained" disabled={submitting}
                        endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
                        }}>
                        {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Registrar'}
                    </Button>
                </Box>
            </Box>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Venta registrada exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default RegistrarVenta
