import theme from '../../shared/styles/theme.js'
import { useState } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import RouteIcon from '@mui/icons-material/Route'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import EventIcon from '@mui/icons-material/Event'
import NotesIcon from '@mui/icons-material/Notes'
import CloseIcon from '@mui/icons-material/Close'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { FormField, FormSelect, formFieldStyles } from '../../shared/components/FormularioEstandarizado.jsx'

const COLORS = theme.palette

const steps = ['Asignación', 'Estado y Fechas']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const RegistrarAnticipoExcedente = ({ open, onClose, onSuccess }) => {
    const { agregarAnticipo, conductores, rutas } = useAnticipos()
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

    const handleClose = () => {
        setForm({
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
        setErrores({})
        setActiveStep(0)
        onClose()
    }

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
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: err.message || 'Error al registrar el anticipo.' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => handleClose()

    const formatMoney = (val) => {
        const num = parseFloat(val || 0)
        if (isNaN(num)) return '$0'
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
    }

    const excedente = parseFloat(form.valorAnticipo || 0) - parseFloat(form.valorGastado || 0)

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
                            {conductores.map(c => (
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
                            {rutas.map(r => (
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
                            <AttachMoneyIcon sx={{ color: excedente >= 0 ? '#2E7D32' : theme.palette.primary.main, fontSize: 32 }} />
                            <Box>
                                <Typography variant="caption" fontWeight={700} color={excedente >= 0 ? '#2E7D32' : theme.palette.primary.main} textTransform="uppercase" letterSpacing={0.8}>
                                    {excedente >= 0 ? 'Excedente a devolver' : 'Faltante (gasto mayor al anticipo)'}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color={excedente >= 0 ? '#2E7D32' : theme.palette.primary.main}>
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
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Registrar Anticipo / Excedente
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Ingresa los datos del anticipo para el conductor.
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
                    }}>
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
                            disabled={submitting}
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: theme.palette.primary.main,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                            }}>
                            {activeStep < steps.length - 1
                                ? 'Siguiente'
                                : submitting ? 'Registrando...' : 'Registrar'
                            }
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Anticipo registrado exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default RegistrarAnticipoExcedente