import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, IconButton, Divider, CircularProgress } from '@mui/material'
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
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useConfiguracion } from '../../shared/contexts/ConfiguracionContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'
import { formatFecha } from '../../shared/utils/formatters.js'

const steps = ['Participantes', 'Paquete', 'Envío', 'Pago', 'Confirmación']

const MAX_PAQUETES = 10
const PAQUETE_VACIO = { descripcionContenido: '', peso: '', alto: '', ancho: '', profundidad: '', valorDeclarado: '', idRutaVehiculoConductor: '' }
const CAMPOS_PAQUETE = ['descripcionContenido', 'peso', 'alto', 'ancho', 'profundidad', 'valorDeclarado']
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/

// Valida un único campo del formulario principal (usado en onBlur y para re-validar
// en vivo mientras se corrige un campo ya marcado con error). valorServicio/impuestos/
// total/observaciones no viven aquí: son editables sin ninguna regla de obligatoriedad.
const validarCampo = (name, form) => {
    switch (name) {
        case 'idCliente':
            return form.idCliente ? '' : 'Selecciona un cliente remitente'
        case 'nombreDestinatario':
            if (!form.nombreDestinatario.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombreDestinatario)) return 'Solo se permiten letras'
            return ''
        case 'telefonoDestinatario':
            if (!form.telefonoDestinatario.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefonoDestinatario)) return 'Debe tener 10 dígitos'
            return ''
        case 'direccionDestinatario':
            return form.direccionDestinatario.trim() ? '' : 'La dirección es obligatoria'
        case 'idRuta':
            return form.idRuta ? '' : 'Selecciona una ruta'
        case 'fechaEstimadaEntrega':
            if (!form.fechaEstimadaEntrega) return 'La fecha es obligatoria'
            if (form.fechaSalidaRuta && form.fechaEstimadaEntrega < form.fechaSalidaRuta) return 'No puede ser anterior a la fecha de salida de la ruta'
            return ''
        case 'metodoPago':
            return form.metodoPago ? '' : 'Selecciona un método de pago'
        default:
            return ''
    }
}

// Valida un único campo de un paquete (usado en onBlur y para re-validar en vivo).
const validarCampoPaquete = (campo, paquete) => {
    switch (campo) {
        case 'descripcionContenido':
            if (!paquete.descripcionContenido.trim()) return 'La descripción es obligatoria'
            if (paquete.descripcionContenido.length > 300) return 'Máximo 300 caracteres'
            return ''
        case 'peso': {
            const n = parseFloat(paquete.peso)
            if (!paquete.peso) return 'El peso es obligatorio'
            if (isNaN(n) || n <= 0) return 'Debe ser un número mayor a 0'
            if (n > 9999) return 'Máximo 9999 kg'
            return ''
        }
        case 'alto': {
            const n = parseFloat(paquete.alto)
            if (!paquete.alto) return 'El alto es obligatorio'
            if (isNaN(n) || n <= 0) return 'Debe ser un número mayor a 0'
            if (n > 9999) return 'Máximo 9999 cm'
            return ''
        }
        case 'ancho': {
            const n = parseFloat(paquete.ancho)
            if (!paquete.ancho) return 'El ancho es obligatorio'
            if (isNaN(n) || n <= 0) return 'Debe ser un número mayor a 0'
            if (n > 9999) return 'Máximo 9999 cm'
            return ''
        }
        case 'profundidad': {
            const n = parseFloat(paquete.profundidad)
            if (!paquete.profundidad) return 'La profundidad es obligatoria'
            if (isNaN(n) || n <= 0) return 'Debe ser un número mayor a 0'
            if (n > 9999) return 'Máximo 9999 cm'
            return ''
        }
        case 'valorDeclarado':
            if (paquete.valorDeclarado) {
                const n = parseFloat(paquete.valorDeclarado)
                if (isNaN(n) || n < 0) return 'Debe ser un número positivo'
                if (n > 999999999) return 'Valor demasiado alto'
            }
            return ''
        case 'idRutaVehiculoConductor':
            return paquete.idRutaVehiculoConductor ? '' : 'Asigna un vehículo'
        default:
            return ''
    }
}

const RegistrarVenta = ({ open, onClose, onSuccess }) => {
    const { agregarVenta } = useVentas()
    const { showToast } = useToast()
    const theme = useTheme()
    const { clientes } = useClientes()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const { tarifaPorKg } = useConfiguracion()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
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
        paquetes: [{ ...PAQUETE_VACIO }],
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
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({
            idCliente: '',
            nombreDestinatario: '',
            telefonoDestinatario: '',
            direccionDestinatario: '',
            paquetes: [{ ...PAQUETE_VACIO }],
            idRuta: '', destino: '', fechaSalidaRuta: '',
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
        valorServicio: 999999999, impuestos: 999999999,
    }

    const PAQUETE_NUMERIC_LIMITS = {
        peso: 9999, alto: 9999, ancho: 9999, profundidad: 9999, valorDeclarado: 999999999,
    }

    // valorServicio = tarifa base del destino + (peso × tarifa por kg). El resultado
    // sigue siendo editable a mano después de este auto-cálculo.
    const calcularValorServicio = (tarifaBase, peso) => {
        const pesoNum = parseFloat(peso) || 0
        return Number(tarifaBase || 0) + (pesoNum * tarifaPorKg)
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
        if (name === 'observaciones') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => {
            const updated = { ...prev, [name]: value }
            if (name === 'valorServicio') {
                const vs = parseFloat(value) || 0
                const imp = Math.round(vs * 0.10)
                updated.impuestos = imp
                updated.total = vs + imp
            } else if (name === 'impuestos') {
                const vs = parseFloat(prev.valorServicio) || 0
                const imp = parseFloat(value) || 0
                updated.total = vs + imp
            }
            return updated
        })
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    // Garantiza que errores.paquetes tenga una entrada por cada paquete actual (sin pisar
    // los errores ya marcados en otros campos/paquetes) y fija el mensaje de uno solo.
    const setErrorPaquete = (index, campo, mensaje) => {
        setErrores(prev => {
            const erroresPaquetes = form.paquetes.map((_, i) => prev.paquetes?.[i] || {})
            erroresPaquetes[index] = { ...erroresPaquetes[index], [campo]: mensaje }
            return { ...prev, paquetes: erroresPaquetes }
        })
    }

    const recalcularValorServicio = (prev, paquetes) => {
        if (!prev.idRuta) return {}
        const ruta = rutasProgramadas.find(r => r.idRuta === parseInt(prev.idRuta))
        const pesoTotal = paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
        const vs = calcularValorServicio(ruta?.destino?.tarifaBase, pesoTotal)
        const imp = Math.round(vs * 0.10)
        return { valorServicio: vs, impuestos: imp, total: vs + imp }
    }

    const handlePaqueteChange = (index, campo, value) => {
        if (campo in PAQUETE_NUMERIC_LIMITS) {
            value = value.replace(/[^0-9.]/g, '')
            if (value !== '') {
                const num = parseFloat(value)
                if (!isNaN(num) && (num > PAQUETE_NUMERIC_LIMITS[campo] || num < 0)) return
            }
        }
        if (campo === 'descripcionContenido') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        const paquetes = form.paquetes.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        setForm(prev => {
            const updated = { ...prev, paquetes }
            if (campo === 'peso') Object.assign(updated, recalcularValorServicio(prev, paquetes))
            return updated
        })
        const yaMarcado = errores.paquetes?.[index]?.[campo]
        setErrorPaquete(index, campo, yaMarcado ? validarCampoPaquete(campo, paquetes[index]) : '')
        setApiError(null)
    }

    const handleAgregarPaquete = () => {
        setForm(prev => ({ ...prev, paquetes: [...prev.paquetes, { ...PAQUETE_VACIO }] }))
    }

    const handleQuitarPaquete = (index) => {
        setForm(prev => {
            const paquetes = prev.paquetes.filter((_, i) => i !== index)
            return { ...prev, paquetes, ...recalcularValorServicio(prev, paquetes) }
        })
        setErrores(prev => ({ ...prev, paquetes: (prev.paquetes || []).filter((_, i) => i !== index) }))
    }

    const validarPaso = (step) => {
        const e = {}

        if (step === 0) {
            e.idCliente = validarCampo('idCliente', form)
            e.nombreDestinatario = validarCampo('nombreDestinatario', form)
            e.telefonoDestinatario = validarCampo('telefonoDestinatario', form)
            e.direccionDestinatario = validarCampo('direccionDestinatario', form)
        }

        if (step === 1) {
            const erroresPaquetes = form.paquetes.map(p => {
                const pe = {}
                CAMPOS_PAQUETE.forEach(campo => {
                    const err = validarCampoPaquete(campo, p)
                    if (err) pe[campo] = err
                })
                return pe
            })
            if (erroresPaquetes.some(pe => Object.keys(pe).length > 0)) e.paquetes = erroresPaquetes
        }

        if (step === 2) {
            e.idRuta = validarCampo('idRuta', form)
            e.fechaEstimadaEntrega = validarCampo('fechaEstimadaEntrega', form)

            const rutaSel = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
            if (rutaSel) {
                const erroresPaquetes = form.paquetes.map(p => {
                    const err = validarCampoPaquete('idRutaVehiculoConductor', p)
                    return err ? { idRutaVehiculoConductor: err } : {}
                })
                if (erroresPaquetes.some(pe => Object.keys(pe).length > 0)) e.paquetes = erroresPaquetes

                // Mismo cálculo que el aviso de capacidad en el render — bloquea seguir si el
                // peso de algún vehículo del convoy ya no alcanza (el backend también lo
                // valida al guardar, pero avisar aquí evita llegar hasta el final para enterarse).
                const pares = rutaSel.paresVehiculoConductor || []
                for (const par of pares) {
                    const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
                    if (capacidad == null) continue
                    const pesoUsado = Number(par.pesoUsado || 0)
                    const disponible = capacidad - pesoUsado
                    const pesoNuevo = form.paquetes
                        .filter(p => parseInt(p.idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                        .reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                    if (pesoNuevo > disponible) {
                        e.capacidad = `El vehículo ${par.vehiculo?.placa || ''} ya no tiene espacio suficiente. Quedan ${disponible.toFixed(2)} kg disponibles.`
                        break
                    }
                }
            }
        }

        if (step === 3) {
            e.metodoPago = validarCampo('metodoPago', form)
        }

        Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
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
                paquetes: form.paquetes.map(p => ({
                    descripcionContenido: p.descripcionContenido,
                    peso: parseFloat(p.peso),
                    alto: parseFloat(p.alto),
                    ancho: parseFloat(p.ancho),
                    profundidad: parseFloat(p.profundidad),
                    valorDeclarado: p.valorDeclarado ? parseFloat(p.valorDeclarado) : 0,
                    idRutaVehiculoConductor: parseInt(p.idRutaVehiculoConductor),
                })),
                fechaEstimadaEntrega: form.fechaEstimadaEntrega || null,
                observaciones: form.observaciones || null,
                metodoPago: form.metodoPago,
                valorServicio: parseFloat(form.valorServicio) || 0,
                impuestos: parseFloat(form.impuestos) || 0,
                estadoPago: form.estadoPago,
            })
            showToast('¡Venta registrada exitosamente!', 'success')
            setTimeout(() => { handleClose(); if (onSuccess) onSuccess() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la venta.'))
        } finally {
            setSubmitting(false)
        }
    }

    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(form.idCliente))

    const getPlacaPaquete = (paquete) => {
        const rutaSel = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
        const par = (rutaSel?.paresVehiculoConductor || []).find(p => p.idRutaVehiculoConductor === parseInt(paquete.idRutaVehiculoConductor))
        return par?.vehiculo?.placa || '—'
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, overflow: 'hidden',
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
                                onBlur={() => setErrores(prev => ({ ...prev, idCliente: validarCampo('idCliente', form) }))}
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
                                    onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, nombreDestinatario: validarCampo('nombreDestinatario', form) }))}
                                    required error={errores.nombreDestinatario}
                                    helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon}
                                    placeholder="Ej: Juan Pérez" inputProps={{ maxLength: 50 }} />
                                <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                                    onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, telefonoDestinatario: validarCampo('telefonoDestinatario', form) }))}
                                    required error={errores.telefonoDestinatario}
                                    helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                                    inputProps={{ maxLength: 10 }} />
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                                        onChange={handleChange}
                                        onBlur={() => setErrores(prev => ({ ...prev, direccionDestinatario: validarCampo('direccionDestinatario', form) }))}
                                        required error={errores.direccionDestinatario}
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
                        {form.paquetes.map((paquete, index) => {
                            const errPaquete = errores.paquetes?.[index] || {}
                            return (
                                <Box key={index} sx={{
                                    display: 'flex', flexDirection: 'column', gap: 2.5,
                                    ...(form.paquetes.length > 1 ? { p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } : {}),
                                }}>
                                    {form.paquetes.length > 1 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                                                Paquete {index + 1}
                                            </Typography>
                                            <IconButton onClick={() => handleQuitarPaquete(index)}
                                                disabled={form.paquetes.length === 1}
                                                sx={{ visibility: form.paquetes.length === 1 ? 'hidden' : 'visible' }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                    <FormField label="Descripción del contenido" name="descripcionContenido" value={paquete.descripcionContenido}
                                        onChange={(e) => handlePaqueteChange(index, 'descripcionContenido', e.target.value)}
                                        onBlur={() => setErrorPaquete(index, 'descripcionContenido', validarCampoPaquete('descripcionContenido', paquete))}
                                        required error={errPaquete.descripcionContenido}
                                        helperText={errPaquete.descripcionContenido || `${paquete.descripcionContenido.length}/300`}
                                        multiline rows={2} inputProps={{ maxLength: 300 }} />
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                                        <FormField label="Peso (kg)" name="peso" value={paquete.peso}
                                            onChange={(e) => handlePaqueteChange(index, 'peso', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'peso', validarCampoPaquete('peso', paquete))}
                                            required error={errPaquete.peso}
                                            placeholder="Ej: 1.5" helperText={errPaquete.peso || 'Ej: 1.5'}
                                            inputProps={{ maxLength: 7 }} />
                                        <FormField label="Alto (cm)" name="alto" value={paquete.alto}
                                            onChange={(e) => handlePaqueteChange(index, 'alto', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'alto', validarCampoPaquete('alto', paquete))}
                                            required error={errPaquete.alto}
                                            placeholder="Ej: 30" helperText={errPaquete.alto || 'Ej: 30'}
                                            inputProps={{ maxLength: 4 }} />
                                        <FormField label="Ancho (cm)" name="ancho" value={paquete.ancho}
                                            onChange={(e) => handlePaqueteChange(index, 'ancho', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'ancho', validarCampoPaquete('ancho', paquete))}
                                            required error={errPaquete.ancho}
                                            placeholder="Ej: 20" helperText={errPaquete.ancho || 'Ej: 20'}
                                            inputProps={{ maxLength: 4 }} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                                        <FormField label="Profundidad (cm)" name="profundidad" value={paquete.profundidad}
                                            onChange={(e) => handlePaqueteChange(index, 'profundidad', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'profundidad', validarCampoPaquete('profundidad', paquete))}
                                            required error={errPaquete.profundidad}
                                            placeholder="Ej: 15" helperText={errPaquete.profundidad || 'Ej: 15'}
                                            inputProps={{ maxLength: 4 }} />
                                        <FormField label="Valor declarado ($)" name="valorDeclarado" value={paquete.valorDeclarado}
                                            onChange={(e) => handlePaqueteChange(index, 'valorDeclarado', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'valorDeclarado', validarCampoPaquete('valorDeclarado', paquete))}
                                            helperText={errPaquete.valorDeclarado || 'Opcional'}
                                            placeholder="Ej: 50000" error={errPaquete.valorDeclarado}
                                            inputProps={{ maxLength: 9 }} />
                                    </Box>
                                </Box>
                            )
                        })}
                        <Button
                            onClick={handleAgregarPaquete}
                            startIcon={<AddOutlinedIcon />}
                            disabled={form.paquetes.length >= MAX_PAQUETES}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                        >
                            Agregar paquete
                        </Button>
                    </Box>
                )
            case 2: {
                const rutaElegida = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
                const paresElegida = rutaElegida?.paresVehiculoConductor || []
                // Un Alert por cada vehículo del convoy que ya tiene paquetes asignados —
                // la capacidad ahora es por vehículo, no por ruta completa.
                const paresConUso = paresElegida
                    .map(par => {
                        const pesoNuevo = form.paquetes
                            .filter(p => parseInt(p.idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                            .reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                        const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
                        const disponible = capacidad != null ? Math.max(0, capacidad - Number(par.pesoUsado || 0)) : null
                        return { par, pesoNuevo, disponible, excede: disponible != null && pesoNuevo > disponible }
                    })
                    .filter(item => item.pesoNuevo > 0)

                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <Autocomplete
                                options={rutasProgramadas.filter(r => r.habilitado !== false && r.estado === 'Programada')}
                                getOptionLabel={(option) => {
                                    // Placas de todos los vehículos del convoy en la etiqueta misma: si hay
                                    // dos rutas con el mismo nombre (ej. mismo conductor, distinto vehículo),
                                    // así se distinguen directo en la lista, sin tener que elegir una para verlo.
                                    const placas = (option.paresVehiculoConductor || []).map(p => p.vehiculo?.placa).filter(Boolean).join(', ')
                                    return `${option.nombreRuta || 'Sin nombre'}${placas ? ` (${placas})` : ''} — $${Number(option.destino?.tarifaBase || 0).toLocaleString()}`
                                }}
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
                                    // Cambiar de ruta invalida cualquier asignación de paquete→vehículo que
                                    // ya se hubiera hecho (esos idRutaVehiculoConductor pertenecen al convoy
                                    // de la ruta anterior, no a la nueva).
                                    if (newValue) {
                                        const fechaSalida = newValue.fechaSalida || ''
                                        setForm(prev => {
                                            const pesoTotal = prev.paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                                            const valorServicio = calcularValorServicio(newValue.destino?.tarifaBase, pesoTotal)
                                            const impuestos = Math.round(valorServicio * 0.10)
                                            return {
                                                ...prev,
                                                idRuta: newValue.idRuta,
                                                destino: newValue.nombreRuta || 'Sin nombre',
                                                fechaSalidaRuta: fechaSalida,
                                                fechaEstimadaEntrega: prev.fechaEstimadaEntrega && fechaSalida && prev.fechaEstimadaEntrega < fechaSalida
                                                    ? '' : prev.fechaEstimadaEntrega,
                                                valorServicio,
                                                impuestos,
                                                total: valorServicio + impuestos,
                                                paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: '' })),
                                            }
                                        })
                                    } else {
                                        setForm(prev => ({
                                            ...prev, idRuta: '', destino: '', fechaSalidaRuta: '',
                                            paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: '' })),
                                        }))
                                    }
                                    setErrores(prev => ({ ...prev, idRuta: '', fechaEstimadaEntrega: '', paquetes: [] }))
                                    setApiError(null)
                                }}
                                onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form) }))}
                                noOptionsText="No se encontraron rutas"
                                renderInput={(params) => (
                                    <TextField {...params} label="Ruta *"
                                        error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por nombre de ruta o destino'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                        sx={formFieldStyles} />
                                )}
                            />
                            <TextField fullWidth label="Fecha estimada de entrega" name="fechaEstimadaEntrega"
                                type="date" value={form.fechaEstimadaEntrega} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', form) }))} required
                                error={!!errores.fechaEstimadaEntrega}
                                helperText={errores.fechaEstimadaEntrega || (form.fechaSalidaRuta ? `Desde el ${formatFecha(form.fechaSalidaRuta)}` : 'Selecciona primero una ruta')}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.fechaSalidaRuta || undefined } }}
                                sx={formFieldStyles} />
                        </Box>
                        {rutaElegida && (
                            <Paper elevation={0} sx={{
                                p: 1.5, borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.default,
                            }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                                    <Typography variant="body2">
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Destino:</Box>
                                        {rutaElegida.destino ? `${rutaElegida.destino.ciudad}, ${rutaElegida.destino.departamento}` : '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Salida:</Box>
                                        {rutaElegida.fechaSalida ? `${formatFecha(rutaElegida.fechaSalida)}${rutaElegida.horaSalida ? ' · ' + rutaElegida.horaSalida : ''}` : '—'}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary} sx={{ display: 'block', mb: 0.5 }}>
                                    Vehículos de esta ruta
                                </Typography>
                                {paresElegida.map((par) => (
                                    <Typography key={par.idRutaVehiculoConductor} variant="body2" sx={{ mb: 0.25 }}>
                                        {par.vehiculo ? `${par.vehiculo.placa} — ${par.vehiculo.marca} ${par.vehiculo.modelo}` : '—'}
                                        {' · '}
                                        {par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : '—'}
                                    </Typography>
                                ))}
                            </Paper>
                        )}
                        {rutaElegida && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                                    Asignar paquetes a vehículo
                                </Typography>
                                {form.paquetes.map((paquete, index) => (
                                    <FormSelect key={index}
                                        label={form.paquetes.length > 1 ? `Paquete ${index + 1} — Vehículo` : 'Vehículo'}
                                        name="idRutaVehiculoConductor"
                                        value={paquete.idRutaVehiculoConductor}
                                        onChange={(e) => handlePaqueteChange(index, 'idRutaVehiculoConductor', e.target.value)}
                                        onBlur={() => setErrorPaquete(index, 'idRutaVehiculoConductor', validarCampoPaquete('idRutaVehiculoConductor', paquete))}
                                        required
                                        error={errores.paquetes?.[index]?.idRutaVehiculoConductor}
                                        helperText={errores.paquetes?.[index]?.idRutaVehiculoConductor || `¿A cuál vehículo va este paquete?${paquete.peso ? ` (${paquete.peso} kg)` : ''}`}>
                                        {paresElegida.map((par) => (
                                            <MenuItem key={par.idRutaVehiculoConductor} value={par.idRutaVehiculoConductor}>
                                                {par.vehiculo?.placa || 'Sin placa'} — {par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : 'Sin conductor'}
                                            </MenuItem>
                                        ))}
                                    </FormSelect>
                                ))}
                            </Box>
                        )}
                        {paresConUso.map(({ par, pesoNuevo, disponible, excede }) => (
                            <Alert key={par.idRutaVehiculoConductor} severity={excede ? 'error' : 'info'} sx={{ borderRadius: 2 }}>
                                <strong>{par.vehiculo?.placa || 'Vehículo'}:</strong> {pesoNuevo.toFixed(2)} kg de{' '}
                                <strong>{disponible != null ? disponible.toFixed(2) : '∞'} kg</strong> disponibles.
                                {excede && ' Supera lo disponible en este vehículo — reasigna algún paquete o quita peso.'}
                            </Alert>
                        ))}
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange} multiline rows={2}
                            helperText={errores.observaciones || `Opcional · ${(form.observaciones || '').length}/500`}
                            error={errores.observaciones}
                            inputProps={{ maxLength: 500 }} />
                    </Box>
                )
            }
            case 3:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormSelect label="Método de pago" name="metodoPago" value={form.metodoPago}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, metodoPago: validarCampo('metodoPago', form) }))} required error={errores.metodoPago}
                            helperText={errores.metodoPago}>
                            <MenuItem value="Contraentrega">Contraentrega</MenuItem>
                            <MenuItem value="Efectivo">Efectivo</MenuItem>
                            <MenuItem value="Transferencia">Transferencia</MenuItem>
                            <MenuItem value="Nequi">Nequi</MenuItem>
                        </FormSelect>
                        <FormField label="Valor del servicio ($)" name="valorServicio"
                            value={form.valorServicio} onChange={handleChange}
                            helperText="Tarifa del destino + peso × tarifa por kg (editable)"
                            inputProps={{ maxLength: 9 }} />
                        <FormField label="Impuestos ($)" name="impuestos"
                            value={form.impuestos} onChange={handleChange}
                            helperText="10% del valor del servicio (editable)"
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
                                    <Typography fontWeight={700} fontSize="0.95rem">{form.paquetes.length > 1 ? 'Paquetes' : 'Paquete'}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                    {form.paquetes.length > 1 ? 'Características de los paquetes' : 'Características del paquete'}
                                </Typography>
                                {form.paquetes.map((p, i) => (
                                    <Box key={i}>
                                        {form.paquetes.length > 1 && (
                                            <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary}
                                                sx={{ display: 'block', mt: i > 0 ? 1.5 : 0, mb: 0.5 }}>
                                                Paquete {i + 1}
                                            </Typography>
                                        )}
                                        <ConfirmRow label="Contenido" value={p.descripcionContenido} />
                                        <ConfirmRow label="Peso" value={p.peso ? `${p.peso} kg` : null} />
                                        <ConfirmRow label="Dimensiones" value={p.alto ? `${p.alto}×${p.ancho}×${p.profundidad} cm` : null} />
                                        <ConfirmRow label="Valor declarado" value={p.valorDeclarado ? `$${parseFloat(p.valorDeclarado).toLocaleString()}` : '$0'} />
                                        <ConfirmRow label="Vehículo" value={getPlacaPaquete(p)} />
                                        {i < form.paquetes.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </Box>
                                ))}
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Envío y Pago</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Ruta, fechas y valores</Typography>
                                <ConfirmRow label="Ruta" value={form.destino} />
                                <ConfirmRow label="Fecha entrega" value={formatFecha(form.fechaEstimadaEntrega)} />
                                <ConfirmRow label="Observaciones" value={form.observaciones} />
                                <ConfirmRow label="Método de pago" value={form.metodoPago} />
                                <ConfirmRow label="Valor del servicio" value={form.valorServicio ? `$${parseFloat(form.valorServicio).toLocaleString()}` : null} />
                                <ConfirmRow label="Impuestos" value={form.impuestos ? `$${parseFloat(form.impuestos).toLocaleString()}` : null} />
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
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 160,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
                        }}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : 'Registrar')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarVenta
