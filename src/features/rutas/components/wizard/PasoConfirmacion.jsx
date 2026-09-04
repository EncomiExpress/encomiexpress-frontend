import { Box, Typography, Paper, Alert, Divider } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { formatFecha } from '../../../../shared/utils/formatters.js'
import { getVehiculoLabel, getConductorLabel, getDestinoLabel } from '../../utils/rutaResolvers.js'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({
    theme, form, formOriginal, apiError, setApiError, sinCambios, setSinCambios,
    destinos, vehiculos, conductores, ruta,
}) => {
    const paresOriginales = ruta?.paresVehiculoConductor || []

    const camposComparados = formOriginal ? [
        [form.origen, formOriginal.origen],
        [JSON.stringify(form.pares), JSON.stringify(formOriginal.pares)],
        [form.idDestino, formOriginal.idDestino],
        [JSON.stringify(form.paradas), JSON.stringify(formOriginal.paradas)],
        [form.fechaSalida, formOriginal.fechaSalida],
        [form.horaSalida, formOriginal.horaSalida],
        [form.fechaLlegadaEstimada, formOriginal.fechaLlegadaEstimada],
        [form.horaLlegadaEstimada, formOriginal.horaLlegadaEstimada],
        [form.observaciones, formOriginal.observaciones],
    ] : []
    const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

    const paresConfirmacion = form.pares.filter(p => p.idVehiculo && p.idConductor)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formOriginal && totalModificados > 0 && (
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
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <RouteOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos de la Ruta y Horario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información y el horario de la ruta</Typography>
                    <ConfirmRow label="Origen" value={form.origen} previousValue={formOriginal?.origen} />
                    <ConfirmRow label="Destino" value={getDestinoLabel(form.idDestino, destinos, ruta)} previousValue={formOriginal ? getDestinoLabel(formOriginal.idDestino, destinos, ruta) : undefined} />
                    {(form.paradas || []).filter(p => p.idDestino).length > 0 && (
                        <ConfirmRow label="Paradas"
                            value={form.paradas.filter(p => p.idDestino).map((p, i) => `${i + 1}. ${getDestinoLabel(p.idDestino, destinos, ruta)}`).join(' · ')}
                            previousValue={formOriginal ? (formOriginal.paradas || []).filter(p => p.idDestino).map((p, i) => `${i + 1}. ${getDestinoLabel(p.idDestino, destinos, ruta)}`).join(' · ') || 'Ninguna' : undefined} />
                    )}
                    <ConfirmRow label="Fecha Salida" value={formatFecha(form.fechaSalida)} previousValue={formOriginal?.fechaSalida ? formatFecha(formOriginal.fechaSalida) : undefined} />
                    <ConfirmRow label="Hora Salida" value={form.horaSalida} previousValue={formOriginal?.horaSalida} />
                    <ConfirmRow label="Fecha Estimada de Llegada" value={formatFecha(form.fechaLlegadaEstimada)} previousValue={formOriginal?.fechaLlegadaEstimada ? formatFecha(formOriginal.fechaLlegadaEstimada) : undefined} />
                    <ConfirmRow label="Hora Llegada" value={form.horaLlegadaEstimada || 'N/A'} previousValue={formOriginal ? (formOriginal.horaLlegadaEstimada || 'N/A') : undefined} />
                    <ConfirmRow label="Observaciones" value={form.observaciones} previousValue={formOriginal?.observaciones} />
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
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
                        const orig = formOriginal?.pares?.[i]
                        return (
                            <Box key={i}>
                                <ConfirmRow label={arr.length > 1 ? `Vehículo ${i + 1}` : 'Vehículo'}
                                    value={getVehiculoLabel(par.idVehiculo, vehiculos, paresOriginales)}
                                    previousValue={orig ? getVehiculoLabel(orig.idVehiculo, vehiculos, paresOriginales) : undefined} />
                                <ConfirmRow label={arr.length > 1 ? `Conductor ${i + 1}` : 'Conductor'}
                                    value={getConductorLabel(par.idConductor, conductores, paresOriginales)}
                                    previousValue={orig ? getConductorLabel(orig.idConductor, conductores, paresOriginales) : undefined} />
                                {i < arr.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        )
                    })}
                </Paper>
            </Box>
        </Box>
    )
}

export default PasoConfirmacion
