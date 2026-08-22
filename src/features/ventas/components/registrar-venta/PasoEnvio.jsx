import { Box, Typography, Paper, Divider, Avatar, TextField, Autocomplete, MenuItem, Alert } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { formatFecha } from '../../../../shared/utils/formatters.js'
import { sumarDias } from '../../../../shared/utils/horarioLaboral.js'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { validarCampo, validarCampoPaquete } from './validacion.js'

/** Paso 3 del wizard: elegir la ruta, la fecha de entrega y asignar cada paquete a un vehículo del convoy. */
export default function PasoEnvio({
    theme, form, setForm, errores, setErrores, setApiError,
    rutasProgramadas, rutaInput, setRutaInput, handleChange,
    calcularValorServicio, handlePaqueteChange, setErrorPaquete,
}) {
    const rutaElegida = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
    const paresElegida = rutaElegida?.paresVehiculoConductor || []
    // Un Alert por cada vehículo del convoy que ya tiene paquetes asignados —
    // la capacidad ahora es por vehículo, no por ruta completa.
    const paresConUso = paresElegida
        .map(par => {
            const pesoNuevo = form.paquetes
                .filter(p => parseInt(p.idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                .reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
            const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
            // "disponible" es el espacio que había ANTES de esta venta (contra el
            // que se compara si pesoNuevo se pasa o no). "disponibleFinal" es lo
            // que de verdad queda después de contar los paquetes que se están
            // registrando ahora mismo — como si la venta ya estuviera guardada —
            // para que el aviso muestre el sobrante real en vivo, no el de antes.
            const disponible = capacidad != null ? Math.max(0, capacidad - Number(par.pesoUsado || 0)) : null
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
                            setForm(prev => {
                                const pesoTotal = prev.paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                                const valorServicio = calcularValorServicio(newValue.destino?.tarifaBase, pesoTotal)
                                const impuestos = Math.round(valorServicio * 0.10)
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
                                    impuestos,
                                    total: valorServicio + impuestos,
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
                            idRuta: newValue ? '' : (prev.idRuta ? validarCampo('idRuta', { idRuta: '' }) : prev.idRuta),
                            fechaEstimadaEntrega: fechaResetea && prev.fechaEstimadaEntrega
                                ? validarCampo('fechaEstimadaEntrega', { fechaEstimadaEntrega: '' })
                                : (newValue ? prev.fechaEstimadaEntrega : ''),
                            // El cambio de ruta invalida el vehículo asignado, pero no otros
                            // errores del paquete (peso, dimensiones, etc.) que no dependen de la ruta.
                            paquetes: prev.paquetes?.map(pe => {
                                const { idRutaVehiculoConductor: _omit, ...resto } = pe || {}
                                return resto
                            }),
                        }))
                        setApiError(null)
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form) }))}
                    noOptionsText="No se encontraron rutas"
                    renderInput={(params) => (
                        <TextField {...params} label="Ruta *"
                            error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por origen o destino'}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                            sx={formFieldStyles} />
                    )}
                />
                <TextField fullWidth label="Fecha estimada de entrega" name="fechaEstimadaEntrega"
                    type="date" value={form.fechaEstimadaEntrega} onChange={handleChange}
                    onBlur={() => setErrores(prev => ({ ...prev, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', form) }))} required
                    error={!!errores.fechaEstimadaEntrega}
                    helperText={errores.fechaEstimadaEntrega || (form.fechaSalidaRuta
                        ? `Desde el ${formatFecha(sumarDias(form.fechaSalidaRuta, 1))}${form.fechaLlegadaEstimadaRuta ? ` hasta el ${formatFecha(sumarDias(form.fechaLlegadaEstimadaRuta, -1))}` : ''}`
                        : 'Selecciona primero una ruta')}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: {
                        min: form.fechaSalidaRuta ? sumarDias(form.fechaSalidaRuta, 1) : undefined,
                        max: form.fechaLlegadaEstimadaRuta ? sumarDias(form.fechaLlegadaEstimadaRuta, -1) : undefined,
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
                onBlur={() => setErrores(prev => ({ ...prev, observaciones: validarCampo('observaciones', form) }))}
                multiline rows={2}
                helperText={errores.observaciones || `Opcional · ${(form.observaciones || '').length}/500`}
                error={errores.observaciones}
                inputProps={{ maxLength: 500 }} />
        </Box>
    )
}
