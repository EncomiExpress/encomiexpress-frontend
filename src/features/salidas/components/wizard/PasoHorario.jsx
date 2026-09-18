import { Box, Typography } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import CalendarioDisponibilidad from '../../../../shared/components/CalendarioDisponibilidad.jsx'
import SelectorHora from '../../../../shared/components/SelectorHora.jsx'
import { getRangoSalida, getRangoLlegada, sumarDias, hoyISO, MIN_DIAS_SALIDA_LLEGADA } from '../../../../shared/utils/horarioLaboral.js'
import { maxISO, validarCampo } from '../../validations/salidaValidation.js'

// `original` (solo al editar): { fechaSalida, horaSalida } como estaban guardadas -- una salida
// programada antes del despacho nocturno conserva su hora de día mientras no se le toque
// la fecha ni la hora (ver validarCampo).
const PasoHorario = ({
    form, setForm, errores, setErrores, setApiError, handleChange,
    idSalidaExcluir, refrescarDisponibilidad, esRegreso = false, afterChange = () => { }, original = null,
}) => {
    // Mismo día: el rango de la llegada arranca en la hora de salida, no a las 00:00 --
    // sin esto, el selector deja escoger una llegada antes que la salida (ver
    // validarCampo, mismo chequeo replicado). La llegada no tiene otra ventana: un
    // despacho de noche llega de madrugada o esa misma noche.
    const rangoLlegadaBase = getRangoLlegada(form.fechaLlegadaEstimada)
    const horaSalidaHM = (form.horaSalida || '').slice(0, 5)
    const rangoLlegada = rangoLlegadaBase && form.fechaLlegadaEstimada === form.fechaSalida
        && horaSalidaHM && horaSalidaHM > rangoLlegadaBase.min
        ? { ...rangoLlegadaBase, min: horaSalidaHM }
        : rangoLlegadaBase

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 260 }}>
            <CalendarioDisponibilidad
                label="Fecha de Salida"
                required
                value={form.fechaSalida}
                onChange={(iso) => {
                    // Si la salida cambia, la llegada ya elegida podría dejar de ser
                    // válida (mínimo de días, o un nuevo choque con otra salida) — se
                    // limpia para que el usuario la vuelva a elegir sobre el calendario
                    // ya actualizado, en vez de dejar una fecha inválida sin avisar.
                    const formActualizado = { ...form, fechaSalida: iso, fechaLlegadaEstimada: '' }
                    setForm(formActualizado)
                    setErrores(prev => ({
                        ...prev,
                        fechaSalida: '',
                        fechaLlegadaEstimada: '',
                        horaSalida: prev.horaSalida ? validarCampo('horaSalida', formActualizado, original) : '',
                    }))
                    setApiError(null)
                    afterChange()
                }}
                pares={form.pares}
                idSalidaExcluir={idSalidaExcluir}
                esRegreso={esRegreso}
                minDate={hoyISO()}
                maxDate={maxISO()}
                refrescarKey={refrescarDisponibilidad}
                error={errores.fechaSalida}
                helperText={esRegreso ? undefined : 'Los días en rojo ya tienen a ese vehículo o conductor ocupado en otra salida'}
            />
            </Box>
            <Box sx={{ flex: 1, minWidth: 260 }}>
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
                    afterChange()
                }}
                pares={form.pares}
                idSalidaExcluir={idSalidaExcluir}
                esRegreso={esRegreso}
                minDate={form.fechaSalida ? sumarDias(form.fechaSalida, MIN_DIAS_SALIDA_LLEGADA) : hoyISO()}
                maxDate={maxISO()}
                refrescarKey={refrescarDisponibilidad}
                error={errores.fechaLlegadaEstimada}
                helperText={!form.fechaSalida ? 'Selecciona primero la fecha de salida' : (esRegreso ? undefined : 'Los días en rojo ya tienen a ese vehículo o conductor ocupado en otra salida')}
            />
            </Box>
        </Box>
        {idSalidaExcluir && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                    Si cambias estas fechas, se sincroniza también la fecha de entrega de las ventas vinculadas.
                </Typography>
            </Box>
        )}
        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
                <SelectorHora label="Hora de Salida" required
                    value={form.horaSalida}
                    onChange={(v) => {
                        const formActualizado = { ...form, horaSalida: v }
                        setForm(formActualizado)
                        setErrores(prev => ({
                            ...prev,
                            horaSalida: validarCampo('horaSalida', formActualizado, original),
                            // La llegada (si ya estaba elegida) puede haber quedado inválida
                            // al mover la salida más tarde el mismo día.
                            horaLlegadaEstimada: prev.horaLlegadaEstimada ? validarCampo('horaLlegadaEstimada', formActualizado) : prev.horaLlegadaEstimada,
                        }))
                        afterChange()
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, horaSalida: validarCampo('horaSalida', form, original) }))}
                    rango={getRangoSalida(form.fechaSalida)}
                    error={errores.horaSalida}
                    helperText={form.fechaSalida ? 'Solo despacho nocturno' : 'Selecciona primero la fecha de salida'} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 220 }}>
                <SelectorHora label="Hora Estimada de Llegada"
                    value={form.horaLlegadaEstimada}
                    onChange={(v) => {
                        const formActualizado = { ...form, horaLlegadaEstimada: v }
                        setForm(formActualizado)
                        setErrores(prev => ({ ...prev, horaLlegadaEstimada: validarCampo('horaLlegadaEstimada', formActualizado) }))
                        afterChange()
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, horaLlegadaEstimada: validarCampo('horaLlegadaEstimada', form) }))}
                    rango={rangoLlegada}
                    error={errores.horaLlegadaEstimada}
                    helperText={form.fechaLlegadaEstimada ? (form.fechaLlegadaEstimada === form.fechaSalida ? 'Opcional · debe ser después de la hora de salida' : 'Opcional') : 'Selecciona primero la fecha de llegada'} />
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
}

export default PasoHorario
