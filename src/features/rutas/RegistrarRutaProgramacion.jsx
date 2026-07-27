import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete, TextField, CircularProgress
} from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { formatFecha } from '../../shared/utils/formatters.js'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import CalendarioDisponibilidad from '../../shared/components/CalendarioDisponibilidad.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const mananaISO = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

const steps = ['Datos de la Ruta', 'Horario', 'Confirmación']

// Máximo de pares vehículo+conductor por ruta — igual al tope del backend (MAX_PARES_RUTA
// en rutaService.js), mismo criterio que MAX_PAQUETES en Ventas.
const MAX_PARES = 10

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "horaLlegadaEstimada" y
// "observaciones" no viven aquí: son opcionales y no tienen ninguna regla que validar.
const validarCampo = (name, form) => {
    switch (name) {
        case 'nombreRuta':
            return form.nombreRuta?.trim() ? '' : 'El nombre de la ruta es obligatorio'
        case 'idDestino':
            return form.idDestino ? '' : 'Selecciona un destino'
        case 'fechaSalida':
            if (!form.fechaSalida) return 'La fecha de salida es obligatoria'
            if (form.fechaSalida < mananaISO()) return 'La fecha de salida debe ser posterior a hoy'
            return ''
        case 'horaSalida':
            return form.horaSalida ? '' : 'La hora de salida es obligatoria'
        default:
            return ''
    }
}

// Valida el array de pares vehículo+conductor (convoy de la ruta) — mismo patrón que
// validarCategorias() en RegistrarConductor.jsx para categoriasLicencia.
const validarPares = (pares) => {
    const completos = pares.filter(p => p.idVehiculo && p.idConductor)
    const incompletos = pares.some(p => (p.idVehiculo && !p.idConductor) || (!p.idVehiculo && p.idConductor))
    if (completos.length === 0) return 'Agrega al menos un vehículo y su conductor'
    if (incompletos) return 'Completa el vehículo y el conductor de cada fila (o quítala)'
    const idsVehiculo = completos.map(p => p.idVehiculo)
    const idsConductor = completos.map(p => p.idConductor)
    if (new Set(idsVehiculo).size !== idsVehiculo.length) return 'No repitas el mismo vehículo en dos filas'
    if (new Set(idsConductor).size !== idsConductor.length) return 'No repitas el mismo conductor en dos filas'
    return ''
}

const RegistrarRutaProgramacion = ({ open, onClose, onSuccess }) => {
    const { registrarRutaProgramada } = useRutaProgramacion()
    const { showToast } = useToast()
    const theme = useTheme()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados }    = useDestino()

    const [errores, setErrores]       = useState({})
    const [apiError, setApiError]     = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [destinoInput, setDestinoInput]     = useState('')
    const [vehiculoInputs, setVehiculoInputs]     = useState([''])
    const [conductorInputs, setConductorInputs]   = useState([''])

    const vehiculos   = getVehiculosHabilitados()
    const conductores = getConductoresHabilitados()
    const destinos    = getDestinosHabilitados()

    const [form, setForm] = useState({
        nombreRuta: '',
        pares: [{ idVehiculo: '', idConductor: '' }],
        idDestino: '',
        fechaSalida: '',
        horaSalida: '',
        horaLlegadaEstimada: '',
        observaciones: ''
    })

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'nombreRuta') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    const handleParChange = (index, campo, value) => {
        const pares = form.pares.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        // Cambiar un vehículo/conductor puede volver inválida la fecha ya elegida (o
        // liberar una que antes estaba bloqueada) — se limpia para que se vuelva a
        // elegir contra el calendario ya actualizado.
        setForm(prev => ({ ...prev, pares, fechaSalida: '' }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '', fechaSalida: '' }))
        setApiError(null)
    }

    const handleAgregarPar = () => {
        setForm(prev => ({ ...prev, pares: [...prev.pares, { idVehiculo: '', idConductor: '' }] }))
        setVehiculoInputs(prev => [...prev, ''])
        setConductorInputs(prev => [...prev, ''])
    }

    const handleQuitarPar = (index) => {
        const pares = form.pares.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '' }))
        setVehiculoInputs(prev => prev.filter((_, i) => i !== index))
        setConductorInputs(prev => prev.filter((_, i) => i !== index))
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            e.nombreRuta = validarCampo('nombreRuta', form)
            e.pares = validarPares(form.pares)
            e.idDestino = validarCampo('idDestino', form)
        }
        if (step === 1) {
            e.fechaSalida = validarCampo('fechaSalida', form)
            e.horaSalida = validarCampo('horaSalida', form)
        }
        Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
        return e
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }

        setSubmitting(true)
        setApiError(null)
        try {
            await registrarRutaProgramada({
                ...form,
                pares: form.pares
                    .filter(p => p.idVehiculo && p.idConductor)
                    .map(p => ({ idVehiculo: parseInt(p.idVehiculo), idConductor: parseInt(p.idConductor) })),
                idDestino:   parseInt(form.idDestino),
                observaciones: form.observaciones || '',
                estado: 'Programada'
            })
            showToast('¡Ruta programada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la ruta'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ nombreRuta: '', pares: [{ idVehiculo: '', idConductor: '' }], idDestino: '', fechaSalida: '', horaSalida: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setDestinoInput('')
        setVehiculoInputs([''])
        setConductorInputs([''])
        onClose?.()
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, elevation: 0, overflow: 'hidden',
    }

    const getVehiculoLabel = (id) => {
        const v = vehiculos.find(x => x.idVehiculo === parseInt(id))
        return v ? `${v.placa} - ${v.marca} ${v.modelo}` : '—'
    }
    const getConductorLabel = (id) => {
        const c = conductores.find(x => x.idConductor === parseInt(id))
        return c ? `${c.nombre} ${c.apellido}` : '—'
    }
    const getDestinoLabel = (id) => {
        const d = destinos.find(x => x.idDestino === parseInt(id))
        return d ? (d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`) : '—'
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Nombre de la Ruta" name="nombreRuta" value={form.nombreRuta}
                                onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, nombreRuta: validarCampo('nombreRuta', form) }))}
                                required error={errores.nombreRuta} helperText={errores.nombreRuta}
                                icon={RouteOutlinedIcon} inputProps={{ maxLength: 100 }} placeholder="Ej: Ruta Medellín - Bogotá" />
                            <Autocomplete
                                options={destinos}
                                getOptionLabel={(d) => d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`}
                                isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                                value={destinos.find(d => d.idDestino === parseInt(form.idDestino)) || null}
                                inputValue={destinoInput}
                                onInputChange={(_, newVal, reason) => {
                                    if (reason === 'input') setDestinoInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
                                    else setDestinoInput(newVal)
                                }}
                                onChange={(_, val) => handleChange({ target: { name: 'idDestino', value: val ? val.idDestino : '' } })}
                                onBlur={() => setErrores(prev => ({ ...prev, idDestino: validarCampo('idDestino', form) }))}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idDestino - a.idDestino).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(d =>
                                        normalizarTexto(d.nombre || '').includes(q) ||
                                        normalizarTexto(d.ciudad || '').includes(q) ||
                                        normalizarTexto(d.departamento || '').includes(q)
                                    )
                                }}
                                noOptionsText="No se encontraron destinos"
                                renderInput={(params) => (
                                    <TextField {...params} label="Destino *"
                                        error={!!errores.idDestino} helperText={errores.idDestino || 'Busca por nombre, ciudad o departamento'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }} sx={formFieldStyles} />
                                )}
                            />
                        </Box>

                        <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                            Vehículos y conductores de esta ruta
                        </Typography>
                        {errores.pares && (
                            <Typography variant="caption" color="error" sx={{ mt: -1.5 }}>{errores.pares}</Typography>
                        )}
                        {form.pares.map((par, index) => {
                            const vehiculosUsados = form.pares.filter((_, i) => i !== index).map(p => p.idVehiculo)
                            const conductoresUsados = form.pares.filter((_, i) => i !== index).map(p => p.idConductor)
                            const vehiculoSel = vehiculos.find(v => v.idVehiculo === parseInt(par.idVehiculo)) || null
                            const conductorSel = conductores.find(c => c.idConductor === parseInt(par.idConductor)) || null
                            return (
                                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1.5, alignItems: 'flex-start' }}>
                                    <Autocomplete
                                        options={vehiculos.filter(v => !vehiculosUsados.includes(v.idVehiculo))}
                                        getOptionLabel={(v) => `${v.placa} — ${v.marca} ${v.modelo}`}
                                        isOptionEqualToValue={(opt, val) => opt.idVehiculo === val.idVehiculo}
                                        value={vehiculoSel}
                                        inputValue={vehiculoInputs[index] || ''}
                                        onInputChange={(_, newVal, reason) => {
                                            const limpio = reason === 'input' ? newVal.replace(/[^a-zA-Z0-9\s\-_]/g, '') : newVal
                                            setVehiculoInputs(prev => prev.map((v, i) => i === index ? limpio : v))
                                        }}
                                        onChange={(_, val) => handleParChange(index, 'idVehiculo', val ? val.idVehiculo : '')}
                                        onBlur={() => setErrores(prev => ({ ...prev, pares: validarPares(form.pares) }))}
                                        filterOptions={(opts, { inputValue }) => {
                                            if (!inputValue.trim()) return [...opts].sort((a, b) => b.idVehiculo - a.idVehiculo).slice(0, 5)
                                            const q = normalizarTexto(inputValue)
                                            return opts.filter(v =>
                                                normalizarTexto(v.placa).includes(q) ||
                                                normalizarTexto(v.marca || '').includes(q) ||
                                                normalizarTexto(v.modelo || '').includes(q)
                                            )
                                        }}
                                        noOptionsText="No se encontraron vehículos"
                                        renderInput={(params) => (
                                            <TextField {...params} label="Vehículo *"
                                                helperText="Busca por placa, marca o modelo"
                                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 30 } }} sx={formFieldStyles} />
                                        )}
                                    />
                                    <Autocomplete
                                        options={conductores.filter(c => !conductoresUsados.includes(c.idConductor))}
                                        getOptionLabel={(c) => `${c.nombre} ${c.apellido}`}
                                        isOptionEqualToValue={(opt, val) => opt.idConductor === val.idConductor}
                                        value={conductorSel}
                                        inputValue={conductorInputs[index] || ''}
                                        onInputChange={(_, newVal, reason) => {
                                            const limpio = reason === 'input' ? newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, '') : newVal
                                            setConductorInputs(prev => prev.map((v, i) => i === index ? limpio : v))
                                        }}
                                        onChange={(_, val) => handleParChange(index, 'idConductor', val ? val.idConductor : '')}
                                        onBlur={() => setErrores(prev => ({ ...prev, pares: validarPares(form.pares) }))}
                                        filterOptions={(opts, { inputValue }) => {
                                            if (!inputValue.trim()) return [...opts].sort((a, b) => b.idConductor - a.idConductor).slice(0, 5)
                                            const q = normalizarTexto(inputValue)
                                            return opts.filter(c =>
                                                normalizarTexto(c.nombre).includes(q) ||
                                                normalizarTexto(c.apellido).includes(q) ||
                                                normalizarTexto(`${c.nombre} ${c.apellido}`).includes(q) ||
                                                normalizarTexto(c.numeroIdentificacion || '').includes(q)
                                            )
                                        }}
                                        noOptionsText="No se encontraron conductores"
                                        renderInput={(params) => (
                                            <TextField {...params} label="Conductor *"
                                                helperText="Busca por nombre, apellido o documento"
                                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }} sx={formFieldStyles} />
                                        )}
                                    />
                                    <IconButton onClick={() => handleQuitarPar(index)}
                                        disabled={form.pares.length === 1}
                                        sx={{ visibility: form.pares.length === 1 ? 'hidden' : 'visible', mt: 1 }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )
                        })}
                        <Button
                            onClick={handleAgregarPar}
                            startIcon={<AddOutlinedIcon />}
                            disabled={form.pares.length >= Math.min(MAX_PARES, vehiculos.length, conductores.length)}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                        >
                            Agregar vehículo y conductor
                        </Button>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <CalendarioDisponibilidad
                                label="Fecha de Salida"
                                required
                                value={form.fechaSalida}
                                onChange={(iso) => {
                                    setForm(prev => ({ ...prev, fechaSalida: iso }))
                                    setErrores(prev => ({ ...prev, fechaSalida: '' }))
                                    setApiError(null)
                                }}
                                pares={form.pares}
                                minDate={mananaISO()}
                                error={errores.fechaSalida}
                                helperText="Los días en rojo ya tienen a ese vehículo o conductor ocupado en otra ruta"
                            />
                            <Box sx={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <FormField label="Hora de Salida" name="horaSalida" type="time" value={form.horaSalida}
                                    onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, horaSalida: validarCampo('horaSalida', form) }))}
                                    required error={errores.horaSalida} helperText={errores.horaSalida}
                                    icon={ScheduleOutlinedIcon} InputLabelProps={{ shrink: true }} />
                                <FormField label="Hora Estimada de Llegada" name="horaLlegadaEstimada" type="time" value={form.horaLlegadaEstimada}
                                    onChange={handleChange} icon={ScheduleOutlinedIcon} InputLabelProps={{ shrink: true }}
                                    helperText="Opcional" />
                                <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                                    onChange={handleChange} icon={RouteOutlinedIcon}
                                    inputProps={{ maxLength: 500 }} placeholder="Ej: Salida por puerta norte"
                                    multiline rows={4}
                                    helperText={`Opcional · ${form.observaciones?.length || 0}/500`} />
                            </Box>
                        </Box>
                    </Box>
                )
            case 2:
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
                                    <RouteOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos de la Ruta</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información de la ruta</Typography>
                                <ConfirmRow label="Nombre"    value={form.nombreRuta} />
                                <ConfirmRow label="Destino"   value={getDestinoLabel(form.idDestino)} />
                                {form.pares.filter(p => p.idVehiculo && p.idConductor).map((par, i) => (
                                    <ConfirmRow key={i}
                                        label={form.pares.length > 1 ? `Vehículo ${i + 1}` : 'Vehículo'}
                                        value={`${getVehiculoLabel(par.idVehiculo)} · ${getConductorLabel(par.idConductor)}`} />
                                ))}
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <ScheduleOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Horario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica el horario</Typography>
                                <ConfirmRow label="Fecha Salida" value={formatFecha(form.fechaSalida)} />
                                <ConfirmRow label="Hora Salida"  value={form.horaSalida} />
                                <ConfirmRow label="Hora Llegada" value={form.horaLlegadaEstimada || 'N/A'} />
                                <ConfirmRow label="Observaciones" value={form.observaciones} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default: return null
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Ruta</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        Ingresa los datos de la nueva ruta paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
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

                <Box sx={{ px: 4, py: 2 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
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
                        variant="contained"
                        disabled={submitting}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 160,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
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

export default RegistrarRutaProgramacion

