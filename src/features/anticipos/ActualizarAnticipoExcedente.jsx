import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, TextField, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete, CircularProgress, Avatar, Divider
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import PlacaDisplay from '../../shared/components/PlacaDisplay.jsx'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { formatFecha, formatearMoneda, limpiarMonedaInput } from '../../shared/utils/formatters.js'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const steps = ['Datos del Anticipo', 'Confirmación']

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). idRuta/valorAnticipo/fechaEntrega
// solo son editables (no disabled) cuando puedeEditarAsignacion es true, así que su
// onBlur nunca dispara fuera de ese caso. "Fecha entrega excedente" no vive en este
// formulario — la pone entregarExcedente() sola, nunca se edita a mano.
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

const ActualizarAnticipoExcedente = ({ open, onClose, anticipo: anticipoProp, onSuccess }) => {
    const { anticipos, actualizarAnticipo, rutas } = useAnticipos()
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
    const [rutaInput, setRutaInput] = useState('')
    const [parInput, setParInput] = useState('')

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
        // "rutas" del contexto solo trae rutas "Programada" (son las únicas asignables a
        // un anticipo nuevo) — la ruta real de este anticipo puede ya estar "En Curso" o
        // más adelante, así que si no aparece ahí se arma un par sintético con los datos
        // que ya trae el anticipo, solo para mostrarlo (el campo queda deshabilitado).
        const r = rutas.find(x => x.idRuta === anticipo.idRuta)
        const parInicial = r?.paresVehiculoConductor?.find(p => p.idConductor === anticipo.idConductor)
        const nombreConductorAnticipo = anticipo.conductor?.usuario
            ? `${anticipo.conductor.usuario.nombre} ${anticipo.conductor.usuario.apellido}`
            : '—'
        const parSintetico = !r ? {
            idRutaVehiculoConductor: `original-${anticipo.idConductor}`,
            idVehiculo: anticipo.ruta?.vehiculo?.idVehiculo,
            idConductor: anticipo.idConductor,
            placa: anticipo.ruta?.vehiculo?.placa || '',
            conductorNombre: nombreConductorAnticipo,
        } : null
        const datos = {
            ...anticipo,
            idRutaVehiculoConductor: parInicial?.idRutaVehiculoConductor || parSintetico?.idRutaVehiculoConductor || '',
            fechaEntrega: anticipo.fechaEntrega || '',
            // valorAnticipo llega como string desde el backend por ser columna DECIMAL
            // (ej. "500000.00") — se limpia a entero plano para que nunca se vea el
            // ".00" en el campo ni en la comparación de cambios.
            valorAnticipo: anticipo.valorAnticipo !== undefined && anticipo.valorAnticipo !== null
                ? String(Math.round(Number(anticipo.valorAnticipo)))
                : '',
        }
        setFormOriginal(datos)
        setForm(datos)
        setRutaInput(r ? r.nombre : (anticipo.ruta?.nombreRuta || ''))
        const parActivo = parInicial || parSintetico
        setParInput(parActivo ? `${parActivo.placa || 'Sin placa'} — ${parActivo.conductorNombre}` : '')
    }, [open, anticipoProp, anticipos, rutas])

    // Si se reasigna a una ruta con un solo vehículo+conductor, no tiene caso elegir —
    // se autocompleta, igual que en RegistrarAnticipoExcedente.jsx y que en Ventas con
    // los paquetes. Solo aplica mientras la asignación sigue siendo editable.
    useEffect(() => {
        if (anticipoOriginal?.estado !== 'Entregado') return
        const ruta = rutas.find(r => r.idRuta === parseInt(form?.idRuta))
        const pares = ruta?.paresVehiculoConductor || []
        if (pares.length !== 1) return
        const unico = pares[0]
        setForm(prev => (prev?.idRutaVehiculoConductor === unico.idRutaVehiculoConductor
            ? prev
            : { ...prev, idRutaVehiculoConductor: unico.idRutaVehiculoConductor }))
        setParInput(`${unico.placa || 'Sin placa'} — ${unico.conductorNombre}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form?.idRuta, rutas, anticipoOriginal])

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
        setSinCambios(false)
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
            // Este modal solo se abre con el anticipo en "Entregado" (el ícono
            // "Editar" del listado ya bloquea cualquier otro estado — legalizar
            // el anticipo, es decir registrar valorGastado, quedó como algo que
            // solo hace el conductor desde la app móvil). Por eso aquí solo se
            // mandan los campos de esa etapa.
            // `soporte` (comprobantes) no se edita desde la web — la subida de
            // archivos es exclusiva de la app móvil (POST /anticipos/:id/soporte),
            // así que no se reenvía acá.
            const payload = {
                idAnticipoExcedente: form.idAnticipoExcedente,
            }
            if (puedeEditarAsignacion) {
                payload.idRuta = form.idRuta
                payload.idRutaVehiculoConductor = form.idRutaVehiculoConductor
                payload.valorAnticipo = form.valorAnticipo
                payload.fechaEntrega = form.fechaEntrega
            }
            await actualizarAnticipo(payload)
            showToast('¡Anticipo actualizado exitosamente!', 'success')
            setTimeout(() => {
                cerrar()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: getErrorMessage(err, 'Error al actualizar el anticipo.') })
        } finally {
            setSubmitting(false)
        }
    }

    const cerrar = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        onClose()
    }

    const handleCancelar = () => cerrar()

    const formatMoney = (val) => {
        const num = parseFloat(val || 0)
        if (isNaN(num)) return '$0'
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
    }

    // Si la ruta elegida sigue "Programada", su conductor manda (por si se reasignó
    // el anticipo a otra ruta). Si no aparece ahí (ya avanzó de estado), se usa el
    // conductor que ya traía el anticipo desde que se cargó.
    const nombreConductorOriginal = anticipoOriginal?.conductor?.usuario
        ? `${anticipoOriginal.conductor.usuario.nombre} ${anticipoOriginal.conductor.usuario.apellido}`
        : '—'

    // Si la ruta ya avanzó de estado no aparece en "rutas" (solo trae "Programada") —
    // se arma una opción sintética con los datos del anticipo para que el Autocomplete no quede vacío.
    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form?.idRuta)) || (
        anticipoOriginal?.ruta
            ? {
                idRuta: anticipoOriginal.idRuta,
                nombre: anticipoOriginal.ruta.nombreRuta || `Ruta ${anticipoOriginal.idRuta}`,
                paresVehiculoConductor: [{
                    idRutaVehiculoConductor: `original-${anticipoOriginal.idConductor}`,
                    idVehiculo: anticipoOriginal.ruta.vehiculo?.idVehiculo,
                    idConductor: anticipoOriginal.idConductor,
                    placa: anticipoOriginal.ruta.vehiculo?.placa || '',
                    conductorNombre: nombreConductorOriginal,
                }],
            }
            : null
    )
    const pares = rutaSeleccionada?.paresVehiculoConductor || []
    const parSeleccionado = pares.find(p => p.idRutaVehiculoConductor === form?.idRutaVehiculoConductor)

    const getNombreConductor = () => parSeleccionado?.conductorNombre || nombreConductorOriginal

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : (anticipoOriginal?.ruta?.nombreRuta || '—')
    }

    // La ruta/conductor/valor del anticipo/fecha de entrega solo se pueden tocar
    // mientras el anticipo sigue "Entregado" (la ruta todavía no arrancó). De ahí
    // en adelante (En Legalización/Excedente pendiente/Completado) ni siquiera se
    // llega a abrir este modal (el ícono "Editar" ya queda bloqueado en la lista)
    // — legalizar el anticipo es tarea exclusiva del conductor desde la app móvil.
    const estadoActual = anticipoOriginal?.estado
    const puedeEditarAsignacion = estadoActual === 'Entregado'

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Autocomplete
                            options={rutas}
                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                            disabled={!puedeEditarAsignacion}
                            getOptionLabel={(r) => r.nombre}
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
                                setSinCambios(false)
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
                                            {r.nombre}
                                        </Typography>
                                    </Box>
                                )
                            }}
                            filterOptions={(opts, { inputValue }) => {
                                if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                                const q = normalizarTexto(inputValue)
                                return opts.filter(r => normalizarTexto(r.nombre).includes(q))
                            }}
                            noOptionsText="No se encontraron rutas"
                            renderInput={(params) => (
                                <TextField {...params} label="Ruta *"
                                    error={!!errores.idRuta}
                                    helperText={errores.idRuta || (puedeEditarAsignacion
                                        ? 'Busca por nombre de la ruta'
                                        : 'La ruta ya arrancó: no se puede reasignar')}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                    sx={formFieldStyles} />
                            )}
                        />

                        <Autocomplete
                            options={pares}
                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                            disabled={!puedeEditarAsignacion}
                            getOptionLabel={(p) => `${p.placa || 'Sin placa'} — ${p.conductorNombre}`}
                            isOptionEqualToValue={(opt, val) => opt.idRutaVehiculoConductor === val.idRutaVehiculoConductor}
                            value={parSeleccionado || null}
                            inputValue={parInput}
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
                                setSinCambios(false)
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
                            noOptionsText={form?.idRuta ? 'No hay vehículos en esta ruta' : 'Primero selecciona una ruta'}
                            renderInput={(params) => (
                                <TextField {...params} label="Vehículo y conductor *"
                                    error={!!errores.idRutaVehiculoConductor}
                                    helperText={errores.idRutaVehiculoConductor || (puedeEditarAsignacion
                                        ? 'Elige a cuál vehículo/conductor de la ruta corresponde este anticipo'
                                        : 'La ruta ya arrancó: no se puede reasignar')}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={formFieldStyles} />
                            )}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField
                                label="Valor del anticipo (COP)"
                                name="valorAnticipo"
                                value={formatearMoneda(form?.valorAnticipo)}
                                onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, valorAnticipo: validarCampo('valorAnticipo', form) }))}
                                required
                                disabled={!puedeEditarAsignacion}
                                icon={AttachMoneyOutlinedIcon}
                                placeholder="Ej: 500.000"
                                error={errores.valorAnticipo}
                                helperText={errores.valorAnticipo || (puedeEditarAsignacion ? 'Valor en pesos colombianos' : 'La ruta ya arrancó: no se puede modificar')}
                                inputProps={{ maxLength: 11 }}
                            />
                            <TextField
                                fullWidth label="Fecha de entrega" name="fechaEntrega" type="date"
                                value={form?.fechaEntrega || ''} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, fechaEntrega: validarCampo('fechaEntrega', form) }))} required
                                disabled={!puedeEditarAsignacion}
                                error={!!errores.fechaEntrega}
                                helperText={errores.fechaEntrega || (puedeEditarAsignacion ? undefined : 'La ruta ya arrancó: no se puede modificar')}
                                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
                            />
                        </Box>
                    </Box>
                )

            case 1: {
                // Paso de confirmación / resumen antes de guardar
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = formOriginal ? [
                    [form.idRutaVehiculoConductor, formOriginal.idRutaVehiculoConductor],
                    [form.idRuta, formOriginal.idRuta],
                    [form.valorAnticipo, formOriginal.valorAnticipo],
                    [form.fechaEntrega, formOriginal.fechaEntrega],
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
                        <Paper elevation={0} sx={cardSx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos del Anticipo</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos antes de guardar</Typography>
                            <ConfirmRow label="Ruta" value={getNombreRuta(form?.idRuta)} previousValue={formOriginal ? getNombreRuta(formOriginal.idRuta) : undefined} />
                            <ConfirmRow label="Vehículo" value={parSeleccionado?.placa || '—'} />
                            <ConfirmRow label="Conductor" value={getNombreConductor()} previousValue={formOriginal ? nombreConductorOriginal : undefined} />
                            <ConfirmRow label="Anticipo" value={formatMoney(form?.valorAnticipo)} previousValue={formOriginal ? formatMoney(formOriginal.valorAnticipo) : undefined} />
                            <ConfirmRow label="F. Entrega" value={formatFecha(form?.fechaEntrega)} previousValue={formOriginal ? formatFecha(formOriginal.fechaEntrega) : undefined} />
                        </Paper>
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
            <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth>
                <Box sx={{ p: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <Typography color={theme.palette.text.secondary}>Cargando datos del anticipo...</Typography>
                </Box>
            </Dialog>
        )
    }

    const totalSteps = steps.length  // 2; el paso 2 es confirmación interna

    return (
        <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>

            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Editar Anticipo / Excedente</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>Modifica los campos que necesites.</Typography>
                </Box>
                <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
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
                        endIcon={submitting ? undefined : (activeStep < totalSteps - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
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
                            : (activeStep < totalSteps - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarAnticipoExcedente

