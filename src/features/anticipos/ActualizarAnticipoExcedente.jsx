import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, TextField, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { formatFecha } from '../../shared/utils/formatters.js'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const steps = ['Asignación', 'Fechas', 'Confirmación']

const ActualizarAnticipoExcedente = ({ open, onClose, anticipo: anticipoProp, onSuccess }) => {
    const { anticipos, actualizarAnticipo, conductores, rutas } = useAnticipos()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [anticipoOriginal, setAnticipoOriginal] = useState(null)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [form, setForm] = useState(null)
    const cargado = useRef(false)
    const [conductorInput, setConductorInput] = useState('')
    const [rutaInput, setRutaInput] = useState('')

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
        const c = conductores.find(x => x.idConductor === anticipo.idConductor)
        const r = rutas.find(x => x.idRuta === anticipo.idRuta)
        setConductorInput(c ? c.nombre : '')
        setRutaInput(r ? r.nombre : '')
    }, [open, anticipoProp, anticipos, conductores, rutas])

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
            showToast('¡Anticipo actualizado exitosamente!', 'success')
            setTimeout(() => {
                onClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: getErrorMessage(err, 'Error al actualizar el anticipo.') })
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
                        <Autocomplete
                            options={conductores}
                            getOptionLabel={(c) => c.nombre}
                            isOptionEqualToValue={(opt, val) => opt.idConductor === val.idConductor}
                            value={form ? (conductores.find(c => c.idConductor === parseInt(form.idConductor)) || null) : null}
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
                            value={form ? (rutas.find(r => r.idRuta === parseInt(form.idRuta)) || null) : null}
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
                                value={form?.valorAnticipo || ''}
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
                                value={form?.valorGastado || ''}
                                onChange={handleChange}
                                icon={AttachMoneyOutlinedIcon}
                                placeholder="Ej: 500000"
                                error={errores.valorGastado}
                                helperText={errores.valorGastado || 'Diligenciar al legalizar'}
                                inputProps={{ maxLength: 12 }}
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
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField
                                fullWidth label="Fecha de entrega" name="fechaEntrega" type="date"
                                value={form?.fechaEntrega || ''} onChange={handleChange} required
                                error={!!errores.fechaEntrega} helperText={errores.fechaEntrega}
                                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                            />
                            <TextField
                                fullWidth label="Fecha de legalización" name="fechaLegalizacion" type="date"
                                value={form?.fechaLegalizacion || ''} onChange={handleChange}
                                error={!!errores.fechaLegalizacion} helperText={errores.fechaLegalizacion || 'Opcional'}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form?.fechaEntrega || undefined } }} sx={formFieldStyles}
                            />
                        </Box>

                        <TextField
                            fullWidth label="Fecha entrega excedente" name="fechaEntregaExcedente" type="date"
                            value={form?.fechaEntregaExcedente || ''} onChange={handleChange}
                            error={!!errores.fechaEntregaExcedente} helperText={errores.fechaEntregaExcedente || 'Opcional'}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form?.fechaEntrega || undefined } }} sx={formFieldStyles}
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

            case 2: {
                // Paso de confirmación / resumen antes de guardar
                const excedenteOriginal = formOriginal ? parseFloat(formOriginal.valorAnticipo || 0) - parseFloat(formOriginal.valorGastado || 0) : undefined
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = formOriginal ? [
                    [form.idConductor, formOriginal.idConductor],
                    [form.idRuta, formOriginal.idRuta],
                    [form.valorAnticipo, formOriginal.valorAnticipo],
                    [form.valorGastado, formOriginal.valorGastado],
                    [form.fechaEntrega, formOriginal.fechaEntrega],
                    [form.fechaLegalizacion, formOriginal.fechaLegalizacion],
                    [form.fechaEntregaExcedente, formOriginal.fechaEntregaExcedente],
                    [form.soporte, formOriginal.soporte],
                ] : []
                const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {totalModificados > 0 && (
                            <Alert severity="info" icon={<EditOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                                Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
                            </Alert>
                        )}
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
                                <ConfirmRow label="Conductor" value={getNombreConductor(form?.idConductor)} previousValue={formOriginal ? getNombreConductor(formOriginal.idConductor) : undefined} />
                                <ConfirmRow label="Ruta" value={getNombreRuta(form?.idRuta)} previousValue={formOriginal ? getNombreRuta(formOriginal.idRuta) : undefined} />
                                <ConfirmRow label="Anticipo" value={formatMoney(form?.valorAnticipo)} previousValue={formOriginal ? formatMoney(formOriginal.valorAnticipo) : undefined} />
                                <ConfirmRow label="Gastado" value={form?.valorGastado ? formatMoney(form.valorGastado) : '—'} previousValue={formOriginal ? (formOriginal.valorGastado ? formatMoney(formOriginal.valorGastado) : '—') : undefined} />
                                <ConfirmRow label="Excedente" value={formatMoney(excedente)} previousValue={excedenteOriginal !== undefined ? formatMoney(excedenteOriginal) : undefined} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AttachMoneyIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Fechas</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica las fechas</Typography>
                                <ConfirmRow label="F. Entrega" value={formatFecha(form?.fechaEntrega)} previousValue={formOriginal ? formatFecha(formOriginal.fechaEntrega) : undefined} />
                                <ConfirmRow label="F. Legalización" value={formatFecha(form?.fechaLegalizacion)} previousValue={formOriginal ? formatFecha(formOriginal.fechaLegalizacion) : undefined} />
                                <ConfirmRow label="F. Excedente" value={formatFecha(form?.fechaEntregaExcedente)} previousValue={formOriginal ? formatFecha(formOriginal.fechaEntregaExcedente) : undefined} />
                                <ConfirmRow label="Observaciones" value={form?.soporte || '—'} previousValue={formOriginal?.soporte || '—'} />
                            </Paper>
                        </Box>
                    </Box>
                )
            }

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

