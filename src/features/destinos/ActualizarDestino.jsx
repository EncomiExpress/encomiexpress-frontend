import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'

const steps = ['Ubicación', 'Tarifa', 'Confirmación']

const departamentos = [
    'Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cundinamarca',
    'Chocó', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
    'Nariño', 'Norte de Santander', 'Quindío', 'Risaralda',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca'
]

const ActualizarDestino = ({ open, onClose, destino, onSuccess }) => {
    const { actualizarDestino } = useDestino()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)

    const [form, setForm] = useState({
        departamento: '',
        ciudad: '',
        tarifaBase: '',
    })

    useEffect(() => {
        if (destino && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const initial = {
                departamento: destino.departamento || '',
                ciudad: destino.ciudad || '',
                tarifaBase: destino.tarifaBase !== undefined ? String(destino.tarifaBase) : '',
            }
            setForm(initial)
            setOriginalData(initial)
        }
    }, [destino, open])

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'tarifaBase') {
            const filtered = value.replace(/[^0-9.]/g, '')
            setForm(prev => ({ ...prev, [name]: filtered }))
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            if (!form.departamento) e.departamento = 'Selecciona un departamento'
            if (!form.ciudad?.trim()) e.ciudad = 'La ciudad es obligatoria'
        }
        if (step === 1) {
            if (form.tarifaBase === '' || form.tarifaBase === undefined) {
                e.tarifaBase = 'La tarifa base es obligatoria'
            } else if (isNaN(Number(form.tarifaBase)) || Number(form.tarifaBase) < 0) {
                e.tarifaBase = 'La tarifa base debe ser un número positivo'
            }
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
        if (originalData) {
            const hayCambios = Object.keys(form).some(key => String(form[key]) !== String(originalData[key]))
            if (!hayCambios) {
                setSinCambios(true)
                return
            }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            await actualizarDestino({
                idDestino: destino.idDestino,
                departamento: form.departamento,
                ciudad: form.ciudad,
                tarifaBase: Number(form.tarifaBase) || 0,
            })
            setExito(true)
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al actualizar el destino')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setForm({ departamento: '', ciudad: '', tarifaBase: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setExito(false)
        setSinCambios(false)
        onClose()
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'white', elevation: 0,
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormSelect
                            label="Departamento" name="departamento" value={form.departamento}
                            onChange={handleChange} required error={errores.departamento} helperText={errores.departamento}
                        >
                            {departamentos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </FormSelect>
                        <FormField
                            label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange}
                            required error={errores.ciudad} helperText={errores.ciudad}
                            icon={LocationOnOutlinedIcon} inputProps={{ maxLength: 60 }}
                            placeholder="Ej: Medellín"
                        />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
                        <FormField
                            label="Tarifa Base (COP)" name="tarifaBase" value={form.tarifaBase} onChange={handleChange}
                            required error={errores.tarifaBase} helperText={errores.tarifaBase || 'Valor en pesos colombianos'}
                            icon={AttachMoneyOutlinedIcon} inputProps={{ maxLength: 12 }}
                            placeholder="Ej: 25000"
                        />
                    </Box>
                )
            case 2:
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
                        <Paper elevation={0} sx={cardSx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Resumen del Destino</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Verifica los cambios antes de guardar
                            </Typography>
                            <ConfirmRow label="Departamento" value={form.departamento} />
                            <ConfirmRow label="Ciudad" value={form.ciudad} />
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
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Editar Destino</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        {originalData?.ciudad ? `Modificando: ${originalData.ciudad}, ${originalData.departamento}` : 'Modifica los campos que necesites.'}
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
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}>
                    ¡Destino actualizado exitosamente!
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
                        sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2 }}>
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
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
                        }}>
                        {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarDestino

