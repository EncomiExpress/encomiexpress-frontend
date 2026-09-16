import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Divider, Avatar, TextField, Autocomplete, MenuItem, Alert, IconButton, Tooltip, Button } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { formatFecha, formatHora12 } from '../../../../shared/utils/formatters.js'
import { sumarDias, hoyISO, MAX_DIAS_ANTICIPACION } from '../../../../shared/utils/horarioLaboral.js'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import ModalRutaDiagrama from '../../../../shared/components/ModalRutaDiagrama.jsx'
import { validarCampo, validarCampoPaquete } from '../../validations/validacion.js'
import { rutaLlegaAlDestino, paresQueLleganAlDestino, MENSAJE_RUTA_NO_LLEGA } from '../../validations/ventaValidation.js'
import { useAuth } from '../../../../shared/contexts/AuthContext.jsx'

/**
 * Paso 3 del wizard: elegir la salida programada, la fecha estimada de entrega y
 * asignar cada paquete a un vehículo del convoy. `getPesoOriginalPorPar`,
 * `valorServicioManualRef`, `setSinCambios` y `ventaOriginal` son opcionales — solo
 * los pasa el modo edición. Cuando no hay `getPesoOriginalPorPar`, no se excluye
 * ningún peso previo del cálculo de capacidad (no hay una venta anterior que restar).
 */
export default function PasoEnvio({
    theme, form, setForm, errores, setErrores, setApiError, setSinCambios,
    salidasProgramadas, rutaInput, setRutaInput, handleChange,
    calcularValorServicio, handlePaqueteChange, setErrorPaquete,
    ventaOriginal, valorServicioManualRef, getPesoOriginalPorPar,
    destinos,
}) {
    const { usuario, sedeActual } = useAuth()
    const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
    const [diagramaOpen, setDiagramaOpen] = useState(false)
    const rutaElegida = salidasProgramadas.find(r => r.idSalida === parseInt(form.idSalida))
    // El destino de la venta (elegido en el paso "Participantes", uno por venta —
    // no por paquete, ver LOGICA.md "Aprovechar el destino que ya existe por
    // venta") tiene que ser el destino final de la salida elegida o una de sus
    // paradas intermedias. Si no calza, se marca el campo Salida en rojo y se
    // BLOQUEA el paso (ver rutaLlegaAlDestino en ventaValidation.js).
    const idDestinoVenta = parseInt(form.idDestinoDestinatario) || null
    const destinoCalzaConRuta = rutaLlegaAlDestino(rutaElegida, idDestinoVenta)
    // Cada paquete se asigna a un PAR concreto (idSalidaVehiculoConductor) -- desde
    // que las paradas pasaron a ser del par y no de toda la salida, ya no basta con
    // que la SALIDA llegue al destino: ese par en particular tiene que llegar
    // (destino final compartido, o una parada propia suya). Antes se ofrecían todos
    // los pares del convoy sin filtrar; ahora solo los que de verdad sirven para
    // esta venta (ver paresQueLleganAlDestino en ventaValidation.js, que replica la
    // regla nueva del backend, encomiendaService.validarParLlegaADestino).
    const paresElegida = paresQueLleganAlDestino(rutaElegida, idDestinoVenta)
    const nombreDestinoVenta = destinos?.find(d => d.idDestino === idDestinoVenta)

    // Vehículos "activos" para esta venta -- por defecto uno solo (el primero del
    // convoy que llega al destino), asignado a TODOS los paquetes en silencio, sin
    // pedirle al usuario que elija el mismo vehículo paquete por paquete (antes se
    // repetía un selector idéntico por cada paquete aunque solo hubiera una opción
    // real). Solo si ese vehículo no tiene espacio para todo se ofrece "Agregar otro
    // vehículo" -- entre los que YA existen en el convoy de esta salida (Ventas no
    // crea pares nuevos, eso es de Programación de Salidas) -- y ahí sí aparece un
    // selector por paquete, pero acotado a los vehículos activados.
    const [vehiculosActivos, setVehiculosActivos] = useState([])

    // Se recalcula cada vez que cambia la salida elegida: en modo edición arranca
    // con los pares que la venta ya traía asignados (para no perder una repartición
    // ya hecha); si no hay ninguno (venta nueva, o se acaba de cambiar de salida y
    // el onChange de arriba ya limpió las asignaciones), arranca con un solo
    // vehículo -- el primero disponible.
    useEffect(() => {
        if (!rutaElegida) { setVehiculosActivos([]); return }
        const idsUsados = [...new Set(form.paquetes.map(p => p.idSalidaVehiculoConductor).filter(Boolean))]
        if (idsUsados.length > 0) setVehiculosActivos(idsUsados)
        else if (paresElegida[0]) setVehiculosActivos([paresElegida[0].idSalidaVehiculoConductor])
        else setVehiculosActivos([])
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe recalcular al cambiar de salida, no en cada tecla
    }, [rutaElegida?.idSalida])

    // Mientras haya un solo vehículo activo, todos los paquetes van ahí -- sin
    // importar si el usuario agregó/quitó paquetes en el paso anterior.
    useEffect(() => {
        if (vehiculosActivos.length !== 1) return
        const unico = vehiculosActivos[0]
        if (form.paquetes.every(p => p.idSalidaVehiculoConductor === unico)) return
        setForm(prev => ({ ...prev, paquetes: prev.paquetes.map(p => ({ ...p, idSalidaVehiculoConductor: unico })) }))
    }, [vehiculosActivos, form.paquetes, setForm])

    const paresActivos = paresElegida.filter(p => vehiculosActivos.includes(p.idSalidaVehiculoConductor))
    const siguienteVehiculoDisponible = paresElegida.find(p => !vehiculosActivos.includes(p.idSalidaVehiculoConductor))
    const handleAgregarVehiculo = () => {
        if (!siguienteVehiculoDisponible) return
        setVehiculosActivos(prev => [...prev, siguienteVehiculoDisponible.idSalidaVehiculoConductor])
    }
    // Solo tiene sentido ofrecer salidas que de verdad lleguen al municipio de destino
    // de la venta (destino final o una parada intermedia) — mismo criterio que ya
    // bloqueaba el paso si se elegía una que no calzaba (rutaLlegaAlDestino/
    // MENSAJE_RUTA_NO_LLEGA más abajo), ahora aplicado ANTES, para no ni mostrar las
    // que no sirven. Si la venta ya traía una salida elegida que dejó de calzar
    // entretanto (ej. le quitaron esa parada), sigue mostrándose igual como valor
    // seleccionado — el Autocomplete no exige que `value` esté dentro de `options` —
    // y el Alert de abajo sigue avisando del problema.
    // Un viaje de regreso (r.idSalidaIda) nunca lleva ventas nuevas — solo devuelve el
    // convoy a la base. Se excluye del selector; el backend también lo rechaza.
    // EXCEPTO para operador_sede (WS5, "Sedes remotas"): la sede recibe y
    // devuelve, no despacha hacia afuera — ahí es al revés, solo se ofrecen los
    // regresos que salen de SU sede (nunca una ida).
    const rutasOpciones = salidasProgramadas.filter(r => {
        if (r.habilitado === false || r.estado !== 'Programada' || !rutaLlegaAlDestino(r, idDestinoVenta)) return false
        return esOperadorSede
            ? r.idSalidaIda != null && r.origen === sedeActual?.municipio
            : r.idSalidaIda == null
    })

    const pesoOriginalPorPar = getPesoOriginalPorPar ? getPesoOriginalPorPar() : {}
    // Un Alert por cada vehículo del convoy que ya tiene paquetes asignados —
    // la capacidad ahora es por vehículo, no por ruta completa. En modo edición se
    // excluye el peso que esta misma venta ya tenía en ese vehículo antes de editar.
    const paresConUso = paresElegida
        .map(par => {
            const pesoNuevo = form.paquetes
                .filter(p => parseInt(p.idSalidaVehiculoConductor) === par.idSalidaVehiculoConductor)
                .reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
            const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
            const pesoUsadoOtras = capacidad != null ? Math.max(0, Number(par.pesoUsado || 0) - (pesoOriginalPorPar[par.idSalidaVehiculoConductor] || 0)) : null
            // "disponible" es el espacio que había ANTES de esta venta (contra el
            // que se compara si pesoNuevo se pasa o no). "disponibleFinal" es lo
            // que de verdad queda después de contar los paquetes que se están
            // registrando ahora mismo — como si la venta ya estuviera guardada —
            // para que el aviso muestre el sobrante real en vivo, no el de antes.
            const disponible = capacidad != null ? Math.max(0, capacidad - pesoUsadoOtras) : null
            const disponibleFinal = disponible != null ? Math.max(0, disponible - pesoNuevo) : null
            return { par, pesoNuevo, disponible, disponibleFinal, excede: disponible != null && pesoNuevo > disponible }
        })
        .filter(item => item.pesoNuevo > 0)
    // Cada alerta de capacidad se ancla al último paquete asignado a ese
    // vehículo, en vez de mostrarlas todas juntas al final — así queda
    // pegada al vehículo al que corresponde y no se desordena cuando hay
    // varios paquetes/vehículos.
    const alertaPorIndice = new Map()
    paresConUso.forEach(item => {
        let ultimoIndice = -1
        form.paquetes.forEach((p, i) => {
            if (parseInt(p.idSalidaVehiculoConductor) === item.par.idSalidaVehiculoConductor) ultimoIndice = i
        })
        if (ultimoIndice >= 0) alertaPorIndice.set(ultimoIndice, item)
    })

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                <Autocomplete
                    popupIcon={<KeyboardArrowDownOutlinedIcon />}
                    options={rutasOpciones}
                    getOptionLabel={(option) => {
                        // Placas de todos los vehículos del convoy en la etiqueta misma: si hay
                        // dos salidas con el mismo nombre (ej. mismo conductor, distinto vehículo),
                        // así se distinguen directo en la lista, sin tener que elegir una para verlo.
                        const placas = (option.paresVehiculoConductor || []).map(p => p.vehiculo?.placa).filter(Boolean).join(', ')
                        const destinoTxt = option.ruta?.destino?.municipio || 'Sin destino'
                        const fechaTxt = option.fechaSalida ? ` — ${formatFecha(option.fechaSalida)}` : ''
                        return `${option.origen || 'Sin nombre'} → ${destinoTxt}${placas ? ` (${placas})` : ''}${fechaTxt}`
                    }}
                    isOptionEqualToValue={(opt, val) => opt.idSalida === val.idSalida}
                    renderOption={(props, option) => {
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
                                    {option.origen || 'Sin nombre'} → {option.ruta?.destino?.municipio || 'Sin destino'}
                                </Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                    {option.fechaSalida ? formatFecha(option.fechaSalida) : 'Sin fecha'}
                                </Typography>
                            </Box>
                        )
                    }}
                    filterOptions={(opts, { inputValue }) => {
                        if (!inputValue.trim()) return [...opts].sort((a, b) => b.idSalida - a.idSalida).slice(0, 5)
                        // Se busca por palabra, no por el texto completo de una — así "medellin
                        // caucasia" encuentra la salida aunque "medellin" sea el origen y "caucasia"
                        // el destino (en cualquier orden), y sigue funcionando buscar por uno solo.
                        const palabras = normalizarTexto(inputValue).split(/\s+/).filter(Boolean)
                        return opts.filter(r => {
                            const combinado = normalizarTexto(`${r.origen || ''} ${r.ruta?.destino?.municipio || ''} ${r.ruta?.destino?.departamento || ''}`)
                            return palabras.every(p => combinado.includes(p))
                        })
                    }}
                    value={salidasProgramadas.find(r => r.idSalida === parseInt(form.idSalida)) || null}
                    inputValue={rutaInput}
                    onInputChange={(_, val, reason) => {
                        if (reason === 'input') {
                            setRutaInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, ''))
                        } else if (reason === 'reset') {
                            setRutaInput(val)
                        } else if (reason === 'clear') {
                            setRutaInput('')
                        }
                    }}
                    onChange={(_, newValue) => {
                        // Cambiar de salida invalida cualquier asignación de paquete→vehículo que
                        // ya se hubiera hecho (esos idSalidaVehiculoConductor pertenecen al convoy
                        // de la salida anterior, no a la nueva).
                        const fechaSalida = newValue?.fechaSalida || ''
                        const fechaLlegadaEstimada = newValue?.fechaLlegadaEstimada || ''
                        const minimaNueva = fechaLlegadaEstimada || (fechaSalida ? sumarDias(fechaSalida, 1) : '')
                        if (newValue) {
                            if (valorServicioManualRef) valorServicioManualRef.current = false
                            setForm(prev => {
                                const total = calcularValorServicio(newValue.ruta?.destino?.tarifaBase, prev.paquetes)
                                return {
                                    ...prev,
                                    idSalida: newValue.idSalida,
                                    destino: `${newValue.origen || 'Sin nombre'} → ${newValue.ruta?.destino?.municipio || 'Sin destino'}${newValue.fechaSalida ? ` — ${formatFecha(newValue.fechaSalida)}` : ''}`,
                                    fechaSalidaRuta: fechaSalida,
                                    fechaLlegadaEstimadaRuta: fechaLlegadaEstimada,
                                    // Se autocompleta con la fecha mínima (llegada de la salida) al
                                    // elegir o cambiar de salida — el campo sigue editable después por
                                    // si hace falta correrla más adelante (reparto con más días de
                                    // última milla).
                                    fechaEstimadaEntrega: minimaNueva || prev.fechaEstimadaEntrega,
                                    total,
                                    paquetes: prev.paquetes.map(p => ({ ...p, idSalidaVehiculoConductor: '' })),
                                }
                            })
                        } else {
                            // fechaEstimadaEntrega también se limpia acá (bug corregido, ver
                            // LOGICA.md) — antes solo se limpiaba errores.fechaEstimadaEntrega
                            // (línea de abajo), no el valor en sí, que se quedaba puesto sin
                            // ninguna salida que lo acote.
                            setForm(prev => ({
                                ...prev, idSalida: '', destino: '', fechaSalidaRuta: '', fechaLlegadaEstimadaRuta: '', fechaEstimadaEntrega: '',
                                paquetes: prev.paquetes.map(p => ({ ...p, idSalidaVehiculoConductor: '' })),
                            }))
                        }
                        setErrores(prev => ({
                            ...prev,
                            idSalida: newValue
                                ? (rutaLlegaAlDestino(newValue, parseInt(form.idDestinoDestinatario) || null) ? '' : MENSAJE_RUTA_NO_LLEGA)
                                : (prev.idSalida ? validarCampo('idSalida', { idSalida: '' }, ventaOriginal) : prev.idSalida),
                            fechaEstimadaEntrega: '',
                            // El cambio de salida invalida el vehículo asignado, pero no otros
                            // errores del paquete (peso, dimensiones, etc.) que no dependen de la salida.
                            paquetes: prev.paquetes?.map(pe => {
                                const { idSalidaVehiculoConductor: _omit, ...resto } = pe || {}
                                return resto
                            }),
                        }))
                        setApiError(null)
                        setSinCambios?.(false)
                    }}
                    onBlur={() => setErrores(prev => ({
                        ...prev,
                        idSalida: validarCampo('idSalida', form, ventaOriginal)
                            || (rutaElegida && !destinoCalzaConRuta ? MENSAJE_RUTA_NO_LLEGA : ''),
                    }))}
                    noOptionsText={rutasOpciones.length === 0 && idDestinoVenta
                        ? `No hay salidas programadas hacia ${nombreDestinoVenta ? `${nombreDestinoVenta.municipio}, ${nombreDestinoVenta.departamento}` : 'ese destino'}`
                        : 'No se encontraron salidas'}
                    renderInput={(params) => (
                        <TextField {...params} label="Salida *"
                            error={!!errores.idSalida} helperText={errores.idSalida || 'Busca por origen o destino'}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { ...params.inputProps, maxLength: 100 },
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {rutaElegida && (
                                                <>
                                                    <Tooltip title="Ver recorrido de la salida">
                                                        <IconButton size="small"
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={() => setDiagramaOpen(true)}>
                                                            <RouteOutlinedIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Divider orientation="vertical" flexItem sx={{ my: 0.75, mx: 0.5 }} />
                                                </>
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                },
                            }}
                            sx={formFieldStyles} />
                    )}
                />
                <TextField fullWidth label="Fecha estimada de entrega" name="fechaEstimadaEntrega"
                    type="date" value={form.fechaEstimadaEntrega} onChange={handleChange}
                    onBlur={() => setErrores(prev => ({ ...prev, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', form, ventaOriginal) }))} required
                    // Sin salida elegida no hay contra qué acotar el mínimo/máximo (bug
                    // corregido, ver LOGICA.md) — el calendario nativo dejaba escoger
                    // cualquier fecha libremente mientras "Salida" seguía vacía/inválida.
                    disabled={!form.idSalida}
                    error={!!errores.fechaEstimadaEntrega}
                    helperText={errores.fechaEstimadaEntrega || (form.fechaLlegadaEstimadaRuta
                        ? `Desde el ${formatFecha(form.fechaLlegadaEstimadaRuta)} (llegada de la salida) en adelante`
                        : form.fechaSalidaRuta
                            ? `Desde el ${formatFecha(sumarDias(form.fechaSalidaRuta, 1))}`
                            : 'Selecciona primero una salida')}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: {
                        min: form.fechaLlegadaEstimadaRuta || (form.fechaSalidaRuta ? sumarDias(form.fechaSalidaRuta, 1) : undefined),
                        max: sumarDias(hoyISO(), MAX_DIAS_ANTICIPACION),
                    } }}
                    sx={formFieldStyles} />
            </Box>
            {rutaElegida && (
                <Paper elevation={0} sx={{
                    p: 1.5, borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                        <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Destino:</Box>
                            {rutaElegida.ruta?.destino ? `${rutaElegida.ruta.destino.municipio}, ${rutaElegida.ruta.destino.departamento}` : '—'}
                        </Typography>
                        <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Salida:</Box>
                            {rutaElegida.fechaSalida ? `${formatFecha(rutaElegida.fechaSalida)}${rutaElegida.horaSalida ? ' · ' + formatHora12(rutaElegida.horaSalida) : ''}` : '—'}
                        </Typography>
                        <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Llegada:</Box>
                            {rutaElegida.fechaLlegadaEstimada ? `${formatFecha(rutaElegida.fechaLlegadaEstimada)}${rutaElegida.horaLlegadaEstimada ? ' · ' + formatHora12(rutaElegida.horaLlegadaEstimada) : ''}` : '—'}
                        </Typography>
                    </Box>
                </Paper>
            )}
            {rutaElegida && !destinoCalzaConRuta && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Esta venta va para <strong>{nombreDestinoVenta ? `${nombreDestinoVenta.municipio}, ${nombreDestinoVenta.departamento}` : 'un municipio'}</strong>, pero
                    esa salida no pasa por ahí (ni es su destino final, ni una de sus paradas). Elige otra salida, o agrégale esa parada desde Programación de Salidas.
                </Alert>
            )}
            {rutaElegida && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                        Asignar paquetes a vehículo
                    </Typography>

                    <>
                        {/* Siempre se ve y se puede elegir el vehículo/conductor de cada
                            paquete -- aunque haya un solo par en el convoy, el selector
                            queda visible (ya viene preseleccionado, pero el usuario lo
                            confirma/cambia explícitamente en vez de que quede oculto). */}
                        {form.paquetes.map((paquete, index) => {
                            const alerta = alertaPorIndice.get(index)
                            const mensajeCapacidad = alerta?.excede
                                ? `${alerta.par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((alerta.pesoNuevo - alerta.disponible).toFixed(2))} kg. Reasígnalo a otro vehículo.`
                                : null
                            const errorCampo = errores.paquetes?.[index]?.idSalidaVehiculoConductor || mensajeCapacidad
                            return (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <FormSelect
                                        label={form.paquetes.length > 1 ? `Paquete ${index + 1} — Vehículo` : 'Vehículo'}
                                        name="idSalidaVehiculoConductor"
                                        value={paquete.idSalidaVehiculoConductor}
                                        onChange={(e) => handlePaqueteChange(index, 'idSalidaVehiculoConductor', e.target.value)}
                                        onBlur={() => setErrorPaquete(index, 'idSalidaVehiculoConductor', validarCampoPaquete('idSalidaVehiculoConductor', paquete))}
                                        required
                                        error={!!errorCampo}
                                        helperText={errorCampo || `¿A cuál vehículo va este paquete?${paquete.peso ? ` (${paquete.peso} kg)` : ''}`}
                                        renderValue={(val) => {
                                            const par = paresActivos.find(p => p.idSalidaVehiculoConductor === val)
                                            if (!par) return ''
                                            const marcaModelo = [par.vehiculo?.marca, par.vehiculo?.modelo].filter(Boolean).join(' ')
                                            const nombreConductor = par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : 'Sin conductor'
                                            return `${par.vehiculo?.placa || 'Sin placa'}${marcaModelo ? ' — ' + marcaModelo : ''} — ${nombreConductor}`
                                        }}>
                                        {paresActivos.map((par) => (
                                            <MenuItem key={par.idSalidaVehiculoConductor} value={par.idSalidaVehiculoConductor} sx={{ py: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                    <PlacaDisplay placa={par.vehiculo?.placa} theme={theme} />
                                                    <Typography variant="body2" color={theme.palette.text.secondary} noWrap sx={{ minWidth: 0 }}>
                                                        {[par.vehiculo?.marca, par.vehiculo?.modelo].filter(Boolean).join(' ')}
                                                    </Typography>
                                                    <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                                                    <Avatar sx={{
                                                        width: 28, height: 28, flexShrink: 0,
                                                        backgroundColor: theme.palette.avatarDefault.bg,
                                                        color: theme.palette.avatarDefault.color,
                                                        fontSize: '0.68rem', fontWeight: 700,
                                                    }}>
                                                        {(par.conductor?.usuario?.nombre?.[0] || '')}{(par.conductor?.usuario?.apellido?.[0] || '')}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ minWidth: 0 }}>
                                                        {par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : 'Sin conductor'}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </FormSelect>
                                    {alerta && !alerta.excede && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                                            <strong>{alerta.par.vehiculo?.placa || 'Vehículo'}:</strong> quedan{' '}
                                            <strong>{alerta.disponibleFinal != null ? Number(alerta.disponibleFinal.toFixed(2)) : '∞'} kg</strong> disponibles.
                                        </Alert>
                                    )}
                                </Box>
                            )
                        })}
                        {siguienteVehiculoDisponible && (
                            <Button size="small" startIcon={<AddOutlinedIcon />} onClick={handleAgregarVehiculo}
                                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}>
                                Agregar otro vehículo
                            </Button>
                        )}
                        </>
                </Box>
            )}
            <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, observaciones: validarCampo('observaciones', form, ventaOriginal) }))}
                multiline rows={2}
                helperText={errores.observaciones || `Opcional · ${(form.observaciones || '').length}/500`}
                error={errores.observaciones}
                inputProps={{ maxLength: 500 }} />
            <ModalRutaDiagrama
                open={diagramaOpen}
                onClose={() => setDiagramaOpen(false)}
                origen={rutaElegida?.origen}
                // El diagrama solo puede dibujar un camino a la vez -- se usa el
                // recorrido del primer par que de verdad llega al destino de esta venta
                // (mismo criterio que paresElegida arriba), no el del convoy completo.
                paradas={(paresElegida[0]?.paradas || []).filter(p => p.destino).map(p => p.destino.municipio)}
                destino={rutaElegida?.ruta?.destino?.municipio}
                subtitulo={rutaElegida ? `${rutaElegida.origen || ''} → ${rutaElegida.ruta?.destino?.municipio || ''}` : ''}
            />
        </Box>
    )
}
