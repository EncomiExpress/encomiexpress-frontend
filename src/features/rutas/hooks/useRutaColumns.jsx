import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import { formatFecha, formatHora12 } from '../../../shared/utils/formatters.js'
import { getEstadoColorRuta as getEstadoColor } from '../../../shared/utils/estadoColors.js'
import { RutaEstadoDot } from '../components/EstadoDot.jsx'
import { resolvePares, resolveDestino, getRutaId } from '../utils/rutaResolvers.js'
import { warningChipSx, errorChipSx } from '../style/chips.js'

const useRutaColumns = ({
    theme, tienePermiso, PERMISOS, destinos, getVehiculos, getConductores,
    onConsultar, onEditar, onToggleHabilitado, onAbrirMenuEstado, onCancelarEnRuta,
}) => [
    { key: 'origen', label: 'Origen', sortField: 'origen', cellSx: { py: 1.5, fontSize: '0.85rem' }, render: (ruta) => ruta.origen || '—' },
    { key: 'destino', label: 'Destino', cellSx: { py: 1.5, fontSize: '0.85rem' }, render: (ruta) => resolveDestino(ruta, destinos, { preferNombre: true }) },
    {
        key: 'fechaHora', label: 'Fecha y hora salida', cellSx: { py: 1.5 },
        render: (ruta) => (
            <>
                <Typography sx={{ fontSize: '0.875rem' }}>{formatFecha(ruta.fechaSalida)}</Typography>
                {ruta.horaSalida && (
                    <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{formatHora12(ruta.horaSalida)}</Typography>
                )}
            </>
        ),
    },
    {
        key: 'vehiculo', label: 'Vehículo', cellSx: { py: 1.5 },
        render: (ruta) => {
            const pares = resolvePares(ruta, { getVehiculos, getConductores })
            const adicionales = Math.max(0, pares.length - 1)
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <PlacaDisplay placa={pares[0]?.placa} theme={theme} />
                        {adicionales > 0 && (
                            <Chip
                                label={`+${adicionales} ${adicionales === 1 ? 'vehículo' : 'vehículos'}`}
                                size="small"
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                            />
                        )}
                    </Box>
                    {pares.some(p => p.vehiculoInhabilitado) && ruta.estado === 'Programada' && (
                        <Chip
                            label="Reasignar vehículo"
                            size="small"
                            sx={warningChipSx(theme, { height: 18, compact: true })}
                        />
                    )}
                    {pares.some(p => p.documentoVencido) && ['Programada', 'En Ruta'].includes(ruta.estado) && (
                        <Tooltip title={[...new Set(pares.filter(p => p.documentoVencido).map(p => `${p.placa || 'Vehículo'}: ${p.documentoVencido} vencido`))].join(' · ')}>
                            <Chip
                                label={`${pares.find(p => p.documentoVencido)?.documentoVencido} vencido`}
                                size="small"
                                sx={errorChipSx(theme, { height: 18, compact: true })}
                            />
                        </Tooltip>
                    )}
                </Box>
            )
        },
    },
    {
        key: 'conductor', label: 'Conductor', cellSx: { py: 1.5 },
        render: (ruta) => {
            const pares = resolvePares(ruta, { getVehiculos, getConductores })
            const adicionales = Math.max(0, pares.length - 1)
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: '0.875rem' }}>{pares[0]?.conductorNombre || 'N/A'}</Typography>
                        {adicionales > 0 && (
                            <Chip
                                label={`+${adicionales} ${adicionales === 1 ? 'conductor' : 'conductores'}`}
                                size="small"
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                            />
                        )}
                    </Box>
                    {pares.some(p => p.conductorInhabilitado) && ruta.estado === 'Programada' && (
                        <Chip
                            label="Reasignar conductor"
                            size="small"
                            sx={warningChipSx(theme, { height: 18, compact: true })}
                        />
                    )}
                    {pares.some(p => p.licenciaVencida) && ['Programada', 'En Ruta'].includes(ruta.estado) && (
                        <Tooltip title={[...new Set(pares.filter(p => p.licenciaVencida).map(p => `${p.conductorNombre || 'Conductor'}: licencia vencida`))].join(' · ')}>
                            <Chip
                                label="Licencia vencida"
                                size="small"
                                sx={errorChipSx(theme, { height: 18, compact: true })}
                            />
                        </Tooltip>
                    )}
                </Box>
            )
        },
    },
    {
        key: 'estado', label: 'Estado', width: 150, cellSx: { py: 1.5, minWidth: 150 },
        render: (ruta) => {
            const id = getRutaId(ruta)
            return ruta.estado === 'Completada' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                    <RutaEstadoDot estado="Completada" />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Completada</Typography>
                </Box>
            ) : ruta.estado === 'En Ruta' && (ruta.pendienteLegalizacion || ruta.paquetesPendientes) ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, flex: 1 }}>
                            <RutaEstadoDot estado="En Ruta" />
                            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor('En Ruta').color }}>
                                En Ruta
                            </Typography>
                        </Box>
                        <Box sx={{ width: '1px', height: 28, backgroundColor: theme.palette.divider, flexShrink: 0 }} />
                        <Box
                            onClick={() => onCancelarEnRuta(id)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, cursor: 'pointer' }}
                        >
                            <RutaEstadoDot estado="Cancelada" />
                            <Typography variant="body2" sx={{ fontSize: '0.72rem', fontWeight: 500, color: getEstadoColor('Cancelada').color }}>
                                Cancelada
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                        {ruta.pendienteLegalizacion && ruta.paquetesPendientes
                            ? 'Legalización y paquetes pendientes'
                            : ruta.pendienteLegalizacion
                                ? 'Legalización pendiente'
                                : 'Paquetes pendientes de entrega'}
                    </Typography>
                </Box>
            ) : (
                <Box
                    onClick={(e) => onAbrirMenuEstado(e.currentTarget, id, ruta.estado || 'Programada')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
                >
                    <RutaEstadoDot estado={ruta.estado || 'Programada'} />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor(ruta.estado).color }}>
                        {ruta.estado || 'Programada'}
                    </Typography>
                    <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
                </Box>
            )
        },
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (ruta) => {
            const id = getRutaId(ruta)
            return (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => onConsultar(ruta)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && (
                        ruta.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : !['Programada', 'Cancelada'].includes(ruta.estado) ? (
                            <Tooltip title="Solo se puede editar una ruta Programada o Cancelada">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => onEditar(ruta)}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_RUTA) && (
                        <ToggleSwitch id={id} checked={ruta.habilitado !== false} onChange={() => onToggleHabilitado(id)} />
                    )}
                </Box>
            )
        },
    },
]

export default useRutaColumns
