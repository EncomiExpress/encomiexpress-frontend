import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, TextField, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const steps = ['Asignación', 'Estado y Fechas']

const RegistrarAnticipoExcedente = ({ open, onClose, onSuccess }) => {
    const { agregarAnticipo, conductores, rutas } = useAnticipos()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [conductorInput, setConductorInput] = useState('')
    const [rutaInput, setRutaInput] = useState('')

    const formInicial = {
        idConductor: '',
        idRuta: '',
        valorAnticipo: '',
        valorGastado: '',
        soporte: '',
        fechaEntrega: '',
        fechaLegalizacion: '',
        fechaEntregaExcedente: '',
    }

    const [form, setForm] = useState(formInicial)

    const handleClose = () => {
        setForm(formInicial)
        setErrores({})
        setActiveStep(0)
        setConductorInput('')
        setRutaInput('')
        onClose()
    }

    const NUMERIC_LIMITS = { valorAnticipo: 999999999, valorGastado: 999999999 }

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name in NUMERIC_LIMITS) {
            value = value.replace(/[^0-9.]/g, '')
            const num = parseFloat(value)
            if (!isNaN(num) && num > NUMERIC_LIMITS[name]) return
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
            if (form.fechaLegalizacion && form.fechaEntrega && form.fechaLegalizacion < form.fechaEntrega)
                e.fechaLegalizacion = 'La fecha de legalización no puede ser anterior a la fecha de entrega'
            if (form.fechaEntregaExcedente && form.fechaEntrega && form.fechaEntregaExcedente < form.fechaEntrega)
                e.fechaEntregaExcedente = 'La fecha de entrega del excedente no puede ser anterior a la fecha de entrega'
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
        try {
            await agregarAnticipo(form)
            showToast('¡Anticipo registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: getErrorMessage(err, 'Error al registrar el anticipo.') })
        } finally {
            setSubmitting(false)
        }
    }

    const formatMoney = (val) => {
        const num = parseFloat(val || 0)
        if (isNaN(num)) return '$0'
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
    }

    const getNombreConductor = (id) => {
        const c = conductores.find(c => c.idConductor === parseInt(id))
        return c ? c.nombre : '—'
    }

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : '—'
    }

    const excedente = parseFloat(form.valorAnticipo || 0) - parseFloat(form.valorGastado || 0)

    const cardSx = { flex: 1, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Autocomplete
                            options={conductores}
                            getOptionLabel={(c) => c.nombre}
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
                                    normalizarTexto(c.numeroIdentificacion || '').includes(q)
                                )
                            }}
                            noOptionsText="No se encontraron conductores"
                            renderInput={(params) => (
                                <TextField {...params} label="Conductor *"
                                    error={!!errores.idConductor} helperText={errores.idConductor || 'Busca por nombre, apellido o documento'}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }}
                                    sx={formFieldStyles} />
                            )}
                        />

                        <Autocomplete
                            options={rutas}
                            getOptionLabel={(r) => r.nombre}
                            isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
                            value={rutas.find(r => r.idRuta === parseInt(form.idRuta)) || null}
                            inputValue={rutaInput}
                            onInputChange={(_, newVal, reason) => {
                                if (reason === 'input') setRutaInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s\-_]/g, ''))
                                else setRutaInput(newVal)
                            }}
                            onChange={(_, val) => handleChange({ target: { name: 'idRuta', value: val ? val.idRuta : '' } })}
                            filterOptions={(opts, { inputValue }) => {
                                if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                                const q = normalizarTexto(inputValue)
                                return opts.filter(r => normalizarTexto(r.nombre).includes(q))
                            }}
                            noOptionsText="No se encontraron rutas"
                            renderInput={(params) => (
                                <TextField {...params} label="Ruta *"
                                    error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por nombre de la ruta'}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                    sx={formFieldStyles} />
                            )}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField
                                label="Valor del anticipo (COP)"
                                name="valorAnticipo"
                                value={form.valorAnticipo}
                                onChange={handleChange}
                                required
                                icon={AttachMoneyOutlinedIcon}
                                placeholder="Ej: 500000"
                                error={errores.valorAnticipo}
                                helperText={errores.valorAnticipo || 'Valor en pesos colombianos'}
                                inputProps={{ maxLength: 12 }}
                            />
                            <FormField
                                label="Valor gastado (COP)"
                                name="valorGastado"
                                value={form.valorGastado}
                                onChange={handleChange}
                                icon={AttachMoneyOutlinedIcon}
                                placeholder="Ej: 500000"
                                error={errores.valorGastado}
                                helperText={errores.valorGastado || 'Diligenciar al legalizar'}
                                inputProps={{ maxLength: 12 }}
                            />
                        </Box>

                        {/* Cálculo excedente */}
                        <Box sx={{
                            p: 3, borderRadius: 2,
                            backgroundColor: excedente >= 0 ? '#E8F5E9' : '#FFF3F3',
                            border: `1px solid ${excedente >= 0 ? '#A5D6A7' : '#FFCDD2'}`,
                            display: 'flex', alignItems: 'center', gap: 2,
                        }}>
                            <AttachMoneyIcon sx={{ color: excedente >= 0 ? '#2E7D32' : theme.palette.primary.main, fontSize: 32 }} />
                            <Box>
                                <Typography variant="caption" fontWeight={700}
                                    color={excedente >= 0 ? '#2E7D32' : theme.palette.primary.main}
                                    textTransform="uppercase" letterSpacing={0.8}>
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
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField
                                fullWidth label="Fecha de entrega" name="fechaEntrega" type="date"
                                value={form.fechaEntrega} onChange={handleChange} required
                                error={!!errores.fechaEntrega} helperText={errores.fechaEntrega}
                                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                            />
                            <TextField
                                fullWidth label="Fecha de legalización" name="fechaLegalizacion" type="date"
                                value={form.fechaLegalizacion} onChange={handleChange}
                                error={!!errores.fechaLegalizacion} helperText={errores.fechaLegalizacion || 'Opcional'}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.fechaEntrega || undefined } }} sx={formFieldStyles}
                            />
                        </Box>

                        <TextField
                            fullWidth label="Fecha entrega excedente" name="fechaEntregaExcedente" type="date"
                            value={form.fechaEntregaExcedente} onChange={handleChange}
                            error={!!errores.fechaEntregaExcedente} helperText={errores.fechaEntregaExcedente || 'Opcional'}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.fechaEntrega || undefined } }} sx={formFieldStyles}
                        />

                        <FormField
                            label="Observaciones"
                            name="soporte"
                            value={form.soporte}
                            onChange={handleChange}
                            multiline rows={3}
                            placeholder="Agrega alguna observación si es necesario..."
                            inputProps={{ maxLength: 500 }}
                            helperText={`Opcional · ${form.soporte?.length || 0}/500`}
                        />
                    </Box>
                )

            case 2:
                // Paso de confirmación antes de enviar (resumen)
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {errores.submit && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{errores.submit}</Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Asignación</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la asignación del anticipo</Typography>
                                <ConfirmRow label="Conductor" value={getNombreConductor(form.idConductor)} />
                                <ConfirmRow label="Ruta" value={getNombreRuta(form.idRuta)} />
                                <ConfirmRow label="Anticipo" value={formatMoney(form.valorAnticipo)} />
                                <ConfirmRow label="Gastado" value={form.valorGastado ? formatMoney(form.valorGastado) : '—'} />
                                <ConfirmRow label="Excedente" value={formatMoney(excedente)} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AttachMoneyIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Estado y Fechas</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica el estado y las fechas</Typography>
                                <ConfirmRow label="Estado" value="Entregado" />
                                <ConfirmRow label="F. Entrega" value={form.fechaEntrega || '—'} />
                                <ConfirmRow label="F. Legalización" value={form.fechaLegalizacion || '—'} />
                                <ConfirmRow label="F. Excedente" value={form.fechaEntregaExcedente || '—'} />
                                <ConfirmRow label="Observaciones" value={form.soporte || '—'} />
                            </Paper>
                        </Box>
                    </Box>
                )

            default:
                return null
        }
    }

    // steps tiene longitud 2; el paso 2 es la confirmación interna
    const totalSteps = steps.length  // 2

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>

            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Anticipo / Excedente</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Ingresa los datos del anticipo para el conductor.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{
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
                        onClick={activeStep < totalSteps - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        endIcon={activeStep < totalSteps - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                        }}>
                        {activeStep < totalSteps - 1
                            ? 'Siguiente'
                            : submitting ? 'Registrando...' : 'Registrar'
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarAnticipoExcedente

