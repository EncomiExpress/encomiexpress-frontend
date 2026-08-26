import { Box } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import CalendarioDisponibilidad from '../../../../shared/components/CalendarioDisponibilidad.jsx'
import SelectorHora from '../../../../shared/components/SelectorHora.jsx'
import { getRangoHorario, sumarDias, MIN_DIAS_SALIDA_LLEGADA } from '../../../../shared/utils/horarioLaboral.js'
import { mananaISO, maxISO, validarCampo } from '../../utils/rutaValidation.js'

const PasoHorario = ({
    form, setForm, errores, setErrores, setApiError, handleChange,
    idRutaExcluir, refrescarDisponibilidad, afterChange = () => { },
}) => (
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
                    afterChange()
                }}
                pares={form.pares}
                idRutaExcluir={idRutaExcluir}
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
                    afterChange()
                }}
                pares={form.pares}
                idRutaExcluir={idRutaExcluir}
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
                        afterChange()
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
                        afterChange()
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

export default PasoHorario
