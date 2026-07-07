import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete, TextField
} from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const mananaISO = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

const steps = ['Datos de la Ruta', 'Horario', 'Confirmación']

const RegistrarRutaProgramacion = ({ open, onClose, onSuccess }) => {
    const { registrarRutaProgramada } = useRutaProgramacion()
    const theme = useTheme()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados }    = useDestino()

    const [errores, setErrores]       = useState({})
    const [apiError, setApiError]     = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito]           = useState(false)
    const [destinoInput, setDestinoInput]     = useState('')
    const [conductorInput, setConductorInput] = useState('')
    const [vehiculoInput, setVehiculoInput]   = useState('')

    const vehiculos   = getVehiculosHabilitados()
    const conductores = getConductoresHabilitados()
    const destinos    = getDestinosHabilitados()

    const [form, setForm] = useState({
        nombreRuta: '',
        idVehiculo: '',
        idConductor: '',
        idDestino: '',
        fechaSalida: '',
        horaSalida: '',
        horaLlegadaEstimada: '',
        observaciones: ''
    })

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'nombreRuta') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            if (!form.nombreRuta?.trim()) e.nombreRuta  = 'El nombre de la ruta es obligatorio'
            if (!form.idVehiculo)         e.idVehiculo  = 'Selecciona un vehículo'
            if (!form.idConductor)        e.idConductor = 'Selecciona un conductor'
            if (!form.idDestino)          e.idDestino   = 'Selecciona un destino'
        }
        if (step === 1) {
            if (!form.fechaSalida) e.fechaSalida = 'La fecha de salida es obligatoria'
            else if (form.fechaSalida < mananaISO()) e.fechaSalida = 'La fecha de salida debe ser posterior a hoy'
            if (!form.horaSalida)  e.horaSalida  = 'La hora de salida es obligatoria'
        }
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
                idVehiculo:  parseInt(form.idVehiculo),
                idConductor: parseInt(form.idConductor),
                idDestino:   parseInt(form.idDestino),
                observaciones: form.observaciones || '',
                estado: 'Programada'
            })
            setExito(true)
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar la ruta')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setForm({ nombreRuta: '', idVehiculo: '', idConductor: '', idDestino: '', fechaSalida: '', horaSalida: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setExito(false)
        setDestinoInput('')
        setConductorInput('')
        setVehiculoInput('')
        onClose?.()
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'white', elevation: 0, overflow: 'hidden',
    }

    const getVehiculoLabel = (id) => {
        const v = vehiculos.find(x => x.idVehiculo === parseInt(id))
        return v ? `${v.placa} - ${v.marca} ${v.modelo}` : id
    }
    const getConductorLabel = (id) => {
        const c = conductores.find(x => x.idConductor === parseInt(id))
        return c ? `${c.nombre} ${c.apellido}` : id
    }
    const getDestinoLabel = (id) => {
        const d = destinos.find(x => x.idDestino === parseInt(id))
        return d ? (d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`) : id
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombre de la Ruta" name="nombreRuta" value={form.nombreRuta}
                            onChange={handleChange} required error={errores.nombreRuta} helperText={errores.nombreRuta}
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
                        <Autocomplete
                            options={conductores}
                            getOptionLabel={(c) => `${c.nombre} ${c.apellido}`}
                            isOptionEqualToValue={(opt, val) => opt.idConductor === val.idConductor}
                            value={conductores.find(c => c.idConductor === parseInt(form.idConductor)) || null}
                            inputValue={conductorInput}
                            onInputChange={(_, newVal, reason) => {
                                if (reason === 'input') setConductorInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, ''))
                                else setConductorInput(newVal)
                            }}
                            onChange={(_, val) => handleChange({ target: { name: 'idConductor', value: val ? val.idConductor : '' } })}
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
                                    error={!!errores.idConductor} helperText={errores.idConductor || 'Busca por nombre, apellido o documento'}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }} sx={formFieldStyles} />
                            )}
                        />
                        <Autocomplete
                            options={vehiculos}
                            getOptionLabel={(v) => `${v.placa} — ${v.marca} ${v.modelo}`}
                            isOptionEqualToValue={(opt, val) => opt.idVehiculo === val.idVehiculo}
                            value={vehiculos.find(v => v.idVehiculo === parseInt(form.idVehiculo)) || null}
                            inputValue={vehiculoInput}
                            onInputChange={(_, newVal, reason) => {
                                if (reason === 'input') setVehiculoInput(newVal.replace(/[^a-zA-Z0-9\s\-_]/g, ''))
                                else setVehiculoInput(newVal)
                            }}
                            onChange={(_, val) => handleChange({ target: { name: 'idVehiculo', value: val ? val.idVehiculo : '' } })}
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
                                    error={!!errores.idVehiculo} helperText={errores.idVehiculo || 'Busca por placa, marca o modelo'}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 30 } }} sx={formFieldStyles} />
                            )}
                        />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Fecha de Salida" name="fechaSalida" type="date" value={form.fechaSalida}
                            onChange={handleChange} required error={errores.fechaSalida} helperText={errores.fechaSalida}
                            icon={EventOutlinedIcon} InputLabelProps={{ shrink: true }}
                            inputProps={{ min: mananaISO() }} />
                        <FormField label="Hora de Salida" name="horaSalida" type="time" value={form.horaSalida}
                            onChange={handleChange} required error={errores.horaSalida} helperText={errores.horaSalida}
                            icon={ScheduleOutlinedIcon} InputLabelProps={{ shrink: true }} />
                        <FormField label="Hora Estimada de Llegada" name="horaLlegadaEstimada" type="time" value={form.horaLlegadaEstimada}
                            onChange={handleChange} icon={ScheduleOutlinedIcon} InputLabelProps={{ shrink: true }}
                            helperText="Opcional" />
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange} icon={RouteOutlinedIcon}
                            inputProps={{ maxLength: 500 }} placeholder="Ej: Salida por puerta norte"
                            multiline rows={2}
                            helperText={`Opcional · ${form.observaciones?.length || 0}/500`} />
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
                                <ConfirmRow label="Vehículo"  value={getVehiculoLabel(form.idVehiculo)} />
                                <ConfirmRow label="Conductor" value={getConductorLabel(form.idConductor)} />
                                <ConfirmRow label="Destino"   value={getDestinoLabel(form.idDestino)} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <ScheduleOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Horario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica el horario</Typography>
                                <ConfirmRow label="Fecha"        value={form.fechaSalida} />
                                <ConfirmRow label="Hora Salida"  value={form.horaSalida} />
                                <ConfirmRow label="Hora Llegada" value={form.horaLlegadaEstimada || 'N/A'} />
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

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Ruta programada exitosamente!
                </Alert>
            </Snackbar>

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
                        endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
                        }}>
                        {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Registrar'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarRutaProgramacion

