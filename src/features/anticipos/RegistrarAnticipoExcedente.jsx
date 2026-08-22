import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, TextField, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete, CircularProgress, Avatar, Divider
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import PlacaDisplay from '../../shared/components/PlacaDisplay.jsx'
import * as ventaService from '../ventas/services/ventaService.js'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'
import { formatearMoneda, limpiarMonedaInput } from '../../shared/utils/formatters.js'

const steps = ['Datos del Anticipo', 'Confirmación']

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "Valor gastado" y las fechas de
// legalización/entrega de excedente no viven en este formulario — las registra el
// conductor cuando legaliza el anticipo, no el admin al crearlo (create() ni siquiera
// las acepta).
const validarCampo = (name, form) => {
    switch (name) {
        case 'idRuta':
            return form.idRuta ? '' : 'Selecciona una ruta'
        case 'idRutaVehiculoConductor':
            return form.idRutaVehiculoConductor ? '' : 'Selecciona el vehículo y conductor de la ruta'
        case 'valorAnticipo':
            if (!form.valorAnticipo) return 'El valor del anticipo es obligatorio'
            if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0) return 'Ingresa un valor válido mayor a 0'
            return ''
        case 'fechaEntrega':
            return form.fechaEntrega ? '' : 'La fecha de entrega es obligatoria'
        default:
            return ''
    }
}

const RegistrarAnticipoExcedente = ({ open, onClose, onSuccess }) => {
    const { agregarAnticipo, rutas } = useAnticipos()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [rutaInput, setRutaInput] = useState('')
    const [parInput, setParInput] = useState('')

    const formInicial = {
        idRuta: '',
        idRutaVehiculoConductor: '',
        valorAnticipo: '',
        fechaEntrega: '',
    }

    const [form, setForm] = useState(formInicial)

    // Cuántos paquetes tiene asignados cada par vehículo+conductor de la ruta elegida —
    // solo para avisar (no bloquear) si el par elegido para el anticipo va a salir vacío.
    const [paquetesPorPar, setPaquetesPorPar] = useState({})
    useEffect(() => {
        if (!form.idRuta) {
            setPaquetesPorPar({})
            return
        }
        let cancelado = false
        ventaService.getEncomiendas(undefined, { idRuta: form.idRuta, limit: 100 })
            .then(res => {
                if (cancelado) return
                const conteo = (res?.data || [])
                    .flatMap(v => v.paquetes || [])
                    .reduce((acc, p) => {
                        acc[p.idRutaVehiculoConductor] = (acc[p.idRutaVehiculoConductor] || 0) + 1
                        return acc
                    }, {})
                setPaquetesPorPar(conteo)
            })
            .catch(() => setPaquetesPorPar({}))
        return () => { cancelado = true }
    }, [form.idRuta])

    // Si la ruta elegida tiene un solo vehículo+conductor, no tiene caso elegir — se
    // autocompleta, igual que en Ventas con los paquetes cuando la ruta tiene 1 solo vehículo.
    useEffect(() => {
        const ruta = rutas.find(r => r.idRuta === parseInt(form.idRuta))
        const pares = ruta?.paresVehiculoConductor || []
        if (pares.length !== 1) return
        const unico = pares[0]
        setForm(prev => prev.idRutaVehiculoConductor === unico.idRutaVehiculoConductor
            ? prev
            : { ...prev, idRutaVehiculoConductor: unico.idRutaVehiculoConductor })
        setParInput(`${unico.placa || 'Sin placa'} — ${unico.conductorNombre}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.idRuta, rutas])

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(formInicial)
        setErrores({})
        setActiveStep(0)
        setRutaInput('')
        setParInput('')
        setPaquetesPorPar({})
        onClose()
    }

    const NUMERIC_LIMITS = { valorAnticipo: 999999999 }

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name in NUMERIC_LIMITS) {
            value = limpiarMonedaInput(value)
            const num = parseFloat(value)
            if (!isNaN(num) && num > NUMERIC_LIMITS[name]) return
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            e.idRuta = validarCampo('idRuta', form)
            e.idRutaVehiculoConductor = validarCampo('idRutaVehiculoConductor', form)
            e.valorAnticipo = validarCampo('valorAnticipo', form)
            e.fechaEntrega = validarCampo('fechaEntrega', form)
        }
        Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
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

    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form.idRuta))
    const pares = rutaSeleccionada?.paresVehiculoConductor || []
    const parSeleccionado = pares.find(p => p.idRutaVehiculoConductor === parseInt(form.idRutaVehiculoConductor))

    const getNombreConductor = () => parSeleccionado?.conductorNombre || '—'

    const getEtiquetaRuta = (r) => {
        if (!r) return '—'
        const destinoTxt = r.destino ? `${r.destino.ciudad}` : 'Sin destino'
        const tarifa = r.destino?.tarifaBase != null ? ` — $${Number(r.destino.tarifaBase).toLocaleString('es-CO')}` : ''
        return `${r.nombre} → ${destinoTxt}${tarifa}`
    }

    const getNombreRuta = (id) => getEtiquetaRuta(rutas.find(r => r.idRuta === parseInt(id)))

    const cardSx = { flex: 1, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Autocomplete
                            options={rutas}
                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                            getOptionLabel={getEtiquetaRuta}
                            isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
                            value={rutaSeleccionada || null}
                            inputValue={rutaInput}
                            onInputChange={(_, newVal, reason) => {
                                if (reason === 'input') setRutaInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s\-_]/g, ''))
                                else setRutaInput(newVal)
                            }}
                            onChange={(_, val) => {
                                setForm(prev => ({ ...prev, idRuta: val ? val.idRuta : '', idRutaVehiculoConductor: '' }))
                                setErrores(prev => ({
                                    ...prev,
                                    idRuta: val ? '' : (prev.idRuta ? validarCampo('idRuta', { idRuta: '' }) : prev.idRuta),
                                    idRutaVehiculoConductor: '',
                                }))
                                setParInput('')
                            }}
                            onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form) }))}
                            renderOption={(props, r) => {
                                const { key, ...rest } = props
                                return (
                                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{
                                            width: 34, height: 34, flexShrink: 0,
                                            backgroundColor: theme.palette.avatarDefault.bg,
                                            color: theme.palette.avatarDefault.color,
                                        }}>
                                            <RouteOutlinedIcon sx={{ fontSize: 18 }} />
                                        </Avatar>
                                        <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                            {r.nombre} → {r.destino?.ciudad || 'Sin destino'}
                                        </Typography>
                                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                            ${Number(r.destino?.tarifaBase || 0).toLocaleString('es-CO')}
                                        </Typography>
                                    </Box>
                                )
                            }}
                            filterOptions={(opts, { inputValue }) => {
                                if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                                const q = normalizarTexto(inputValue)
                                return opts.filter(r =>
                                    normalizarTexto(r.nombre).includes(q) ||
                                    normalizarTexto(r.destino?.ciudad || '').includes(q) ||
                                    normalizarTexto(r.destino?.departamento || '').includes(q)
                                )
                            }}
                            noOptionsText="No se encontraron rutas"
                            renderInput={(params) => (
                                <TextField {...params} label="Ruta *"
                                    error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por origen o destino'}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                    sx={formFieldStyles} />
                            )}
                        />

                        <Autocomplete
                            options={pares}
                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                            getOptionLabel={(p) => `${p.placa || 'Sin placa'} — ${p.conductorNombre}`}
                            isOptionEqualToValue={(opt, val) => opt.idRutaVehiculoConductor === val.idRutaVehiculoConductor}
                            value={parSeleccionado || null}
                            inputValue={parInput}
                            disabled={!form.idRuta}
                            onInputChange={(_, newVal, reason) => {
                                if (reason === 'input') setParInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s\-_]/g, ''))
                                else setParInput(newVal)
                            }}
                            onChange={(_, val) => {
                                setForm(prev => ({ ...prev, idRutaVehiculoConductor: val ? val.idRutaVehiculoConductor : '' }))
                                setErrores(prev => ({
                                    ...prev,
                                    idRutaVehiculoConductor: val ? '' : (prev.idRutaVehiculoConductor ? validarCampo('idRutaVehiculoConductor', { idRutaVehiculoConductor: '' }) : prev.idRutaVehiculoConductor),
                                }))
                            }}
                            onBlur={() => setErrores(prev => ({ ...prev, idRutaVehiculoConductor: validarCampo('idRutaVehiculoConductor', form) }))}
                            renderOption={(props, p) => {
                                const { key, ...rest } = props
                                const iniciales = (p.conductorNombre || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                                return (
                                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <PlacaDisplay placa={p.placa} theme={theme} />
                                        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                            <Avatar sx={{
                                                width: 28, height: 28, flexShrink: 0,
                                                backgroundColor: theme.palette.avatarDefault.bg,
                                                color: theme.palette.avatarDefault.color,
                                                fontSize: '0.68rem', fontWeight: 700,
                                            }}>
                                                {iniciales}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ minWidth: 0 }}>
                                                {p.conductorNombre}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )
                            }}
                            noOptionsText={form.idRuta ? 'No hay vehículos en esta ruta' : 'Primero selecciona una ruta'}
                            renderInput={(params) => (
                                <TextField {...params} label="Vehículo y conductor *"
                                    error={!!errores.idRutaVehiculoConductor} helperText={errores.idRutaVehiculoConductor || 'Elige a cuál vehículo/conductor de la ruta corresponde este anticipo'}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={formFieldStyles} />
                            )}
                        />

                        {parSeleccionado && !(paquetesPorPar[parSeleccionado.idRutaVehiculoConductor] > 0) && (
                            <Alert severity="warning" sx={{ borderRadius: 2, mt: -1 }}>
                                Este vehículo no tiene paquetes asignados en esta ruta — el anticipo se registrará igual, solo confírmalo a propósito.
                            </Alert>
                        )}

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField
                                label="Valor del anticipo (COP)"
                                name="valorAnticipo"
                                value={formatearMoneda(form.valorAnticipo)}
                                onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, valorAnticipo: validarCampo('valorAnticipo', form) }))}
                                required
                                icon={AttachMoneyOutlinedIcon}
                                placeholder="Ej: 500.000"
                                error={errores.valorAnticipo}
                                helperText={errores.valorAnticipo || 'Valor en pesos colombianos'}
                                inputProps={{ maxLength: 11 }}
                            />
                            <TextField
                                fullWidth label="Fecha de entrega" name="fechaEntrega" type="date"
                                value={form.fechaEntrega} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, fechaEntrega: validarCampo('fechaEntrega', form) }))} required
                                error={!!errores.fechaEntrega} helperText={errores.fechaEntrega}
                                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                            />
                        </Box>
                    </Box>
                )

            case 1:
                // Paso de confirmación antes de enviar (resumen)
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {errores.submit && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{errores.submit}</Alert>
                        )}
                        <Paper elevation={0} sx={cardSx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos del Anticipo</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos antes de registrar</Typography>
                            <ConfirmRow label="Ruta" value={getNombreRuta(form.idRuta)} />
                            <ConfirmRow label="Vehículo" value={parSeleccionado?.placa || '—'} />
                            <ConfirmRow label="Conductor" value={getNombreConductor()} />
                            <ConfirmRow label="Anticipo" value={formatMoney(form.valorAnticipo)} />
                            <ConfirmRow label="F. Entrega" value={form.fechaEntrega || '—'} />
                        </Paper>
                    </Box>
                )

            default:
                return null
        }
    }

    const totalSteps = steps.length

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
                        endIcon={submitting ? undefined : (activeStep < totalSteps - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 160,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                        }}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < totalSteps - 1 ? 'Siguiente' : 'Registrar')
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarAnticipoExcedente

