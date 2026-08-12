import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, Stepper, Step, StepLabel,
    Button, Alert, Dialog, DialogTitle, DialogContent, IconButton,
    Autocomplete, TextField, CircularProgress, Divider, Avatar
} from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import NacionSVG from '../../shared/components/NacionSVG.jsx'
import PlacaDisplay from '../../shared/components/PlacaDisplay.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import CalendarioDisponibilidad from '../../shared/components/CalendarioDisponibilidad.jsx'
import SelectorHora from '../../shared/components/SelectorHora.jsx'
import { formatFecha, esSoloRelleno } from '../../shared/utils/formatters.js'
import { normalizarTexto } from '../../shared/utils/duplicados.js'
import { vehiculoDocumentosVigentes, conductorLicenciaVigente } from '../../shared/utils/vigenciaDocumentos.js'
import { getRangoHorario, esDomingo, sumarDias, hoyISO, MIN_DIAS_SALIDA_LLEGADA, MAX_DIAS_ANTICIPACION } from '../../shared/utils/horarioLaboral.js'

const mananaISO = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const pad2 = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// Rutas son recorridos regionales cortos — no tiene sentido dejar programar una salida
// o llegada con meses/años de anticipación. Mismo tope para ambas fechas (no se reduce
// el de salida para "dejar espacio" al mínimo de llegada — si una combinación puntual
// no deja ningún día de llegada válido, se explica con un mensaje claro en el campo de
// llegada, en vez de reducir el calendario de salida sin avisar por qué). Debe
// coincidir con MAX_DIAS_ANTICIPACION del backend (rutaService.js/horarioLaboral.js).
const maxISO = () => sumarDias(hoyISO(), MAX_DIAS_ANTICIPACION)

const steps = ['Datos de la Ruta', 'Horario', 'Confirmación']

// Máximo de pares vehículo+conductor por ruta — igual al tope del backend (MAX_PARES_RUTA
// en rutaService.js), mismo criterio que MAX_PAQUETES en Ventas.
const MAX_PARES = 10

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "horaLlegadaEstimada" no vive
// aquí: es opcional y no tiene ninguna regla que validar.
// Sí se mantiene "fecha posterior a hoy" en fechaSalida (a diferencia de otros módulos
// como Vehículo/Conductor): una ruta solo se puede editar mientras sigue "Programada",
// así que su fecha de salida real siempre debe seguir siendo futura.
const validarCampo = (name, form) => {
    switch (name) {
        case 'origen':
            if (!form.origen?.trim()) return 'El origen de la ruta es obligatorio'
            if (esSoloRelleno(form.origen)) return 'El origen de la ruta no puede contener solo espacios o guiones'
            return ''
        case 'idDestino':
            return form.idDestino ? '' : 'Selecciona un destino'
        case 'fechaSalida':
            if (!form.fechaSalida) return 'La fecha de salida es obligatoria'
            if (form.fechaSalida < mananaISO()) return 'La fecha de salida debe ser posterior a hoy'
            if (form.fechaSalida > maxISO()) return `No se puede programar con más de ${MAX_DIAS_ANTICIPACION} días de anticipación (máximo el ${formatFecha(maxISO())})`
            if (esDomingo(form.fechaSalida)) return 'No se puede salir en domingo (la empresa permanece cerrada)'
            return ''
        case 'horaSalida': {
            if (!form.horaSalida) return 'La hora de salida es obligatoria'
            const rango = getRangoHorario(form.fechaSalida)
            if (rango && (form.horaSalida < rango.min || form.horaSalida > rango.max)) return `Debe estar entre las ${rango.min} y las ${rango.max}`
            return ''
        }
        case 'fechaLlegadaEstimada': {
            if (!form.fechaSalida) return 'Primero selecciona la fecha de salida'
            if (!form.fechaLlegadaEstimada) return 'La fecha de llegada es obligatoria'
            if (esDomingo(form.fechaLlegadaEstimada)) return 'No se puede llegar en domingo (la empresa permanece cerrada)'
            if (form.fechaLlegadaEstimada > maxISO()) return `No se puede programar con más de ${MAX_DIAS_ANTICIPACION} días de anticipación (máximo el ${formatFecha(maxISO())})`
            const minima = sumarDias(form.fechaSalida, MIN_DIAS_SALIDA_LLEGADA)
            if (form.fechaLlegadaEstimada < minima) return `Debe ser al menos ${MIN_DIAS_SALIDA_LLEGADA} días después de la salida (mínimo el ${formatFecha(minima)})`
            return ''
        }
        case 'horaLlegadaEstimada': {
            if (!form.horaLlegadaEstimada) return ''
            const rango = getRangoHorario(form.fechaLlegadaEstimada)
            if (rango && (form.horaLlegadaEstimada < rango.min || form.horaLlegadaEstimada > rango.max)) return `Debe estar entre las ${rango.min} y las ${rango.max}`
            return ''
        }
        case 'observaciones':
            if (form.observaciones && esSoloRelleno(form.observaciones)) return 'Las observaciones no pueden contener solo espacios o guiones'
            return ''
        default:
            return ''
    }
}

// Valida el array de pares vehículo+conductor (convoy de la ruta) — mismo patrón que
// validarCategorias() en RegistrarConductor.jsx para categoriasLicencia.
const validarPares = (pares) => {
    const completos = pares.filter(p => p.idVehiculo && p.idConductor)
    const incompletos = pares.some(p => (p.idVehiculo && !p.idConductor) || (!p.idVehiculo && p.idConductor))
    if (completos.length === 0) return 'Agrega al menos un vehículo y su conductor'
    if (incompletos) return 'Completa el vehículo y el conductor de cada fila (o quítala)'
    const idsVehiculo = completos.map(p => p.idVehiculo)
    const idsConductor = completos.map(p => p.idConductor)
    if (new Set(idsVehiculo).size !== idsVehiculo.length) return 'No repitas el mismo vehículo en dos filas'
    if (new Set(idsConductor).size !== idsConductor.length) return 'No repitas el mismo conductor en dos filas'
    return ''
}

const ActualizarRutaProgramacion = ({ open, onClose, ruta, onSuccess }) => {
    const { actualizarRutaProgramada } = useRutaProgramacion()
    const { showToast } = useToast()
    const theme = useTheme()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados }    = useDestino()

    const [errores, setErrores]         = useState({})
    const [apiError, setApiError]       = useState(null)
    const [activeStep, setActiveStep]   = useState(0)
    const [submitting, setSubmitting]   = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios]   = useState(false)
    const [destinoInput, setDestinoInput]     = useState('')
    const [vehiculoInputs, setVehiculoInputs]     = useState([''])
    const [conductorInputs, setConductorInputs]   = useState([''])
    const [refrescarDisponibilidad, setRefrescarDisponibilidad] = useState(0)

    // Sin tiempo real (WebSockets) en este proyecto, el calendario de disponibilidad
    // trae los datos una sola vez y podría quedar desactualizado si alguien más
    // programa otra ruta con el mismo vehículo/conductor mientras este formulario
    // sigue abierto. Se refresca cada vez que se ENTRA al paso "Horario" (índice 1) —
    // en cualquier dirección (con "Siguiente" desde Datos de la Ruta, o con "Anterior"
    // desde Confirmación) — mismo patrón ya usado para la capacidad en Ventas.
    useEffect(() => {
        if (activeStep !== 1) return
        setRefrescarDisponibilidad(k => k + 1)
    }, [activeStep])

    const vehiculos   = getVehiculosHabilitados()
    const conductores = getConductoresHabilitados()
    const destinos    = getDestinosHabilitados()

    // El backend rechaza igual asignar un vehículo con algún documento vencido o un
    // conductor sin licencia vigente — se excluyen acá antes para no dejar elegir algo
    // que de todas formas no puede transitar (ver validarDocumentosVehiculo/
    // tieneLicenciaVigente en rutaService.js del backend). Solo afecta las opciones
    // nuevas a elegir — un par ya asignado a esta ruta sigue mostrándose tal cual,
    // aunque su documento haya vencido después de haberlo asignado.
    const vehiculosSeleccionables = vehiculos.filter(vehiculoDocumentosVigentes)
    const conductoresSeleccionables = conductores.filter(c => conductorLicenciaVigente(c.categoriasLicencia))
    const vehiculosExcluidos = vehiculos.length - vehiculosSeleccionables.length
    const conductoresExcluidos = conductores.length - conductoresSeleccionables.length

    const [form, setForm] = useState({
        origen: '', pares: [{ idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }], idDestino: '',
        fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: ''
    })

    useEffect(() => {
        if (ruta && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const paresRuta = ruta.paresVehiculoConductor || []
            const pares = paresRuta.length > 0
                ? paresRuta.map(p => ({
                    idRutaVehiculoConductor: p.idRutaVehiculoConductor,
                    idVehiculo: p.idVehiculo || '',
                    idConductor: p.idConductor || '',
                }))
                : [{ idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }]
            const datos = {
                origen:          ruta.origen          || '',
                pares,
                idDestino:           ruta.idDestino           || '',
                fechaSalida:         ruta.fechaSalida         || '',
                horaSalida:          ruta.horaSalida          || '',
                fechaLlegadaEstimada:        ruta.fechaLlegadaEstimada        || '',
                horaLlegadaEstimada: ruta.horaLlegadaEstimada || '',
                observaciones:       ruta.observaciones       || ''
            }
            setForm(datos)
            setOriginalData(datos)
            // Si el vehículo/conductor/destino de esta ruta ya fue inhabilitado desde que
            // se creó, no aparece en las listas de habilitados — se usan los datos que ya
            // trae la propia ruta como respaldo, para que el campo nunca se vea vacío.
            const vHab = getVehiculosHabilitados()
            const cHab = getConductoresHabilitados()
            const d = getDestinosHabilitados().find(x => x.idDestino === ruta.idDestino)
            setVehiculoInputs(pares.map(p => {
                const v = vHab.find(x => x.idVehiculo === parseInt(p.idVehiculo))
                if (v) return `${v.placa} — ${v.marca} ${v.modelo}`
                const original = paresRuta.find(x => x.idVehiculo === parseInt(p.idVehiculo))?.vehiculo
                return original ? `${original.placa} — ${original.marca} ${original.modelo}` : ''
            }))
            setConductorInputs(pares.map(p => {
                const c = cHab.find(x => x.idConductor === parseInt(p.idConductor))
                if (c) return `${c.nombre} ${c.apellido}`
                const original = paresRuta.find(x => x.idConductor === parseInt(p.idConductor))?.conductor?.usuario
                return original ? `${original.nombre} ${original.apellido}` : ''
            }))
            setDestinoInput(d ? (d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`) : (ruta.destino ? `${ruta.destino.departamento} - ${ruta.destino.ciudad}` : ''))
        }
    }, [ruta, open, getVehiculosHabilitados, getConductoresHabilitados, getDestinosHabilitados])

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'origen') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const handleParChange = (index, campo, value) => {
        const pares = form.pares.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        // La fecha ya elegida se conserva — casi siempre sigue siendo válida con el
        // vehículo/conductor nuevo. El propio calendario recalcula la disponibilidad
        // para el par actualizado y marca el día en rojo si de verdad queda bloqueado
        // (ver CalendarioDisponibilidad, estilo de celda seleccionada+bloqueada).
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const handleAgregarPar = () => {
        setForm(prev => ({ ...prev, pares: [...prev.pares, { idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }] }))
        setVehiculoInputs(prev => [...prev, ''])
        setConductorInputs(prev => [...prev, ''])
        setSinCambios(false)
    }

    const handleQuitarPar = (index) => {
        const pares = form.pares.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '' }))
        setVehiculoInputs(prev => prev.filter((_, i) => i !== index))
        setConductorInputs(prev => prev.filter((_, i) => i !== index))
        setSinCambios(false)
    }

    // Opciones disponibles para la fila `index`: vehículos/conductores habilitados que no
    // estén ya usados en OTRA fila, más el propio (aunque esté inhabilitado) si es el que
    // ya traía esta fila — para que el Autocomplete no se vea vacío al editar.
    const getVehiculoOpciones = (index) => {
        const par = form.pares[index]
        const usados = form.pares.filter((_, i) => i !== index).map(p => parseInt(p.idVehiculo))
        // El backend rechaza igual un vehículo con documentos vencidos — se excluye acá
        // salvo que sea el que ya tenía asignado esta fila (ver el fallback abajo, que
        // igual lo vuelve a mostrar si venció después de haber sido asignado).
        const base = vehiculos.filter(v => !usados.includes(v.idVehiculo) && vehiculoDocumentosVigentes(v))
        if (par.idVehiculo && !base.some(v => v.idVehiculo === parseInt(par.idVehiculo))) {
            const original = (ruta?.paresVehiculoConductor || []).find(p => p.idVehiculo === parseInt(par.idVehiculo))?.vehiculo
            if (original) return [...base, original]
        }
        return base
    }
    const getConductorOpciones = (index) => {
        const par = form.pares[index]
        const usados = form.pares.filter((_, i) => i !== index).map(p => parseInt(p.idConductor))
        // El backend rechaza igual un conductor sin licencia vigente — se excluye acá
        // salvo que sea el que ya tenía asignado esta fila (ver el fallback abajo, que
        // igual lo vuelve a mostrar si venció después de haber sido asignado).
        const base = conductores.filter(c => !usados.includes(c.idConductor) && conductorLicenciaVigente(c.categoriasLicencia))
        if (par.idConductor && !base.some(c => c.idConductor === parseInt(par.idConductor))) {
            const original = (ruta?.paresVehiculoConductor || []).find(p => p.idConductor === parseInt(par.idConductor))?.conductor?.usuario
            if (original) return [...base, { idConductor: parseInt(par.idConductor), nombre: original.nombre, apellido: original.apellido }]
        }
        return base
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            e.origen = validarCampo('origen', form)
            e.pares = validarPares(form.pares)
            e.idDestino = validarCampo('idDestino', form)
        }
        if (step === 1) {
            e.fechaSalida = validarCampo('fechaSalida', form)
            e.horaSalida = validarCampo('horaSalida', form)
            e.fechaLlegadaEstimada = validarCampo('fechaLlegadaEstimada', form)
            e.horaLlegadaEstimada = validarCampo('horaLlegadaEstimada', form)
            e.observaciones = validarCampo('observaciones', form)
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

        if (originalData) {
            // Comparación genérica (String()) no sirve para "pares": es un array de
            // objetos y String() de eso siempre da "[object Object]" sin importar el
            // contenido — se compara aparte con JSON.stringify, igual que en Ventas.
            const hayCambiosPares = JSON.stringify(form.pares) !== JSON.stringify(originalData.pares)
            const hayCambios = hayCambiosPares || Object.keys(form).filter(k => k !== 'pares').some(key => {
                const orig = originalData[key] !== undefined ? String(originalData[key]) : ''
                const act  = form[key]         !== undefined ? String(form[key])         : ''
                return orig !== act
            })
            if (!hayCambios) { setSinCambios(true); return }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            // El id puede estar como idRuta (API) o idRutaProgramada (legacy)
            const id = ruta.idRuta ?? ruta.idRutaProgramada
            await actualizarRutaProgramada({
                idRuta: id,
                ...form,
                pares: form.pares
                    .filter(p => p.idVehiculo && p.idConductor)
                    .map(p => ({
                        ...(p.idRutaVehiculoConductor ? { idRutaVehiculoConductor: p.idRutaVehiculoConductor } : {}),
                        idVehiculo: parseInt(p.idVehiculo),
                        idConductor: parseInt(p.idConductor),
                    })),
                idDestino:   parseInt(form.idDestino),
                observaciones: form.observaciones || ''
            })
            showToast('¡Ruta actualizada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar la ruta'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ origen: '', pares: [{ idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }], idDestino: '', fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setOriginalData(null)
        setSinCambios(false)
        setDestinoInput('')
        setVehiculoInputs([''])
        setConductorInputs([''])
        onClose?.()
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, elevation: 0, overflow: 'hidden',
    }

    // Mismo respaldo que arriba (vehículo/conductor/destino inhabilitados desde que se creó la ruta).
    const getVehiculoLabel = (id) => {
        const v = vehiculos.find(x => x.idVehiculo === parseInt(id))
        if (v) return `${v.placa} - ${v.marca} ${v.modelo}`
        const original = (ruta?.paresVehiculoConductor || []).find(p => p.idVehiculo === parseInt(id))?.vehiculo
        return original ? `${original.placa} - ${original.marca} ${original.modelo}` : '—'
    }
    const getConductorLabel = (id) => {
        const c = conductores.find(x => x.idConductor === parseInt(id))
        if (c) return `${c.nombre} ${c.apellido}`
        const original = (ruta?.paresVehiculoConductor || []).find(p => p.idConductor === parseInt(id))?.conductor?.usuario
        return original ? `${original.nombre} ${original.apellido}` : '—'
    }
    const getDestinoLabel = (id) => {
        const d = destinos.find(x => x.idDestino === parseInt(id))
        if (d) return d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`
        if (ruta?.destino && parseInt(id) === ruta.idDestino) return `${ruta.destino.departamento} - ${ruta.destino.ciudad}`
        return '—'
    }

    // Mismo respaldo que arriba, pero como opción "sintética" para que el Autocomplete
    // tenga un value consistente (si no, algunos re-renders de MUI vacían el campo).
    const destinoSeleccionado = destinos.find(d => d.idDestino === parseInt(form.idDestino)) || (
        ruta?.destino && parseInt(form.idDestino) === ruta.idDestino
            ? { idDestino: ruta.idDestino, nombre: ruta.destino.nombre, ciudad: ruta.destino.ciudad, departamento: ruta.destino.departamento }
            : null
    )

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Origen" name="origen" value={form.origen}
                                onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, origen: validarCampo('origen', form) }))}
                                required error={errores.origen} helperText={errores.origen}
                                icon={RouteOutlinedIcon} inputProps={{ maxLength: 100 }} placeholder="Ej: Medellín" />
                            <Autocomplete
                                options={destinos}
                                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                getOptionLabel={(d) => `${d.ciudad} - ${d.departamento}`}
                                isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                                value={destinoSeleccionado}
                                inputValue={destinoInput}
                                onInputChange={(_, newVal, reason) => {
                                    if (reason === 'input') setDestinoInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
                                    else setDestinoInput(newVal)
                                }}
                                onChange={(_, val) => handleChange({ target: { name: 'idDestino', value: val ? val.idDestino : '' } })}
                                onBlur={() => setErrores(prev => ({ ...prev, idDestino: validarCampo('idDestino', form) }))}
                                renderOption={(props, d) => {
                                    const { key, ...rest } = props
                                    return (
                                        <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <NacionSVG color={theme.palette.primary.main} />
                                            </Box>
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                {d.ciudad}
                                            </Typography>
                                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                                {d.departamento}
                                            </Typography>
                                        </Box>
                                    )
                                }}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idDestino - a.idDestino).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(d =>
                                        normalizarTexto(d.nombre || '').includes(q) ||
                                        normalizarTexto(d.ciudad || '').includes(q) ||
                                        normalizarTexto(d.departamento || '').includes(q)
                                    )
                                }}
                                noOptionsText="No se encontraron destinos"
                                renderInput={(params) => (
                                    <TextField {...params} label="Destino *"
                                        error={!!errores.idDestino} helperText={errores.idDestino || 'Busca por nombre, ciudad o departamento'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }} sx={formFieldStyles} />
                                )}
                            />
                        </Box>

                        <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                            Vehículos y conductores de esta ruta
                        </Typography>
                        {errores.pares && (
                            <Typography variant="caption" color="error" sx={{ mt: -1.5 }}>{errores.pares}</Typography>
                        )}
                        {(vehiculosExcluidos > 0 || conductoresExcluidos > 0) && (
                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mt: -1.5 }}>
                                {vehiculosExcluidos > 0 && `${vehiculosExcluidos} vehículo${vehiculosExcluidos > 1 ? 's' : ''} oculto${vehiculosExcluidos > 1 ? 's' : ''} por documentos vencidos`}
                                {vehiculosExcluidos > 0 && conductoresExcluidos > 0 && ' · '}
                                {conductoresExcluidos > 0 && `${conductoresExcluidos} conductor${conductoresExcluidos > 1 ? 'es' : ''} oculto${conductoresExcluidos > 1 ? 's' : ''} por licencia vencida`}
                            </Typography>
                        )}
                        {form.pares.map((par, index) => {
                            const opcionesVehiculo = getVehiculoOpciones(index)
                            const opcionesConductor = getConductorOpciones(index)
                            const vehiculoSel = opcionesVehiculo.find(v => v.idVehiculo === parseInt(par.idVehiculo)) || null
                            const conductorSel = opcionesConductor.find(c => c.idConductor === parseInt(par.idConductor)) || null
                            return (
                                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1.5, alignItems: 'flex-start' }}>
                                    <Autocomplete
                                        options={opcionesVehiculo}
                                        popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                        getOptionLabel={(v) => `${v.placa} — ${v.marca} ${v.modelo}`}
                                        isOptionEqualToValue={(opt, val) => opt.idVehiculo === val.idVehiculo}
                                        value={vehiculoSel}
                                        inputValue={vehiculoInputs[index] || ''}
                                        onInputChange={(_, newVal, reason) => {
                                            const limpio = reason === 'input' ? newVal.replace(/[^a-zA-Z0-9\s\-_]/g, '') : newVal
                                            setVehiculoInputs(prev => prev.map((v, i) => i === index ? limpio : v))
                                        }}
                                        onChange={(_, val) => handleParChange(index, 'idVehiculo', val ? val.idVehiculo : '')}
                                        onBlur={() => setErrores(prev => ({ ...prev, pares: validarPares(form.pares) }))}
                                        renderOption={(props, v) => {
                                            const { key, ...rest } = props
                                            return (
                                                <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <PlacaDisplay placa={v.placa} theme={theme} />
                                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                        {v.marca} {v.modelo}
                                                    </Typography>
                                                </Box>
                                            )
                                        }}
                                        filterOptions={(opts, { inputValue }) => {
                                            if (!inputValue.trim()) return [...opts].sort((a, b) => b.idVehiculo - a.idVehiculo).slice(0, 5)
                                            const q = normalizarTexto(inputValue)
                                            return opts.filter(v =>
                                                normalizarTexto(v.placa).includes(q) ||
                                                normalizarTexto(v.marca || '').includes(q) ||
                                                normalizarTexto(v.modelo || '').includes(q)
                                            )
                                        }}
                                        noOptionsText="No se encontraron vehículos"
                                        renderInput={(params) => (
                                            <TextField {...params} label="Vehículo *"
                                                helperText="Busca por placa, marca o modelo"
                                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 30 } }} sx={formFieldStyles} />
                                        )}
                                    />
                                    <Autocomplete
                                        options={opcionesConductor}
                                        popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                        getOptionLabel={(c) => `${c.nombre} ${c.apellido}`}
                                        isOptionEqualToValue={(opt, val) => opt.idConductor === val.idConductor}
                                        value={conductorSel}
                                        inputValue={conductorInputs[index] || ''}
                                        onInputChange={(_, newVal, reason) => {
                                            const limpio = reason === 'input' ? newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, '') : newVal
                                            setConductorInputs(prev => prev.map((v, i) => i === index ? limpio : v))
                                        }}
                                        onChange={(_, val) => handleParChange(index, 'idConductor', val ? val.idConductor : '')}
                                        onBlur={() => setErrores(prev => ({ ...prev, pares: validarPares(form.pares) }))}
                                        renderOption={(props, c) => {
                                            const { key, ...rest } = props
                                            return (
                                                <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34, flexShrink: 0,
                                                        backgroundColor: theme.palette.avatarDefault.bg,
                                                        color: theme.palette.avatarDefault.color,
                                                        fontSize: '0.73rem', fontWeight: 700,
                                                    }}>
                                                        {c.nombre?.[0] || ''}{c.apellido?.[0] || ''}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                        {c.nombre} {c.apellido}
                                                    </Typography>
                                                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                                        {c.numeroIdentificacion}
                                                    </Typography>
                                                </Box>
                                            )
                                        }}
                                        filterOptions={(opts, { inputValue }) => {
                                            if (!inputValue.trim()) return [...opts].sort((a, b) => b.idConductor - a.idConductor).slice(0, 5)
                                            const q = normalizarTexto(inputValue)
                                            return opts.filter(c =>
                                                normalizarTexto(c.nombre).includes(q) ||
                                                normalizarTexto(c.apellido).includes(q) ||
                                                normalizarTexto(`${c.nombre} ${c.apellido}`).includes(q) ||
                                                normalizarTexto(c.numeroIdentificacion || '').includes(q)
                                            )
                                        }}
                                        noOptionsText="No se encontraron conductores"
                                        renderInput={(params) => (
                                            <TextField {...params} label="Conductor *"
                                                helperText="Busca por nombre, apellido o documento"
                                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }} sx={formFieldStyles} />
                                        )}
                                    />
                                    <IconButton onClick={() => handleQuitarPar(index)}
                                        disabled={form.pares.length === 1}
                                        sx={{ visibility: form.pares.length === 1 ? 'hidden' : 'visible', mt: 1 }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )
                        })}
                        <Button
                            onClick={handleAgregarPar}
                            startIcon={<AddOutlinedIcon />}
                            disabled={form.pares.length >= Math.min(MAX_PARES, vehiculos.length, conductores.length)}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                        >
                            Agregar vehículo y conductor
                        </Button>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <CalendarioDisponibilidad
                                label="Fecha de Salida"
                                required
                                value={form.fechaSalida}
                                onChange={(iso) => {
                                    // Si la salida cambia, la llegada ya elegida podría dejar de ser
                                    // válida (mínimo de días, o un nuevo choque con otra ruta) — se
                                    // limpia para que el usuario la vuelva a elegir sobre el calendario
                                    // ya actualizado, en vez de dejar una fecha inválida sin avisar.
                                    const formActualizado = { ...form, fechaSalida: iso, fechaLlegadaEstimada: '' }
                                    setForm(formActualizado)
                                    setErrores(prev => ({
                                        ...prev,
                                        fechaSalida: '',
                                        fechaLlegadaEstimada: '',
                                        horaSalida: prev.horaSalida ? validarCampo('horaSalida', formActualizado) : '',
                                    }))
                                    setApiError(null)
                                    setSinCambios(false)
                                }}
                                pares={form.pares}
                                idRutaExcluir={ruta?.idRuta ?? ruta?.idRutaProgramada}
                                minDate={mananaISO()}
                                maxDate={maxISO()}
                                refrescarKey={refrescarDisponibilidad}
                                error={errores.fechaSalida}
                                helperText="Los días en rojo ya tienen a ese vehículo o conductor ocupado en otra ruta"
                            />
                            <CalendarioDisponibilidad
                                modo="llegada"
                                fechaReferencia={form.fechaSalida}
                                label="Fecha Estimada de Llegada"
                                required
                                disabled={!form.fechaSalida}
                                value={form.fechaLlegadaEstimada}
                                onChange={(iso) => {
                                    setForm(prev => ({ ...prev, fechaLlegadaEstimada: iso }))
                                    setErrores(prev => ({ ...prev, fechaLlegadaEstimada: '' }))
                                    setApiError(null)
                                    setSinCambios(false)
                                }}
                                pares={form.pares}
                                idRutaExcluir={ruta?.idRuta ?? ruta?.idRutaProgramada}
                                minDate={form.fechaSalida ? sumarDias(form.fechaSalida, MIN_DIAS_SALIDA_LLEGADA) : mananaISO()}
                                maxDate={maxISO()}
                                refrescarKey={refrescarDisponibilidad}
                                error={errores.fechaLlegadaEstimada}
                                helperText={form.fechaSalida ? 'Los días en rojo ya tienen a ese vehículo o conductor ocupado en otra ruta' : 'Selecciona primero la fecha de salida'}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 1, minWidth: 220 }}>
                                <SelectorHora label="Hora de Salida" required
                                    value={form.horaSalida}
                                    onChange={(v) => {
                                        setForm(prev => ({ ...prev, horaSalida: v }))
                                        setErrores(prev => ({ ...prev, horaSalida: '' }))
                                        setSinCambios(false)
                                    }}
                                    onBlur={() => setErrores(prev => ({ ...prev, horaSalida: validarCampo('horaSalida', form) }))}
                                    rango={getRangoHorario(form.fechaSalida)}
                                    error={errores.horaSalida}
                                    helperText={form.fechaSalida ? 'Solo horario laboral' : 'Selecciona primero la fecha de salida'} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 220 }}>
                                <SelectorHora label="Hora Estimada de Llegada"
                                    value={form.horaLlegadaEstimada}
                                    onChange={(v) => {
                                        setForm(prev => ({ ...prev, horaLlegadaEstimada: v }))
                                        setErrores(prev => ({ ...prev, horaLlegadaEstimada: '' }))
                                        setSinCambios(false)
                                    }}
                                    onBlur={() => setErrores(prev => ({ ...prev, horaLlegadaEstimada: validarCampo('horaLlegadaEstimada', form) }))}
                                    rango={getRangoHorario(form.fechaLlegadaEstimada)}
                                    error={errores.horaLlegadaEstimada}
                                    helperText={form.fechaLlegadaEstimada ? 'Opcional' : 'Selecciona primero la fecha de llegada'} />
                            </Box>
                        </Box>
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, observaciones: validarCampo('observaciones', form) }))}
                            icon={RouteOutlinedIcon}
                            inputProps={{ maxLength: 500 }} placeholder="Ej: Salida por puerta norte"
                            multiline rows={3}
                            error={errores.observaciones}
                            helperText={errores.observaciones || `Opcional · ${form.observaciones?.length || 0}/500`} />
                    </Box>
                )
            case 2: {
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = originalData ? [
                    [form.origen, originalData.origen],
                    [JSON.stringify(form.pares), JSON.stringify(originalData.pares)],
                    [form.idDestino, originalData.idDestino],
                    [form.fechaSalida, originalData.fechaSalida],
                    [form.horaSalida, originalData.horaSalida],
                    [form.fechaLlegadaEstimada, originalData.fechaLlegadaEstimada],
                    [form.horaLlegadaEstimada, originalData.horaLlegadaEstimada],
                    [form.observaciones, originalData.observaciones],
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
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <RouteOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos de la Ruta y Horario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información y el horario de la ruta</Typography>
                                <ConfirmRow label="Origen"    value={form.origen} previousValue={originalData?.origen} />
                                <ConfirmRow label="Destino"   value={getDestinoLabel(form.idDestino)} previousValue={originalData ? getDestinoLabel(originalData.idDestino) : undefined} />
                                <ConfirmRow label="Fecha Salida" value={formatFecha(form.fechaSalida)} previousValue={originalData?.fechaSalida ? formatFecha(originalData.fechaSalida) : undefined} />
                                <ConfirmRow label="Hora Salida"  value={form.horaSalida} previousValue={originalData?.horaSalida} />
                                <ConfirmRow label="Fecha Estimada de Llegada" value={formatFecha(form.fechaLlegadaEstimada)} previousValue={originalData?.fechaLlegadaEstimada ? formatFecha(originalData.fechaLlegadaEstimada) : undefined} />
                                <ConfirmRow label="Hora Llegada" value={form.horaLlegadaEstimada || 'N/A'} previousValue={originalData?.horaLlegadaEstimada || 'N/A'} />
                                <ConfirmRow label="Observaciones" value={form.observaciones} previousValue={originalData?.observaciones} />
                            </Paper>
                            {(() => {
                                const paresConfirmacion = form.pares.filter(p => p.idVehiculo && p.idConductor)
                                return (
                                    <Paper elevation={0} sx={cardSx}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                            <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>
                                                {paresConfirmacion.length > 1 ? 'Vehículos y Conductores' : 'Vehículo y Conductor'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                            Verifica los vehículos y conductores asignados a la ruta
                                        </Typography>
                                        {paresConfirmacion.map((par, i, arr) => {
                                            const orig = originalData?.pares?.[i]
                                            return (
                                                <Box key={i}>
                                                    <ConfirmRow label={arr.length > 1 ? `Vehículo ${i + 1}` : 'Vehículo'}
                                                        value={getVehiculoLabel(par.idVehiculo)}
                                                        previousValue={orig ? getVehiculoLabel(orig.idVehiculo) : undefined} />
                                                    <ConfirmRow label={arr.length > 1 ? `Conductor ${i + 1}` : 'Conductor'}
                                                        value={getConductorLabel(par.idConductor)}
                                                        previousValue={orig ? getConductorLabel(orig.idConductor) : undefined} />
                                                    {i < arr.length - 1 && <Divider sx={{ my: 1 }} />}
                                                </Box>
                                            )
                                        })}
                                    </Paper>
                                )
                            })()}
                        </Box>
                    </Box>
                )
            }
            default: return null
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Editar Ruta</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        {originalData?.origen ? `Modificando datos de ${originalData.origen}` : 'Modifica los campos que necesites.'}
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
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
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

export default ActualizarRutaProgramacion

