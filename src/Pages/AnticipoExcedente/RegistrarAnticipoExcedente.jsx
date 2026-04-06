import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import RouteIcon from '@mui/icons-material/Route'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import EventIcon from '@mui/icons-material/Event'
import NotesIcon from '@mui/icons-material/Notes'
import { useAnticipos, conductoresMock, rutasMock } from '../../Context/AnticipoExcedenteContext'
import { FormField, FormSelect, formFieldStyles } from '../../Components/FormularioEstandarizado'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    secondary: '#1A2E6E',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Asignación', 'Estado y Fechas']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const RegistrarAnticipoExcedente = () => {
    const { agregarAnticipo } = useAnticipos()
    const navigate = useNavigate()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)

    const [form, setForm] = useState({
        idConductor: '',
        idRuta: '',
        valorAnticipo: '',
        valorGastado: '',
        estado: 'entregado',
        soporte: '',
        fechaEntrega: '',
        fechaLegalizacion: '',
        fechaEntregaExcedente: '',
    })

    const NUMERIC_LIMITS = {
        valorAnticipo: 999999999,
        valorGastado: 999999999,
    }

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name in NUMERIC_LIMITS && value !== '') {
            const num = parseFloat(value)
            if (!isNaN(num) && (num > NUMERIC_LIMITS[name] || num < 0)) return
        }

        if (name === 'soporte') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
        }

        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
    }

    const validarPaso = (step) => {
        const e = {}

        if (step === 0) {
            if (!form.idConductor) e.idConductor = 'Selecciona un conductor'
            if (!form.idRuta) e.idRuta = 'Selecciona una ruta'
            if (!form.valorAnticipo) e.valorAnticipo = 'El valor del anticipo es obligatorio'
            else if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0)
                e.valorAnticipo = 'Ingresa un valor válido mayor a 0'
            if (form.valorGastado !== '' && (isNaN(form.valorGastado) || parseFloat(form.valorGastado) < 0))
                e.valorGastado = 'Ingresa un valor válido'
        }

        if (step === 1) {
            if (!form.fechaEntrega) e.fechaEntrega = 'La fecha de entrega es obligatoria'
            if (!form.estado) e.estado = 'Selecciona un estado'
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
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }

        setSubmitting(true)
        try {
            agregarAnticipo(form)
            setExito(true)
            setTimeout(() => navigate('/anticipos/listar'), 1500)
        } catch (err) {
            setErrores({ submit: err.message || 'Error al registrar el anticipo.' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => navigate('/anticipos/listar')

    const formatMoney = (val) => {
        const num = parseFloat(val || 0)
        if (isNaN(num)) return '$0'
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
    }

    const excedente = parseFloat(form.valorAnticipo || 0) - parseFloat(form.valorGastado || 0)

    const getNombreConductor = (id) => {
        const c = conductoresMock.find(c => c.idConductor === parseInt(id))
        return c ? c.nombre : '—'
    }

    const getNombreRuta = (id) => {
        const r = rutasMock.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : '—'
    }

    const formatFecha = (fecha) => {
        if (!fecha) return '—'
        const [y, m, d] = fecha.split('-')
        return `${d}/${m}/${y}`
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormSelect
                            label="Conductor"
                            name="idConductor"
                            value={form.idConductor}
                            onChange={handleChange}
                            required
                            error={errores.idConductor}
                            helperText={errores.idConductor}
                        >
                            {conductoresMock.map(c => (
                                <MenuItem key={c.idConductor} value={c.idConductor}>
                                    {c.nombre}
                                </MenuItem>
                            ))}
                        </FormSelect>

                        <FormSelect
                            label="Ruta"
                            name="idRuta"
                            value={form.idRuta}
                            onChange={handleChange}
                            required
                            error={errores.idRuta}
                            helperText={errores.idRuta}
                        >
                            {rutasMock.map(r => (
                                <MenuItem key={r.idRuta} value={r.idRuta}>
                                    {r.nombre}
                                </MenuItem>
                            ))}
                        </FormSelect>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField
                                label="Valor del anticipo"
                                name="valorAnticipo"
                                type="number"
                                value={form.valorAnticipo}
                                onChange={handleChange}
                                required
                                error={errores.valorAnticipo}
                                helperText={errores.valorAnticipo || 'Ej: 500000'}
                                inputProps={{ min: 0, max: 999999999, step: 1 }}
                            />
                            <FormField
                                label="Valor gastado"
                                name="valorGastado"
                                type="number"
                                value={form.valorGastado}
                                onChange={handleChange}
                                error={errores.valorGastado}
                                helperText={errores.valorGastado || 'Diligenciar al legalizar'}
                                inputProps={{ min: 0, max: 999999999, step: 1 }}
                            />
                        </Box>

                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                backgroundColor: excedente >= 0 ? '#E8F5E9' : '#FFF3F3',
                                border: `1px solid ${excedente >= 0 ? '#A5D6A7' : '#FFCDD2'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <AttachMoneyIcon sx={{ color: excedente >= 0 ? '#2E7D32' : COLORS.primary, fontSize: 32 }} />
                            <Box>
                                <Typography variant="caption" fontWeight={700} color={excedente >= 0 ? '#2E7D32' : COLORS.primary} textTransform="uppercase" letterSpacing={0.8}>
                                    {excedente >= 0 ? 'Excedente a devolver' : 'Faltante (gasto mayor al anticipo)'}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color={excedente >= 0 ? '#2E7D32' : COLORS.primary}>
                                    {formatMoney(Math.abs(excedente))}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormSelect
                            label="Estado"
                            name="estado"
                            value={form.estado}
                            onChange={handleChange}
                            required
                            error={errores.estado}
                            helperText={errores.estado}
                        >
                            <MenuItem value="entregado">Entregado</MenuItem>
                            <MenuItem value="en legalización">En legalización</MenuItem>
                            <MenuItem value="legalizado">Legalizado</MenuItem>
                            <MenuItem value="excedente pendiente">Excedente pendiente</MenuItem>
                            <MenuItem value="cerrado">Cerrado</MenuItem>
                        </FormSelect>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField
                                fullWidth
                                label="Fecha de entrega *"
                                name="fechaEntrega"
                                type="date"
                                value={form.fechaEntrega}
                                onChange={handleChange}
                                required
                                error={!!errores.fechaEntrega}
                                helperText={errores.fechaEntrega}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={formFieldStyles}
                            />
                            <TextField
                                fullWidth
                                label="Fecha de legalización"
                                name="fechaLegalizacion"
                                type="date"
                                value={form.fechaLegalizacion}
                                onChange={handleChange}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={formFieldStyles}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Fecha entrega excedente"
                            name="fechaEntregaExcedente"
                            type="date"
                            value={form.fechaEntregaExcedente}
                            onChange={handleChange}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={formFieldStyles}
                        />

                        <FormField
                            label="Observaciones"
                            name="soporte"
                            value={form.soporte}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Agrega alguna observación si es necesario..."
                            inputProps={{ maxLength: 500 }}
                        />
                    </Box>
                )
            default:
                return null
        }
    }

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} color={COLORS.text}>Registrar Anticipo / Excedente</Typography>
                <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                    Ingresa los datos del anticipo para el conductor.
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
                            disabled={submitting}
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                            }}>
                            {activeStep < steps.length - 1
                                ? 'Siguiente'
                                : submitting ? 'Registrando...' : 'Registrar'
                            }
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" sx={{ fontWeight: 600 }}>
                    ¡Anticipo registrado exitosamente!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default RegistrarAnticipoExcedente