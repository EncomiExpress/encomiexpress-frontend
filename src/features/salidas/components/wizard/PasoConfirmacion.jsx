import { useState } from 'react'
import { Box, Typography, Paper, Alert, Divider, Button } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import ModalRutaDiagrama from '../../../../shared/components/ModalRutaDiagrama.jsx'
import { formatFecha, formatHora12 } from '../../../../shared/utils/formatters.js'
import { getVehiculoLabel, getConductorLabel, getDestinoLabel } from '../../utils/salidaResolvers.js'
import { getRutaLabel } from '../../../rutas/utils/rutaResolvers.js'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({
    theme, form, formOriginal, apiError, setApiError, sinCambios, setSinCambios,
    destinos, vehiculos, conductores, salida, rutaSeleccionada,
}) => {
    const [diagramaOpen, setDiagramaOpen] = useState(false)
    const paresOriginales = salida?.paresVehiculoConductor || []
    const destinoLabel = rutaSeleccionada?.destino?.municipio || '—'

    const camposComparados = formOriginal ? [
        [form.origen, formOriginal.origen],
        // Las paradas viven dentro de cada par -- comparar form.pares contra
        // formOriginal.pares ya cubre convoy Y recorrido de cada uno.
        [JSON.stringify(form.pares), JSON.stringify(formOriginal.pares)],
        [form.idRuta, formOriginal.idRuta],
        [form.fechaSalida, formOriginal.fechaSalida],
        [form.horaSalida, formOriginal.horaSalida],
        [form.fechaLlegadaEstimada, formOriginal.fechaLlegadaEstimada],
        [form.horaLlegadaEstimada, formOriginal.horaLlegadaEstimada],
        [form.observaciones, formOriginal.observaciones],
    ] : []
    const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

    const paresConfirmacion = form.pares.filter(p => p.idVehiculo && p.idConductor)
    // Un diagrama POR PAR -- cada vehículo puede tener su propio recorrido ("ruta
    // fraccionada"), ya no se muestra solo el del primero como "representativo".
    const recorridosPorPar = paresConfirmacion.map((par, i, arr) => ({
        label: arr.length > 1 ? `Vehículo ${i + 1}` : 'Recorrido',
        paradas: (par.paradas || []).filter(p => p.idDestino).map(p => getDestinoLabel(p.idDestino, destinos, salida).split(' - ')[0]),
    }))

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
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Recorrido</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Verifica la ruta, el origen, las paradas y el destino</Typography>
                        <Button size="small" startIcon={<RouteOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setDiagramaOpen(true)}
                            sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontSize: '0.78rem', flexShrink: 0 }}>
                            Ver recorrido
                        </Button>
                    </Box>
                    <ConfirmRow label="Ruta (plantilla)" value={getRutaLabel(rutaSeleccionada)} />
                    <ConfirmRow label="Origen" value={form.origen} previousValue={formOriginal?.origen} />
                    {/* Las paradas ya NO se listan acá -- son del recorrido propio de cada
                        repartidor, no del corredor compartido. Se muestran junto a cada
                        vehículo en la tarjeta de al lado. */}
                    <ConfirmRow label="Destino" value={destinoLabel} />
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>
                            {paresConfirmacion.length > 1 ? 'Vehículos y Conductores' : 'Vehículo y Conductor'}
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Verifica los vehículos y conductores asignados a la salida
                    </Typography>
                    {paresConfirmacion.map((par, i, arr) => {
                        const orig = formOriginal?.pares?.[i]
                        const paradasActuales = (par.paradas || []).filter(p => p.idDestino)
                        const paradasOriginales = (orig?.paradas || []).filter(p => p.idDestino)
                        return (
                            <Box key={i}>
                                <ConfirmRow label={arr.length > 1 ? `Vehículo ${i + 1}` : 'Vehículo'}
                                    value={getVehiculoLabel(par.idVehiculo, vehiculos, paresOriginales)}
                                    previousValue={orig ? getVehiculoLabel(orig.idVehiculo, vehiculos, paresOriginales) : undefined} />
                                <ConfirmRow label={arr.length > 1 ? `Conductor ${i + 1}` : 'Conductor'}
                                    value={getConductorLabel(par.idConductor, conductores, paresOriginales)}
                                    previousValue={orig ? getConductorLabel(orig.idConductor, conductores, paresOriginales) : undefined} />
                                {/* Recorrido propio de ESTE repartidor -- dos pares del mismo
                                    convoy pueden pasar por municipios distintos ("ruta
                                    fraccionada"), así que no se listan junto al corredor. */}
                                {paradasActuales.map((p, j) => (
                                    <ConfirmRow key={j} label={paradasActuales.length > 1 ? `Parada ${j + 1}` : 'Parada'}
                                        value={getDestinoLabel(p.idDestino, destinos, salida)}
                                        previousValue={formOriginal ? (paradasOriginales[j] ? getDestinoLabel(paradasOriginales[j].idDestino, destinos, salida) : 'Ninguna') : undefined} />
                                ))}
                                {i < arr.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        )
                    })}
                </Paper>
            </Box>
            <Paper elevation={0} sx={cardSx(theme)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <ScheduleOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Horario y Detalles</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica el horario y las observaciones de la salida</Typography>
                <ConfirmRow label="Fecha Salida" value={formatFecha(form.fechaSalida)} previousValue={formOriginal?.fechaSalida ? formatFecha(formOriginal.fechaSalida) : undefined} />
                <ConfirmRow label="Hora Salida" value={formatHora12(form.horaSalida)} previousValue={formOriginal?.horaSalida ? formatHora12(formOriginal.horaSalida) : undefined} />
                <ConfirmRow label="Fecha Estimada de Llegada" value={formatFecha(form.fechaLlegadaEstimada)} previousValue={formOriginal?.fechaLlegadaEstimada ? formatFecha(formOriginal.fechaLlegadaEstimada) : undefined} />
                <ConfirmRow label="Hora Llegada" value={formatHora12(form.horaLlegadaEstimada) || 'N/A'} previousValue={formOriginal ? (formatHora12(formOriginal.horaLlegadaEstimada) || 'N/A') : undefined} />
                <ConfirmRow label="Observaciones" value={form.observaciones} previousValue={formOriginal?.observaciones} />
            </Paper>
            <ModalRutaDiagrama
                open={diagramaOpen}
                onClose={() => setDiagramaOpen(false)}
                origen={form.origen}
                recorridos={recorridosPorPar}
                destino={destinoLabel}
                subtitulo={`${form.origen || ''} → ${destinoLabel}`}
            />
        </Box>
    )
}

export default PasoConfirmacion
