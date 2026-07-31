import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { hayDocumentoDuplicado } from '../../shared/utils/duplicados.js'
import { formatearMoneda, limpiarMonedaInput } from '../../shared/utils/formatters.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'

const steps = ['Ubicación', 'Tarifa', 'Confirmación']

const departamentos = ['Antioquia', 'Córdoba']
const TARIFA_MAX = 999999999
const MENSAJE_CIUDAD_DUPLICADA = 'Ya existe un destino registrado con esta ciudad.'

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "direccion" no vive aquí:
// es opcional y no tiene ninguna regla que validar.
const validarCampo = (name, form) => {
    switch (name) {
        case 'departamento':
            return form.departamento ? '' : 'Selecciona un departamento'
        case 'ciudad':
            return form.ciudad?.trim() ? '' : 'La ciudad es obligatoria'
        case 'tarifaBase':
            if (form.tarifaBase === '' || form.tarifaBase === undefined) return 'La tarifa base es obligatoria'
            if (isNaN(Number(form.tarifaBase)) || Number(form.tarifaBase) < 0) return 'La tarifa base debe ser un número positivo'
            if (Number(form.tarifaBase) > TARIFA_MAX) return `La tarifa base no puede ser mayor a $${TARIFA_MAX.toLocaleString('es-CO')}`
            return ''
        default:
            return ''
    }
}

const RegistrarDestino = ({ open, onClose, onSuccess }) => {
    const { registrarDestino, destinos } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        departamento: '',
        ciudad: '',
        direccion: '',
        tarifaBase: '',
    })

    // Mismo criterio de comparación (sin mayúsculas/acentos) que ya usan Cliente/Conductor/
    // etc. para nombre y documento duplicado — acá no hace falta consultar al backend
    // porque el contexto ya trae todos los destinos cargados en memoria.
    const validarCiudadDuplicada = (ciudad) =>
        hayDocumentoDuplicado(destinos, ciudad, { getDoc: d => d.ciudad }) ? MENSAJE_CIUDAD_DUPLICADA : ''

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target
        if (name === 'ciudad') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
        }
        if (name === 'tarifaBase') {
            // Solo dígitos — los puntos de miles se muestran solos (formatearMoneda),
            // nunca se escriben a mano. Sin decimales: los valores de tarifa en pesos
            // colombianos no manejan centavos.
            value = limpiarMonedaInput(value)
            const num = parseFloat(value)
            if (!isNaN(num) && num > TARIFA_MAX) return
        }
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => {
            if (!prev[name]) return prev
            if (name === 'ciudad') return { ...prev, ciudad: validarCampo('ciudad', formActualizado) || validarCiudadDuplicada(value) }
            return { ...prev, [name]: validarCampo(name, formActualizado) }
        })
        setApiError(null)
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            e.departamento = validarCampo('departamento', form)
            e.ciudad = validarCampo('ciudad', form) || validarCiudadDuplicada(form.ciudad)
        }
        if (step === 1) {
            e.tarifaBase = validarCampo('tarifaBase', form)
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
            await registrarDestino({
                departamento: form.departamento,
                ciudad: form.ciudad,
                direccion: form.direccion?.trim() || null,
                tarifaBase: Number(form.tarifaBase) || 0,
            })
            showToast('¡Destino registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el destino'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ departamento: '', ciudad: '', direccion: '', tarifaBase: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        onClose()
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, elevation: 0,
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormSelect
                            label="Departamento" name="departamento" value={form.departamento}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
                            required error={errores.departamento} helperText={errores.departamento}
                        >
                            {departamentos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </FormSelect>
                        <FormField
                            label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, ciudad: validarCampo('ciudad', form) || validarCiudadDuplicada(form.ciudad) }))}
                            required error={errores.ciudad} helperText={errores.ciudad}
                            icon={LocationOnOutlinedIcon} inputProps={{ maxLength: 60 }}
                            placeholder="Ej: Medellín"
                        />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormField
                                label="Dirección de la oficina" name="direccion" value={form.direccion} onChange={handleChange}
                                helperText={`Opcional · ${(form.direccion || '').length}/200`}
                                icon={HomeOutlinedIcon} inputProps={{ maxLength: 200 }}
                                placeholder="Ej: Calle 30 #12-45, local 2"
                            />
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
                        <FormField
                            label="Tarifa Base (COP)" name="tarifaBase" value={formatearMoneda(form.tarifaBase)} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, tarifaBase: validarCampo('tarifaBase', form) }))}
                            required error={errores.tarifaBase} helperText={errores.tarifaBase || 'Valor en pesos colombianos'}
                            icon={AttachMoneyOutlinedIcon} inputProps={{ maxLength: 11 }}
                            placeholder="Ej: 25.000"
                        />
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
                        <Paper elevation={0} sx={cardSx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Resumen del Destino</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Verifica los datos antes de registrar
                            </Typography>
                            <ConfirmRow label="Departamento" value={form.departamento} />
                            <ConfirmRow label="Ciudad" value={form.ciudad} />
                            <ConfirmRow label="Dirección" value={form.direccion || '—'} />
                            <ConfirmRow label="Tarifa Base" value={form.tarifaBase ? `$${Number(form.tarifaBase).toLocaleString('es-CO')}` : '—'} />
                        </Paper>
                    </Box>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Destino</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        Complete los datos del nuevo destino paso a paso.
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
                        sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2 }}>
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

export default RegistrarDestino

