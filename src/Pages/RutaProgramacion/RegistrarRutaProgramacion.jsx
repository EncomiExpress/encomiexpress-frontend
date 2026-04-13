import { useState, useEffect } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useRutaProgramacion } from '../../Context/RutaProgramacionContext'
import { useTransporte } from '../../Context/TransporteContext'
import { useConductor } from '../../Context/ConductorContext'
import { useDestino } from '../../Context/DestinoContext'
import { FormField, FormSelect, formFieldStyles } from '../../Components/FormularioEstandarizado'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Datos de la Ruta', 'Horario y Vehículo', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const RegistrarRutaProgramacion = ({ open, onClose, onSuccess }) => {
    const { registrarRutaProgramada } = useRutaProgramacion()
    const { getTransportesHabilitados } = useTransporte()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados } = useDestino()

    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)

    const [vehiculos, setVehiculos] = useState([])
    const [conductores, setConductores] = useState([])
    const [destinos, setDestinos] = useState([])

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

    useEffect(() => {
        setVehiculos(getTransportesHabilitados())
        setConductores(getConductoresHabilitados())
        setDestinos(getDestinosHabilitados())
    }, [getTransportesHabilitados, getConductoresHabilitados, getDestinosHabilitados])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            if (!form.nombreRuta?.trim()) e.nombreRuta = 'El nombre de la ruta es obligatorio'
            if (!form.idVehiculo) e.idVehiculo = 'Selecciona un vehículo'
            if (!form.idConductor) e.idConductor = 'Selecciona un conductor'
            if (!form.idDestino) e.idDestino = 'Selecciona un destino'
        }
        if (step === 1) {
            if (!form.fechaSalida) e.fechaSalida = 'La fecha de salida es obligatoria'
            if (!form.horaSalida) e.horaSalida = 'La hora de salida es obligatoria'
        }
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

    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }

        setSubmitting(true)
        setApiError(null)
        try {
            registrarRutaProgramada({
                ...form,
                idVehiculo: parseInt(form.idVehiculo),
                idConductor: parseInt(form.idConductor),
                idDestino: parseInt(form.idDestino),
                observaciones: form.observaciones || '',
                estado: 'Programada'
            })
            setExito(true)
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar la ruta')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setForm({
            nombreRuta: '',
            idVehiculo: '',
            idConductor: '',
            idDestino: '',
            fechaSalida: '',
            horaSalida: '',
            horaLlegadaEstimada: '',
            observaciones: ''
        })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setExito(false)
        if (onClose) onClose()
    }

    const handleCancelar = () => handleClose()

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: 'white', elevation: 0,
        overflow: 'hidden',
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
        return d ? `${d.nombre} - ${d.ciudad}` : id
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombre de la Ruta" name="nombreRuta" value={form.nombreRuta}
                            onChange={handleChange} required error={errores.nombreRuta} helperText={errores.nombreRuta}
                            icon={RouteOutlinedIcon} inputProps={{ maxLength: 100 }} placeholder="Ej: Ruta Medellín - Bogotá" />
                        <FormSelect label="Vehículo" name="idVehiculo" value={form.idVehiculo}
                            onChange={handleChange} required error={errores.idVehiculo} helperText={errores.idVehiculo}>
                            {vehiculos.map((v) => (
                                <MenuItem key={v.idVehiculo} value={v.idVehiculo}>{v.placa} - {v.marca} {v.modelo}</MenuItem>
                            ))}
                        </FormSelect>
                        <FormSelect label="Conductor" name="idConductor" value={form.idConductor}
                            onChange={handleChange} required error={errores.idConductor} helperText={errores.idConductor}>
                            {conductores.map((c) => (
                                <MenuItem key={c.idConductor} value={c.idConductor}>{c.nombre} {c.apellido}</MenuItem>
                            ))}
                        </FormSelect>
                        <FormSelect label="Destino" name="idDestino" value={form.idDestino}
                            onChange={handleChange} required error={errores.idDestino} helperText={errores.idDestino}>
                            {destinos.map((d) => (
                                <MenuItem key={d.idDestino} value={d.idDestino}>{d.nombre} - {d.ciudad}</MenuItem>
                            ))}
                        </FormSelect>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Fecha de Salida" name="fechaSalida" type="date" value={form.fechaSalida}
                            onChange={handleChange} required error={errores.fechaSalida} helperText={errores.fechaSalida}
                            icon={EventOutlinedIcon} InputLabelProps={{ shrink: true }} />
                        <FormField label="Hora de Salida" name="horaSalida" type="time" value={form.horaSalida}
                            onChange={handleChange} required error={errores.horaSalida} helperText={errores.horaSalida}
                            icon={ScheduleOutlinedIcon} InputLabelProps={{ shrink: true }} />
                        <FormField label="Hora Estimada de Llegada" name="horaLlegadaEstimada" type="time" value={form.horaLlegadaEstimada}
                            onChange={handleChange} icon={ScheduleOutlinedIcon} InputLabelProps={{ shrink: true }} />
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange} icon={RouteOutlinedIcon}
                            inputProps={{ maxLength: 500 }} placeholder="Ej: Salida por puerta norte"
                            multiline rows={2} />
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
                                    <RouteOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Datos de la Ruta</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información de la ruta</Typography>
                                <ConfirmRow label="Nombre" value={form.nombreRuta} />
                                <ConfirmRow label="Vehículo" value={getVehiculoLabel(form.idVehiculo)} />
                                <ConfirmRow label="Conductor" value={getConductorLabel(form.idConductor)} />
                                <ConfirmRow label="Destino" value={getDestinoLabel(form.idDestino)} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <ScheduleOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Horario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica el horario</Typography>
                                <ConfirmRow label="Fecha" value={form.fechaSalida} />
                                <ConfirmRow label="Hora Salida" value={form.horaSalida} />
                                <ConfirmRow label="Hora Llegada" value={form.horaLlegadaEstimada || 'N/A'} />
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
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
                <Box>
                      <Typography variant="h6" fontWeight={700}>
                          Programar Ruta
                      </Typography>
                    <Typography variant="body2" color={COLORS.textMuted} sx={{ mt: 0.5, ml: 0.5 }}>
                        Ingresa los datos de la nueva ruta paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: '#8A94A6' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>

                <Stepper activeStep={activeStep} alternativeLabel
                    sx={{ mb: 3, mt: 2,
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

                <Box sx={{ maxWidth: 700, mx: 'auto', mt: 3 }}>
                    {renderStepContent()}
                </Box>

                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 3, pt: 2, borderTop: `1px solid ${COLORS.border}`,
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
                            disabled={submitting}
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                                '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
                            }}>
                            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Programar Ruta'}
                        </Button>
                    </Box>
                </Box>

            </DialogContent>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Ruta programada exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default RegistrarRutaProgramacion