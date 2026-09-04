import { useEffect } from 'react'
import { Box, Typography, Paper, Divider, Avatar, TextField, Autocomplete, MenuItem, Alert } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { formatFecha } from '../../../../shared/utils/formatters.js'
import { sumarDias } from '../../../../shared/utils/horarioLaboral.js'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { validarCampo, validarCampoPaquete } from '../../validations/validacion.js'

/**
 * Paso 3 del wizard: elegir la ruta, la fecha estimada de entrega EN SEDE (cuándo
 * llega el paquete al punto/sede de su municipio — no la entrega final puerta a
 * puerta, que pasa después: en sede se hace inventario y se asigna un repartidor
 * local, ver LOGICA.md "Paquetes — entrega en sede y reasignación local") y asignar cada paquete a un
 * vehículo del convoy. `getPesoOriginalPorPar`, `valorServicioManualRef`,
 * `setSinCambios` y `ventaOriginal` son opcionales — solo los pasa el modo edición.
 * Cuando no hay `getPesoOriginalPorPar`, no se excluye ningún peso previo del cálculo
 * de capacidad (no hay una venta anterior que restar).
 */
export default function PasoEnvio({
    theme, form, setForm, errores, setErrores, setApiError, setSinCambios,
    rutasProgramadas, rutaInput, setRutaInput, handleChange,
    calcularValorServicio, handlePaqueteChange, setErrorPaquete,
    ventaOriginal, valorServicioManualRef, getPesoOriginalPorPar,
    destinos,
}) {
    const rutaElegida = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
    const paresElegida = rutaElegida?.paresVehiculoConductor || []
    // El destino de la venta (elegido en el paso "Participantes", uno por venta —
    // no por paquete, ver LOGICA.md "Aprovechar el destino que ya existe por
    // venta") debería caer en algún punto del corredor de la ruta elegida: su
    // destino final, o alguna de sus paradas intermedias (Fase 1). Si no calza con
    // ninguno, es un aviso — no se bloquea, porque la mayoría de rutas todavía no
    // tienen paradas cargadas y el destino final por sí solo sigue siendo válido.
    const idDestinoVenta = parseInt(form.idDestinoDestinatario) || null
    const paradasRuta = rutaElegida?.paradas || []
    const destinoCalzaConRuta = !rutaElegida || !idDestinoVenta
        || idDestinoVenta === rutaElegida.idDestino
        || paradasRuta.some(p => p.idDestino === idDestinoVenta)
    const nombreDestinoVenta = destinos?.find(d => d.idDestino === idDestinoVenta)

    // La ventana de fechaEstimadaEntrega (llegada al punto/sede, no la entrega
    // final al destinatario) depende de DÓNDE dentro del corredor está esa sede,
    // no siempre del destino final de toda la ruta (ver LOGICA.md, "Ventas —
    // fecha estimada de entrega en sede por parada"):
    //   - Destino final (caso de siempre): ventana entre salida+1 y llegada-1.
    //   - Parada intermedia CON fecha estimada de paso cargada (Rutas, Fase 1):
    //     un solo día posible, el de esa parada — se autocompleta.
    //   - Parada intermedia SIN esa fecha cargada todavía: no se puede prometer
    //     ninguna fecha — el campo queda deshabilitado en vez de mostrar (o
    //     dejar guardar) una que podría no corresponder.
    const esDestinoFinal = !rutaElegida || !idDestinoVenta || idDestinoVenta === rutaElegida.idDestino
    const paradaDestinatario = !esDestinoFinal ? paradasRuta.find(p => p.idDestino === idDestinoVenta) : null
    const entregaFechaFija = paradaDestinatario?.fechaLlegadaEstimada || null
    const entregaSinFechaDisponible = !!paradaDestinatario && !entregaFechaFija
    const entregaMin = entregaFechaFija || (form.fechaSalidaRuta ? sumarDias(form.fechaSalidaRuta, 1) : undefined)
    const entregaMax = entregaFechaFija || (form.fechaLlegadaEstimadaRuta ? sumarDias(form.fechaLlegadaEstimadaRuta, -1) : undefined)
    const entregaHelper = !rutaElegida
        ? 'Selecciona primero una ruta'
        : entregaSinFechaDisponible
            ? 'Esta venta va a una parada intermedia sin fecha estimada de paso cargada todavía — pídele a quien gestiona Rutas que la agregue antes de prometer una fecha'
            : entregaFechaFija
                ? `Esta venta va a una parada intermedia — la entrega en sede queda fijada al ${formatFecha(entregaFechaFija)}, el día en que la ruta pasa por ahí`
                : (form.fechaSalidaRuta ? `Desde el ${formatFecha(entregaMin)}${entregaMax ? ` hasta el ${formatFecha(entregaMax)}` : ''}` : 'Selecciona primero una ruta')

    // Autocompleta/limpia fechaEstimadaEntrega cuando cambia a cuál parada le
    // corresponde el destinatario (por cambio de ruta o de destino) — mismo
    // patrón de auto-cálculo que ya usa este wizard para valorServicio.
    useEffect(() => {
        if (form.entregaSinFecha !== entregaSinFechaDisponible) {
            setForm(prev => ({ ...prev, entregaSinFecha: entregaSinFechaDisponible }))
        }
        if (entregaFechaFija && form.fechaEstimadaEntrega !== entregaFechaFija) {
            setForm(prev => ({ ...prev, fechaEstimadaEntrega: entregaFechaFija }))
            setErrores(prev => ({ ...prev, fechaEstimadaEntrega: '' }))
        } else if (entregaSinFechaDisponible && form.fechaEstimadaEntrega) {
            setForm(prev => ({ ...prev, fechaEstimadaEntrega: '' }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entregaFechaFija, entregaSinFechaDisponible])
    const pesoOriginalPorPar = getPesoOriginalPorPar ? getPesoOriginalPorPar() : {}
    // Un Alert por cada vehículo del convoy que ya tiene paquetes asignados —
    // la capacidad ahora es por vehículo, no por ruta completa. En modo edición se
    // excluye el peso que esta misma venta ya tenía en ese vehículo antes de editar.
    const paresConUso = paresElegida
        .map(par => {
            const pesoNuevo = form.paquetes
                .filter(p => parseInt(p.idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                .reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
            const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
            const pesoUsadoOtras = capacidad != null ? Math.max(0, Number(par.pesoUsado || 0) - (pesoOriginalPorPar[par.idRutaVehiculoConductor] || 0)) : null
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
            if (parseInt(p.idRutaVehiculoConductor) === item.par.idRutaVehiculoConductor) ultimoIndice = i
        })
        if (ultimoIndice >= 0) alertaPorIndice.set(ultimoIndice, item)
    })

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                <Autocomplete
                    popupIcon={<KeyboardArrowDownOutlinedIcon />}
                    options={rutasProgramadas.filter(r => r.habilitado !== false && r.estado === 'Programada')}
                    getOptionLabel={(option) => {
                        // Placas de todos los vehículos del convoy en la etiqueta misma: si hay
                        // dos rutas con el mismo nombre (ej. mismo conductor, distinto vehículo),
                        // así se distinguen directo en la lista, sin tener que elegir una para verlo.
                        const placas = (option.paresVehiculoConductor || []).map(p => p.vehiculo?.placa).filter(Boolean).join(', ')
                        const destinoTxt = option.destino?.ciudad || 'Sin destino'
                        return `${option.origen || 'Sin nombre'} → ${destinoTxt}${placas ? ` (${placas})` : ''} — $${Number(option.destino?.tarifaBase || 0).toLocaleString()}`
                    }}
                    isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
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
                                    {option.origen || 'Sin nombre'} → {option.destino?.ciudad || 'Sin destino'}
                                </Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                    ${Number(option.destino?.tarifaBase || 0).toLocaleString('es-CO')}
                                </Typography>
                            </Box>
                        )
                    }}
                    filterOptions={(opts, { inputValue }) => {
                        if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                        const q = normalizarTexto(inputValue)
                        return opts.filter(r =>
                            normalizarTexto(r.origen || '').includes(q) ||
                            normalizarTexto(r.destino?.ciudad || '').includes(q) ||
                            normalizarTexto(r.destino?.departamento || '').includes(q)
                        )
                    }}
                    value={rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta)) || null}
                    inputValue={rutaInput}
                    onInputChange={(_, val, reason) => {
                        if (reason === 'input') {
                            setRutaInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, ''))
                        } else if (reason === 'reset') {
                            setRutaInput(val)
                        } else if (reason === 'clear') {
                            setRutaInput('')
                        }
                    }}
                    onChange={(_, newValue) => {
                        // Cambiar de ruta invalida cualquier asignación de paquete→vehículo que
                        // ya se hubiera hecho (esos idRutaVehiculoConductor pertenecen al convoy
                        // de la ruta anterior, no a la nueva).
                        const fechaSalida = newValue?.fechaSalida || ''
                        const fechaLlegadaEstimada = newValue?.fechaLlegadaEstimada || ''
                        const minimaNueva = fechaSalida ? sumarDias(fechaSalida, 1) : ''
                        const maximaNueva = fechaLlegadaEstimada ? sumarDias(fechaLlegadaEstimada, -1) : ''
                        const fechaResetea = !!(newValue && form.fechaEstimadaEntrega && (
                            (minimaNueva && form.fechaEstimadaEntrega < minimaNueva) ||
                            (maximaNueva && form.fechaEstimadaEntrega > maximaNueva)
                        ))
                        if (newValue) {
                            if (valorServicioManualRef) valorServicioManualRef.current = false
                            setForm(prev => {
                                const valorServicio = calcularValorServicio(newValue.destino?.tarifaBase, prev.paquetes)
                                return {
                                    ...prev,
                                    idRuta: newValue.idRuta,
                                    destino: `${newValue.origen || 'Sin nombre'} → ${newValue.destino?.ciudad || 'Sin destino'} — $${Number(newValue.destino?.tarifaBase || 0).toLocaleString('es-CO')}`,
                                    fechaSalidaRuta: fechaSalida,
                                    fechaLlegadaEstimadaRuta: fechaLlegadaEstimada,
                                    fechaEstimadaEntrega: prev.fechaEstimadaEntrega && (
                                        (minimaNueva && prev.fechaEstimadaEntrega < minimaNueva) ||
                                        (maximaNueva && prev.fechaEstimadaEntrega > maximaNueva)
                                    ) ? '' : prev.fechaEstimadaEntrega,
                                    valorServicio,
                                    total: valorServicio,
                                    paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: '' })),
                                }
                            })
                        } else {
                            setForm(prev => ({
                                ...prev, idRuta: '', destino: '', fechaSalidaRuta: '', fechaLlegadaEstimadaRuta: '',
                                paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: '' })),
                            }))
                        }
                        setErrores(prev => ({
                            ...prev,
                            idRuta: newValue ? '' : (prev.idRuta ? validarCampo('idRuta', { idRuta: '' }, ventaOriginal) : prev.idRuta),
                            fechaEstimadaEntrega: fechaResetea && prev.fechaEstimadaEntrega
                                ? validarCampo('fechaEstimadaEntrega', { fechaEstimadaEntrega: '' }, ventaOriginal)
                                : (newValue ? prev.fechaEstimadaEntrega : ''),
                            // El cambio de ruta invalida el vehículo asignado, pero no otros
                            // errores del paquete (peso, dimensiones, etc.) que no dependen de la ruta.
                            paquetes: prev.paquetes?.map(pe => {
                                const { idRutaVehiculoConductor: _omit, ...resto } = pe || {}
                                return resto
                            }),
                        }))
                        setApiError(null)
                        setSinCambios?.(false)
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form, ventaOriginal) }))}
                    noOptionsText="No se encontraron rutas"
                    renderInput={(params) => (
                        <TextField {...params} label="Ruta *"
                            error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por origen o destino'}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                            sx={formFieldStyles} />
                    )}
                />
                <TextField fullWidth label="Fecha estimada de entrega en sede" name="fechaEstimadaEntrega"
                    type="date" value={form.fechaEstimadaEntrega} onChange={handleChange}
                    onBlur={() => setErrores(prev => ({ ...prev, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', form, ventaOriginal) }))} required
                    error={!!errores.fechaEstimadaEntrega}
                    disabled={entregaSinFechaDisponible}
                    helperText={errores.fechaEstimadaEntrega || entregaHelper}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: entregaMin, max: entregaMax } }}
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
                            {rutaElegida.destino ? `${rutaElegida.destino.ciudad}, ${rutaElegida.destino.departamento}` : '—'}
                        </Typography>
                        <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Salida:</Box>
                            {rutaElegida.fechaSalida ? `${formatFecha(rutaElegida.fechaSalida)}${rutaElegida.horaSalida ? ' · ' + rutaElegida.horaSalida.slice(0, 5) : ''}` : '—'}
                        </Typography>
                        <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Llegada:</Box>
                            {rutaElegida.fechaLlegadaEstimada ? `${formatFecha(rutaElegida.fechaLlegadaEstimada)}${rutaElegida.horaLlegadaEstimada ? ' · ' + rutaElegida.horaLlegadaEstimada.slice(0, 5) : ''}` : '—'}
                        </Typography>
                    </Box>
                </Paper>
            )}
            {rutaElegida && !destinoCalzaConRuta && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Esta venta va para <strong>{nombreDestinoVenta ? `${nombreDestinoVenta.ciudad}, ${nombreDestinoVenta.departamento}` : 'un municipio'}</strong>, pero
                    esa ruta no pasa por ahí (ni es su destino final, ni una de sus paradas). Revisa que sea la ruta correcta, o agrégale esa parada desde Rutas.
                </Alert>
            )}
            {rutaElegida && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                        Asignar paquetes a vehículo
                    </Typography>
                    {form.paquetes.map((paquete, index) => {
                        const alerta = alertaPorIndice.get(index)
                        const mensajeCapacidad = alerta?.excede
                            ? `${alerta.par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((alerta.pesoNuevo - alerta.disponible).toFixed(2))} kg. Reasígnalo a otro vehículo.`
                            : null
                        const errorCampo = errores.paquetes?.[index]?.idRutaVehiculoConductor || mensajeCapacidad
                        return (
                            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormSelect
                                    label={form.paquetes.length > 1 ? `Paquete ${index + 1} — Vehículo` : 'Vehículo'}
                                    name="idRutaVehiculoConductor"
                                    value={paquete.idRutaVehiculoConductor}
                                    onChange={(e) => handlePaqueteChange(index, 'idRutaVehiculoConductor', e.target.value)}
                                    onBlur={() => setErrorPaquete(index, 'idRutaVehiculoConductor', validarCampoPaquete('idRutaVehiculoConductor', paquete))}
                                    required
                                    error={!!errorCampo}
                                    helperText={errorCampo || `¿A cuál vehículo va este paquete?${paquete.peso ? ` (${paquete.peso} kg)` : ''}`}
                                    renderValue={(val) => {
                                        const par = paresElegida.find(p => p.idRutaVehiculoConductor === val)
                                        if (!par) return ''
                                        const marcaModelo = [par.vehiculo?.marca, par.vehiculo?.modelo].filter(Boolean).join(' ')
                                        const nombreConductor = par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : 'Sin conductor'
                                        return `${par.vehiculo?.placa || 'Sin placa'}${marcaModelo ? ' — ' + marcaModelo : ''} — ${nombreConductor}`
                                    }}>
                                    {paresElegida.map((par) => (
                                        <MenuItem key={par.idRutaVehiculoConductor} value={par.idRutaVehiculoConductor} sx={{ py: 1 }}>
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
                </Box>
            )}
            <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, observaciones: validarCampo('observaciones', form, ventaOriginal) }))}
                multiline rows={2}
                helperText={errores.observaciones || `Opcional · ${(form.observaciones || '').length}/500`}
                error={errores.observaciones}
                inputProps={{ maxLength: 500 }} />
        </Box>
    )
}
