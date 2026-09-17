import { useMemo } from 'react'
import { Box, Typography, TextField, Alert, Autocomplete, Avatar, Divider } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { formatearMoneda, formatFecha, formatHora12 } from '../../../../shared/utils/formatters.js'
import { sumarDias, hoyISO, MAX_DIAS_ANTICIPACION } from '../../../../shared/utils/horarioLaboral.js'
import { validarCampo } from '../../validations/anticipoValidation.js'

// Identifica el corredor (Medellín -> destino) de una salida -- sin `idRuta` a
// mano en esta lista aplanada (ver AnticipoExcedenteContext.jsx), se agrupa por
// destino, que en la práctica es 1:1 con la plantilla de Ruta (no puede haber
// dos rutas activas al mismo destino, ver rutaService.js).
const idCorredorDe = (r) => r?.destino?.idDestino ?? r?.destino?.municipio ?? null

const PasoRutaVehiculo = ({
    theme, form, errores, setErrores, setForm, handleChange,
    rutas, rutaSeleccionada, pares, parSeleccionado,
    idCorredorSel, setIdCorredorSel, corredorInput, setCorredorInput, rutaInput, setRutaInput, parInput, setParInput,
    afterChange = () => { },
    rutaDisabled = false, parDisabled, valorDisabled = false, fechaDisabled = false,
    rutaHelperTextOk, rutaHelperTextDisabled, parHelperTextDisabled, valorHelperTextDisabled, fechaHelperTextDisabled,
    mostrarAdvertencia,
}) => {
    // Un corredor por destino distinto entre las salidas disponibles -- cada uno
    // representado por la primera salida que se encuentre (solo se usa su
    // `nombre`/`destino`, iguales entre todas las salidas de un mismo corredor).
    const corredores = useMemo(() => {
        const porDestino = new Map()
        for (const r of rutas) {
            const id = idCorredorDe(r)
            if (id == null || porDestino.has(id)) continue
            porDestino.set(id, { idCorredor: id, nombre: r.nombre, destino: r.destino })
        }
        return [...porDestino.values()]
    }, [rutas])

    // `idCorredorSel` es estado propio del padre (no se puede derivar de
    // `rutaSeleccionada`: justo cuando se elige un corredor todavía no hay
    // ninguna salida elegida). Si el corredor elegido no aparece entre las
    // salidas disponibles (caso "ruta sintética" de un anticipo cuya salida ya
    // avanzó de estado, ver ActualizarAnticipoExcedente.jsx), se arma uno mínimo
    // con lo que ya trae `rutaSeleccionada`, para que el Autocomplete
    // (deshabilitado en ese caso) igual muestre un valor en vez de quedar huérfano.
    const corredorSeleccionado = idCorredorSel == null ? null
        : corredores.find(c => c.idCorredor === idCorredorSel)
            || (rutaSeleccionada && idCorredorDe(rutaSeleccionada) === idCorredorSel
                ? { idCorredor: idCorredorSel, nombre: rutaSeleccionada.nombre, destino: rutaSeleccionada.destino }
                : null)

    // Salidas del corredor elegido -- lo que de verdad ofrece el segundo select.
    const salidasDelCorredor = idCorredorSel == null ? [] : rutas.filter(r => idCorredorDe(r) === idCorredorSel)

    const getEtiquetaCorredor = (c) => c?.destino ? `${c.nombre} → ${c.destino.municipio}` : (c?.nombre || '—')
    // Sin destino acá (ya se eligió en el corredor) -- solo fecha y hora, que es lo
    // único que puede repetirse/distinguir entre salidas del mismo corredor.
    const getEtiquetaSalida = (r) => {
        if (!r) return '—'
        const fechaTxt = r.fechaSalida ? formatFecha(r.fechaSalida) : 'Sin fecha'
        const horaTxt = r.horaSalida ? ` · ${formatHora12(r.horaSalida)}` : ''
        return `${fechaTxt}${horaTxt}`
    }

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <Autocomplete
            options={corredores}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            disabled={rutaDisabled}
            getOptionLabel={getEtiquetaCorredor}
            isOptionEqualToValue={(opt, val) => opt.idCorredor === val.idCorredor}
            value={corredorSeleccionado}
            inputValue={corredorInput}
            onInputChange={(_, newVal, reason) => {
                if (reason === 'input') setCorredorInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, ''))
                else setCorredorInput(newVal)
            }}
            onChange={(_, val) => {
                setIdCorredorSel(val ? val.idCorredor : null)
                // Cambiar de corredor invalida la salida y el par ya elegidos --
                // pertenecían al corredor anterior.
                setForm(prev => ({ ...prev, idSalida: '', idSalidaVehiculoConductor: '' }))
                setErrores(prev => ({
                    ...prev,
                    idSalida: prev.idSalida ? validarCampo('idSalida', { idSalida: '' }) : prev.idSalida,
                    idSalidaVehiculoConductor: '',
                }))
                setRutaInput('')
                setParInput('')
                afterChange()
            }}
            renderOption={(props, c) => {
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
                            {c.nombre} → {c.destino?.municipio || 'Sin destino'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                            {c.destino?.departamento || ''}
                        </Typography>
                    </Box>
                )
            }}
            filterOptions={(opts, { inputValue }) => {
                if (!inputValue.trim()) return [...opts].sort((a, b) => (a.destino?.municipio || '').localeCompare(b.destino?.municipio || ''))
                const palabras = normalizarTexto(inputValue).split(/\s+/).filter(Boolean)
                return opts.filter(c => {
                    const combinado = normalizarTexto(`${c.nombre} ${c.destino?.municipio || ''} ${c.destino?.departamento || ''}`)
                    return palabras.every(p => combinado.includes(p))
                })
            }}
            noOptionsText="No se encontraron rutas"
            renderInput={(params) => (
                <TextField {...params} label="Ruta *"
                    error={!!errores.idSalida && !corredorSeleccionado}
                    helperText={rutaDisabled ? rutaHelperTextDisabled : (rutaHelperTextOk || 'Busca por destino')}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                    sx={formFieldStyles} />
            )}
        />

        <Autocomplete
            options={salidasDelCorredor}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            disabled={rutaDisabled || !corredorSeleccionado}
            getOptionLabel={getEtiquetaSalida}
            isOptionEqualToValue={(opt, val) => opt.idSalida === val.idSalida}
            value={rutaSeleccionada || null}
            inputValue={rutaInput}
            onInputChange={(_, newVal, reason) => {
                if (reason === 'input') setRutaInput(newVal.replace(/[^a-zA-Z0-9\s]/g, ''))
                else setRutaInput(newVal)
            }}
            onChange={(_, val) => {
                setForm(prev => ({ ...prev, idSalida: val ? val.idSalida : '', idSalidaVehiculoConductor: '' }))
                setErrores(prev => ({
                    ...prev,
                    idSalida: val ? '' : (prev.idSalida ? validarCampo('idSalida', { idSalida: '' }) : prev.idSalida),
                    idSalidaVehiculoConductor: '',
                }))
                setParInput('')
                afterChange()
            }}
            onBlur={() => setErrores(prev => ({ ...prev, idSalida: validarCampo('idSalida', form) }))}
            renderOption={(props, r) => {
                const { key, ...rest } = props
                const placas = (r.paresVehiculoConductor || []).map(p => p.placa).filter(Boolean)
                return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                            width: 34, height: 34, flexShrink: 0,
                            backgroundColor: theme.palette.avatarDefault.bg,
                            color: theme.palette.avatarDefault.color,
                        }}>
                            <EventOutlinedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                                {r.fechaSalida ? formatFecha(r.fechaSalida) : 'Sin fecha'}{r.horaSalida ? ` · ${formatHora12(r.horaSalida)}` : ''}
                            </Typography>
                            {placas.length > 0 && (
                                <Typography variant="caption" color={theme.palette.text.secondary} noWrap sx={{ display: 'block' }}>
                                    {placas.length > 1 ? `${placas.length} vehículos: ` : ''}{placas.join(', ')}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )
            }}
            filterOptions={(opts) => [...opts].sort((a, b) => (a.fechaSalida || '').localeCompare(b.fechaSalida || ''))}
            noOptionsText={corredorSeleccionado ? 'No hay salidas para esta ruta' : 'Primero elige una ruta'}
            renderInput={(params) => (
                <TextField {...params} label="Salida *"
                    error={!!errores.idSalida && !!corredorSeleccionado}
                    helperText={errores.idSalida || (rutaDisabled
                        ? rutaHelperTextDisabled
                        : (corredorSeleccionado ? 'Fecha y hora del viaje' : 'Selecciona primero una ruta'))}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                    sx={formFieldStyles} />
            )}
        />
        </Box>

        {/* Anticipo ida+retorno (2026-09-13, ver LOGICA.md): un anticipo sobre una
            IDA (idSalidaIda == null) cubre también su regreso, aunque ese regreso
            todavía no exista -- se avisa acá, en el momento en que se elige la
            salida, para que no sea una sorpresa cuando el conductor no pueda
            legalizar recién al completar la ida. Un anticipo creado directo
            sobre un regreso (caso raro) no lo necesita: se legaliza solo con sus
            propias sedes, como cualquier salida suelta. */}
        {rutaSeleccionada && rutaSeleccionada.idSalidaIda == null && (
            <Alert severity="info" sx={{ borderRadius: 2, mt: -1 }}>
                Este anticipo cubre ida y regreso de la salida. El conductor solo podrá legalizarlo
                cuando también termine de entregar los paquetes asignados de regreso.
            </Alert>
        )}

        <Autocomplete
            options={pares}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            disabled={parDisabled}
            getOptionLabel={(p) => `${p.placa || 'Sin placa'} — ${p.conductorNombre}`}
            isOptionEqualToValue={(opt, val) => opt.idSalidaVehiculoConductor === val.idSalidaVehiculoConductor}
            value={parSeleccionado || null}
            inputValue={parInput}
            onInputChange={(_, newVal, reason) => {
                if (reason === 'input') setParInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, ''))
                else setParInput(newVal)
            }}
            onChange={(_, val) => {
                setForm(prev => ({ ...prev, idSalidaVehiculoConductor: val ? val.idSalidaVehiculoConductor : '' }))
                setErrores(prev => ({
                    ...prev,
                    idSalidaVehiculoConductor: val ? '' : (prev.idSalidaVehiculoConductor ? validarCampo('idSalidaVehiculoConductor', { idSalidaVehiculoConductor: '' }) : prev.idSalidaVehiculoConductor),
                }))
                afterChange()
            }}
            onBlur={() => setErrores(prev => ({ ...prev, idSalidaVehiculoConductor: validarCampo('idSalidaVehiculoConductor', form) }))}
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
            noOptionsText={form?.idSalida ? 'No hay vehículos en esta salida' : 'Primero selecciona una salida'}
            renderInput={(params) => (
                <TextField {...params} label="Vehículo y conductor *"
                    error={!!errores.idSalidaVehiculoConductor}
                    helperText={errores.idSalidaVehiculoConductor || (parDisabled ? parHelperTextDisabled : 'Elige a cuál vehículo/conductor de la salida corresponde este anticipo')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={formFieldStyles} />
            )}
        />

        {mostrarAdvertencia && (
            <Alert severity="warning" sx={{ borderRadius: 2, mt: -1 }}>
                Este vehículo no tiene paquetes asignados en esta salida — el anticipo se registrará igual, solo confírmalo a propósito.
            </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField
                label="Valor del anticipo (COP)"
                name="valorAnticipo"
                value={formatearMoneda(form?.valorAnticipo)}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, valorAnticipo: validarCampo('valorAnticipo', form) }))}
                required
                disabled={valorDisabled}
                icon={AttachMoneyOutlinedIcon}
                placeholder="Ej: 500.000"
                error={errores.valorAnticipo}
                helperText={errores.valorAnticipo || (valorDisabled ? valorHelperTextDisabled : 'Valor en pesos colombianos')}
                inputProps={{ maxLength: 9 }}
            />
            <TextField
                fullWidth label="Fecha de entrega" name="fechaEntrega" type="date"
                value={form?.fechaEntrega || ''} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, fechaEntrega: validarCampo('fechaEntrega', form, rutaSeleccionada) }))} required
                disabled={fechaDisabled}
                error={!!errores.fechaEntrega}
                helperText={errores.fechaEntrega || (fechaDisabled
                    ? fechaHelperTextDisabled
                    : (rutaSeleccionada?.fechaSalida ? `Hasta el ${formatFecha(rutaSeleccionada.fechaSalida)} (salida)` : undefined))}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: {
                    min: sumarDias(hoyISO(), -MAX_DIAS_ANTICIPACION),
                    max: rutaSeleccionada?.fechaSalida || undefined,
                } }} sx={formFieldStyles}
            />
        </Box>
    </Box>
    )
}

export default PasoRutaVehiculo
