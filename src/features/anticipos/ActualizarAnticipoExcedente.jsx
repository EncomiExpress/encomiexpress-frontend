import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, Snackbar, TextField, Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CloseIcon from '@mui/icons-material/Close'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { FormField, FormSelect, formFieldStyles } from '../../shared/components/FormularioEstandarizado.jsx'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { formatFecha } from '../../shared/utils/formatters.js'

const ESTADO_COLORS = {
    'Entregado':           { bg: '#F3E8FF', color: '#A855F7' },
    'En Legalización':     { bg: '#DBEAFE', color: '#3B82F6' },
    'Excedente pendiente': { bg: '#FEF3C7', color: '#F59E0B' },
    'Completado':             { bg: '#F3E5F5', color: '#6A1B9A' },
}

const steps = ['Asignación', 'Estado y Fechas']

const ConfirmRowChip = ({ label, value, colors }) => {
    const theme = useTheme()

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Box sx={{
            display: 'inline-flex', alignItems: 'center',
            backgroundColor: colors?.bg || '#F3F4F6', color: colors?.color || '#6B7280',
            px: 1.5, py: 0.3, borderRadius: 10, fontWeight: 600, fontSize: '0.75rem', textTransform: 'capitalize',
        }}>
            {value || '—'}
        </Box>
    </Box>
    )
}

const ActualizarAnticipoExcedente = ({ open, onClose, anticipo: anticipoProp, onSuccess }) => {
    const { anticipos, actualizarAnticipo, conductores, rutas } = useAnticipos()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [anticipoOriginal, setAnticipoOriginal] = useState(null)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [form, setForm] = useState(null)
    const cargado = useRef(false)

    useEffect(() => {
        if (!open) { cargado.current = false; return }
        if (!anticipoProp || cargado.current) return
        cargado.current = true
        setActiveStep(0)
        setErrores({})
        setSinCambios(false)
        // Preferir la versión más reciente desde el estado del contexto
        const anticipo = anticipos.find(a => a.idAnticipoExcedente === anticipoProp.idAnticipoExcedente) || anticipoProp
        setAnticipoOriginal(anticipo)
        const datos = {
            ...anticipo,
            fechaEntrega: anticipo.fechaEntrega || '',
            fechaLegalizacion: anticipo.fechaLegalizacion || '',
            fechaEntregaExcedente: anticipo.fechaEntregaExcedente || '',
        }
        setFormOriginal(datos)
        setForm(datos)
    }, [open, anticipoProp, anticipos])

    const NUMERIC_LIMITS = { valorAnticipo: 999999999, valorGastado: 999999999 }

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
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            if (!form.idConductor) e.idConductor = 'Selecciona un conductor'
            if (!form.idRuta) e.idRuta = 'Selecciona una ruta'
            if (!form.valorAnticipo) e.valorAnticipo = 'El valor del anticipo es obligatorio'
            else if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0)
                e.valorAnticipo = 'Ingresa un valor válido mayor a 0'
            if (form.valorGastado !== '' && form.valorGastado !== 0 && (isNaN(form.valorGastado) || parseFloat(form.valorGastado) < 0))
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
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        // Verificar si hay cambios reales
        if (formOriginal) {
            const hayCambios = Object.keys(form).some(key => {
                const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
                const actual = form[key] !== undefined ? String(form[key]) : ''
                return original !== actual
            })
            if (!hayCambios) {
                setSinCambios(true)
                return
            }
        }

        setSinCambios(false)
        setSubmitting(true)
        try {
            await actualizarAnticipo(form)
            setExito(true)
            setTimeout(() => {
                onClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: err.message || 'Error al actualizar el anticipo.' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => onClose()

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

    const excedente = parseFloat(form?.valorAnticipo || 0) - parseFloat(form?.valorGastado || 0)

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
                        <FormSelect
                            label="Conductor"
                            name="idConductor"
                            value={form?.idConductor || ''}
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
                            value={form?.idRuta || ''}
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
                                value={form?.valorAnticipo || ''}
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
                                value={form?.valorGastado || ''}
                                onChange={handleChange}
                                error={errores.valorGastado}
                                helperText={errores.valorGastado || 'Diligenciar al legalizar'}
                                inputProps={{ min: 0, max: 999999999, step: 1 }}
                            />
                        </Box>

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
                                <Typography variant="h5" fontWeight={800}
                                    color={excedente >= 0 ? '#2E7D32' : theme.palette.primary.main}>
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
                            value={form?.estado || 'Entregado'}
                            onChange={handleChange}
                            required
                            error={errores.estado}
                            helperText={errores.estado}
                        >
                            <MenuItem value="Entregado" disabled={anticipoOriginal?.estado !== 'Entregado'}>Entregado</MenuItem>
                            <MenuItem value="En Legalización">En Legalización</MenuItem>
                            <MenuItem value="Excedente pendiente">Excedente pendiente</MenuItem>
                            <MenuItem value="Cerrado">Cerrado</MenuItem>
                        </FormSelect>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField
                                fullWidth label="Fecha de entrega *" name="fechaEntrega" type="date"
                                value={form?.fechaEntrega || ''} onChange={handleChange} required
                                error={!!errores.fechaEntrega} helperText={errores.fechaEntrega}
                                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                            />
                            <TextField
                                fullWidth label="Fecha de legalización" name="fechaLegalizacion" type="date"
                                value={form?.fechaLegalizacion || ''} onChange={handleChange}
                                helperText="Opcional"
                                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                            />
                        </Box>

                        <TextField
                            fullWidth label="Fecha entrega excedente" name="fechaEntregaExcedente" type="date"
                            value={form?.fechaEntregaExcedente || ''} onChange={handleChange}
                            helperText="Opcional"
                            slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                        />

                        <FormField
                            label="Observaciones"
                            name="soporte"
                            value={form?.soporte || ''}
                            onChange={handleChange}
                            multiline rows={3}
                            placeholder="Agrega alguna observación si es necesario..."
                            inputProps={{ maxLength: 500 }}
                            helperText={`Opcional · ${form?.soporte?.length || 0}/500`}
                        />
                    </Box>
                )

            case 2:
                // Paso de confirmación / resumen antes de guardar
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {sinCambios && (
                            <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                                No has realizado ningún cambio. Los datos ya están actualizados.
                            </Alert>
                        )}
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
                                <ConfirmRow label="Conductor" value={getNombreConductor(form?.idConductor)} />
                                <ConfirmRow label="Ruta" value={getNombreRuta(form?.idRuta)} />
                                <ConfirmRow label="Anticipo" value={formatMoney(form?.valorAnticipo)} />
                                <ConfirmRow label="Gastado" value={form?.valorGastado ? formatMoney(form.valorGastado) : '—'} />
                                <ConfirmRow label="Excedente" value={formatMoney(excedente)} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AttachMoneyIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Estado y Fechas</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica el estado y las fechas</Typography>
                                <ConfirmRowChip label="Estado" value={form?.estado} colors={ESTADO_COLORS[form?.estado]} />
                                <ConfirmRow label="F. Entrega" value={formatFecha(form?.fechaEntrega)} />
                                <ConfirmRow label="F. Legalización" value={formatFecha(form?.fechaLegalizacion)} />
                                <ConfirmRow label="F. Excedente" value={formatFecha(form?.fechaEntregaExcedente)} />
                                <ConfirmRow label="Observaciones" value={form?.soporte || '—'} />
                            </Paper>
                        </Box>
                    </Box>
                )

            default:
                return null
        }
    }

    if (!open) return null

    if (!form || !anticipoOriginal) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <Box sx={{ p: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <Typography color={theme.palette.text.secondary}>Cargando datos del anticipo...</Typography>
                </Box>
            </Dialog>
        )
    }

    const totalSteps = steps.length  // 2; el paso 2 es confirmación interna

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>

            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Editar Anticipo / Excedente</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>Modifica los campos que necesites.</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
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

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                    onClose={() => setExito(false)}>
                    ¡Anticipo actualizado exitosamente!
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
                    <Button onClick={handleCancelar} disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < totalSteps - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting || (activeStep === totalSteps - 1 && sinCambios)}
                        endIcon={activeStep < totalSteps - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
                        }}>
                        {activeStep < totalSteps - 1
                            ? 'Siguiente'
                            : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarAnticipoExcedente

