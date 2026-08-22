import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useDestino } from './context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { hayDocumentoDuplicado } from '../../shared/utils/duplicados.js'
import { formatearMoneda, limpiarMonedaInput, esSoloRelleno } from '../../shared/utils/formatters.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'

const steps = ['Ubicación', 'Tarifa', 'Confirmación']

const departamentos = ['Antioquia', 'Córdoba']
const TARIFA_MAX = 999999999
const MENSAJE_CIUDAD_DUPLICADA = 'Ya existe un destino registrado con esta ciudad.'

// Ver el mismo comentario en RegistrarDestino.jsx -- ciudades reales de la empresa,
// no la lista oficial de municipios de cada departamento.
const CIUDADES_POR_DEPARTAMENTO = {
    Antioquia: ['Cáceres', 'Caucasia', 'El Bagre', 'Nechí', 'Puerto Valdivia', 'Tarazá', 'Zaragoza'],
    'Córdoba': ['Ayapel', 'Montelíbano', 'Montería', 'Puerto Libertador'],
}
const OTRA_CIUDAD = '__otra__'
const OTRO_DEPARTAMENTO = '__otro__'

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error).
const validarCampo = (name, form) => {
    switch (name) {
        case 'departamento':
            return form.departamento ? '' : 'Selecciona un departamento'
        case 'ciudad':
            return form.ciudad?.trim() ? '' : 'La ciudad es obligatoria'
        case 'direccion':
            if (form.direccion && esSoloRelleno(form.direccion)) return 'La dirección no puede contener solo espacios o guiones'
            return ''
        case 'tarifaBase':
            if (form.tarifaBase === '' || form.tarifaBase === undefined) return 'La tarifa base es obligatoria'
            if (isNaN(Number(form.tarifaBase)) || Number(form.tarifaBase) < 0) return 'La tarifa base debe ser un número positivo'
            if (Number(form.tarifaBase) > TARIFA_MAX) return `La tarifa base no puede ser mayor a $${TARIFA_MAX.toLocaleString('es-CO')}`
            return ''
        default:
            return ''
    }
}

const ActualizarDestino = ({ open, onClose, destino, onSuccess }) => {
    const { actualizarDestino, destinos } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)

    const [form, setForm] = useState({
        departamento: '',
        ciudad: '',
        direccion: '',
        tarifaBase: '',
    })
    // true cuando la ciudad del destino no está en la lista conocida para su
    // departamento (o el usuario eligió "Otra ciudad" a mano) -- se detecta también al
    // cargar un destino ya existente, por si su ciudad no está en CIUDADES_POR_DEPARTAMENTO.
    const [ciudadOtra, setCiudadOtra] = useState(false)
    // true cuando el departamento del destino no está en la lista fija (Antioquia/
    // Córdoba) -- fuerza también ciudadOtra, igual que al elegirlo a mano.
    const [departamentoOtro, setDepartamentoOtro] = useState(false)

    useEffect(() => {
        if (destino && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const initial = {
                departamento: destino.departamento || '',
                ciudad: destino.ciudad || '',
                direccion: destino.direccion || '',
                // destino.tarifaBase llega como string desde el backend por ser una columna
                // DECIMAL (ej. "10000.00") — se limpia a un entero plano ("10000") para que
                // nunca se vea ".00" en el campo ni en la comparación de cambios.
                tarifaBase: destino.tarifaBase !== undefined && destino.tarifaBase !== null
                    ? String(Math.round(Number(destino.tarifaBase)))
                    : '',
            }
            setForm(initial)
            setOriginalData(initial)
            const esDeptoConocido = departamentos.includes(initial.departamento)
            setDepartamentoOtro(!!initial.departamento && !esDeptoConocido)
            const ciudadesConocidas = CIUDADES_POR_DEPARTAMENTO[initial.departamento] || []
            setCiudadOtra(!esDeptoConocido || (!!initial.ciudad && !ciudadesConocidas.includes(initial.ciudad)))
        }
    }, [destino, open])

    // Mismo criterio de comparación (sin mayúsculas/acentos) que ya usan Cliente/Conductor/
    // etc. para nombre y documento duplicado — se excluye este mismo destino de la
    // comparación (si no cambió de ciudad, no debe marcarse como duplicado de sí mismo).
    const validarCiudadDuplicada = (ciudad) =>
        hayDocumentoDuplicado(destinos, ciudad, { getDoc: d => d.ciudad, getId: d => d.idDestino, excludeId: destino?.idDestino })
            ? MENSAJE_CIUDAD_DUPLICADA : ''

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target
        if (name === 'ciudad' || name === 'departamento') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
        }
        if (name === 'tarifaBase') {
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
        setSinCambios(false)
    }

    const handleCiudadSelectChange = (e) => {
        const { value } = e.target
        if (value === OTRA_CIUDAD) {
            setCiudadOtra(true)
            setForm(prev => ({ ...prev, ciudad: '' }))
        } else {
            setCiudadOtra(false)
            const formActualizado = { ...form, ciudad: value }
            setForm(prev => ({ ...prev, ciudad: value }))
            setErrores(prev => prev.ciudad ? { ...prev, ciudad: validarCampo('ciudad', formActualizado) || validarCiudadDuplicada(value) } : prev)
        }
        setApiError(null)
        setSinCambios(false)
    }

    const handleDepartamentoSelectChange = (e) => {
        const { value } = e.target
        if (value === OTRO_DEPARTAMENTO) {
            setDepartamentoOtro(true)
            setCiudadOtra(true)
            setForm(prev => ({ ...prev, departamento: '', ciudad: '' }))
        } else {
            setDepartamentoOtro(false)
            setCiudadOtra(false)
            const formActualizado = { ...form, departamento: value, ciudad: '' }
            setForm(prev => ({ ...prev, departamento: value, ciudad: '' }))
            setErrores(prev => ({ ...prev, departamento: prev.departamento ? validarCampo('departamento', formActualizado) : prev.departamento, ciudad: undefined }))
        }
        setApiError(null)
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            e.departamento = validarCampo('departamento', form)
            e.ciudad = validarCampo('ciudad', form) || validarCiudadDuplicada(form.ciudad)
            e.direccion = validarCampo('direccion', form)
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
                direccion: form.direccion?.trim() || null,
                tarifaBase: Number(form.tarifaBase) || 0,
            })
            showToast('¡Destino actualizado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar el destino'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ departamento: '', ciudad: '', direccion: '', tarifaBase: '' })
        setCiudadOtra(false)
        setDepartamentoOtro(false)
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setSinCambios(false)
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
                        {departamentoOtro ? (
                            <Box>
                                <FormField
                                    label="Departamento" name="departamento" value={form.departamento} onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
                                    required error={errores.departamento} helperText={errores.departamento || 'Departamento nuevo — no está en la lista todavía'}
                                    inputProps={{ maxLength: 60 }}
                                    placeholder="Escribe el departamento"
                                />
                                <Typography
                                    onClick={() => { setDepartamentoOtro(false); setCiudadOtra(false); setForm(prev => ({ ...prev, departamento: '', ciudad: '' })) }}
                                    sx={{ fontSize: '0.75rem', color: theme.palette.primary.main, cursor: 'pointer', mt: 0.5, '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Elegir de la lista
                                </Typography>
                            </Box>
                        ) : (
                            <FormSelect
                                label="Departamento" name="departamento" value={form.departamento}
                                onChange={handleDepartamentoSelectChange}
                                onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
                                required error={errores.departamento} helperText={errores.departamento}
                            >
                                {departamentos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                <MenuItem value={OTRO_DEPARTAMENTO}>Otro departamento…</MenuItem>
                            </FormSelect>
                        )}
                        {(ciudadOtra || departamentoOtro) ? (
                            <Box>
                                <FormField
                                    label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, ciudad: validarCampo('ciudad', form) || validarCiudadDuplicada(form.ciudad) }))}
                                    required error={errores.ciudad} helperText={errores.ciudad || 'Ciudad nueva — no está en la lista todavía'}
                                    icon={LocationOnOutlinedIcon} inputProps={{ maxLength: 60 }}
                                    placeholder="Escribe la ciudad"
                                />
                                {!departamentoOtro && (
                                    <Typography
                                        onClick={() => { setCiudadOtra(false); setForm(prev => ({ ...prev, ciudad: '' })) }}
                                        sx={{ fontSize: '0.75rem', color: theme.palette.primary.main, cursor: 'pointer', mt: 0.5, '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Elegir de la lista
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <FormSelect
                                label="Ciudad" name="ciudad" value={form.ciudad}
                                onChange={handleCiudadSelectChange}
                                onBlur={() => setErrores(prev => ({ ...prev, ciudad: validarCampo('ciudad', form) || validarCiudadDuplicada(form.ciudad) }))}
                                required error={errores.ciudad} helperText={errores.ciudad}
                                disabled={!form.departamento}
                            >
                                {(CIUDADES_POR_DEPARTAMENTO[form.departamento] || []).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                <MenuItem value={OTRA_CIUDAD}>Otra ciudad…</MenuItem>
                            </FormSelect>
                        )}
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormField
                                label="Dirección de la oficina" name="direccion" value={form.direccion} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, direccion: validarCampo('direccion', form) }))}
                                error={errores.direccion}
                                helperText={errores.direccion || `Opcional · ${(form.direccion || '').length}/200`}
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
            case 2: {
                const tarifaActual = form.tarifaBase ? `$${Number(form.tarifaBase).toLocaleString('es-CO')}` : '—'
                const tarifaOriginal = originalData ? (originalData.tarifaBase ? `$${Number(originalData.tarifaBase).toLocaleString('es-CO')}` : '—') : undefined
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = originalData ? [
                    [form.departamento, originalData.departamento],
                    [form.ciudad, originalData.ciudad],
                    [form.direccion, originalData.direccion],
                    [form.tarifaBase, originalData.tarifaBase],
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
                            <ConfirmRow label="Departamento" value={form.departamento} previousValue={originalData?.departamento} />
                            <ConfirmRow label="Ciudad" value={form.ciudad} previousValue={originalData?.ciudad} />
                            <ConfirmRow label="Dirección" value={form.direccion || '—'} previousValue={originalData?.direccion || '—'} />
                            <ConfirmRow label="Tarifa Base" value={tarifaActual} previousValue={tarifaOriginal} />
                        </Paper>
                    </Box>
                )
            }
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
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
                        }}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarDestino

