import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import { formatFecha, formatHora12 } from '../../../shared/utils/formatters.js'
import { getEstadoColorRuta as getEstadoColor } from '../../../shared/utils/estadoColors.js'
import { RutaEstadoDot as SalidaEstadoDot } from '../../rutas/components/EstadoDot.jsx'
import { resolvePares, getSalidaId } from '../utils/salidaResolvers.js'
import { warningChipSx, errorChipSx } from '../style/chips.js'

// Adaptado de la vieja useRutaColumns.jsx (ver git history de src/features/rutas):
// misma lógica de gating por rol/permiso, mismos chips ("Programar viaje de
// regreso", "Reutilizar", "Regreso pendiente") -- ahora sobre SalidaProgramada.
// Sin columnas de Origen/Destino: esta tabla vive SIEMPRE dentro de la vista
// scoped de una Ruta puntual (/transporte/rutas/:idRuta/salidas), así que el
// corredor ya está visible en el encabezado de la página -- repetirlo en cada
// fila era redundante.
const useSalidaColumns = ({
    theme, tienePermiso, PERMISOS, getVehiculos, getConductores, sedeActual, usuario,
    onConsultar, onEditar, onEditarHorarioSede, onToggleHabilitado, onAbrirMenuEstado, onCancelarEnRuta, onProgramarRegreso, onProgramarRegresoSede, onReutilizarSalida, onAsignarRepartidor,
}) => [
    {
        key: 'fechaHora', label: 'Fecha y hora salida', cellSx: { py: 1.5 },
        render: (salida) => (
            <>
                <Typography sx={{ fontSize: '0.875rem' }}>{formatFecha(salida.fechaSalida)}</Typography>
                {salida.horaSalida && (
                    <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{formatHora12(salida.horaSalida)}</Typography>
                )}
            </>
        ),
    },
    {
        key: 'vehiculo', label: 'Vehículo', cellSx: { py: 1.5 },
        render: (salida) => {
            const pares = resolvePares(salida, { getVehiculos, getConductores })
            const adicionales = Math.max(0, pares.length - 1)
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <PlacaDisplay placa={pares[0]?.placa} theme={theme} />
                        {adicionales > 0 && (
                            <Tooltip title={`${adicionales} ${adicionales === 1 ? 'vehículo adicional' : 'vehículos adicionales'}`}>
                                <Chip
                                    label={`+${adicionales}`}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                    {pares.some(p => p.vehiculoInhabilitado) && salida.estado === 'Programada' && (
                        <Chip
                            label="Reasignar vehículo"
                            size="small"
                            sx={warningChipSx(theme, { height: 18, compact: true })}
                        />
                    )}
                    {pares.some(p => p.documentoVencido) && ['Programada', 'En Ruta'].includes(salida.estado) && (
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
        render: (salida) => {
            const pares = resolvePares(salida, { getVehiculos, getConductores })
            const adicionales = Math.max(0, pares.length - 1)
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: '0.875rem' }}>{pares[0]?.conductorNombre || 'N/A'}</Typography>
                        {adicionales > 0 && (
                            <Tooltip title={`${adicionales} ${adicionales === 1 ? 'conductor adicional' : 'conductores adicionales'}`}>
                                <Chip
                                    label={`+${adicionales}`}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                    {pares.some(p => p.conductorInhabilitado) && salida.estado === 'Programada' && (
                        <Chip
                            label="Reasignar conductor"
                            size="small"
                            sx={warningChipSx(theme, { height: 18, compact: true })}
                        />
                    )}
                    {pares.some(p => p.licenciaVencida) && ['Programada', 'En Ruta'].includes(salida.estado) && (
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
        key: 'estado', label: 'Estado', width: 230, cellSx: { py: 1.5, minWidth: 230 },
        render: (salida) => {
            const id = getSalidaId(salida)
            const esRegreso = salida.idSalidaIda != null
            // El menú de cambiar estado (PATCH /salidas/:id/estado) exige actualizar_ruta
            // en el backend — sin el permiso, se pinta sin borde/chevron/cursor. Si
            // además la salida es el regreso de una sede con operador_sede propio
            // (`salida.esRegresoDeSedePropia`, calculado en salidaProgramadaService.getAll),
            // ni siquiera `actualizar_ruta` alcanza — es de esa sede en exclusiva. El
            // segundo OR es la única excepción real: `operador_sede` puede "poner en
            // ruta" (Programada -> En Ruta) el regreso de su propia sede.
            const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
            const puedeGestionarEstado = (tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && !salida.esRegresoDeSedePropia)
                || (esOperadorSede && tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && esRegreso && salida.estado === 'Programada')
            // Una salida de ida ya Completada cuyo convoy sigue "fuera de base" (algún par
            // con idDestinoActual) y todavía sin regreso programado: el conductor/vehículo
            // están varados en el destino.
            const regresoPendiente = !esRegreso && salida.estado === 'Completada' && !salida.salidaRegreso
                && (salida.paresVehiculoConductor || []).some(
                    (p) => p?.conductor?.idDestinoActual != null || p?.vehiculo?.idDestinoActual != null
                )
            const infoRegreso = (esRegreso || regresoPendiente) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, px: 0.5 }}>
                    {esRegreso && (
                        <Chip label="Viaje de regreso" size="small"
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, borderRadius: '3px', width: 'fit-content',
                                backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker,
                                '& .MuiChip-label': { px: 0.7 } }} />
                    )}
                    {regresoPendiente && (
                        <Typography sx={{ fontSize: '0.66rem', fontWeight: 500, color: '#D97706' }}>
                            ↩ Regreso pendiente
                        </Typography>
                    )}
                </Box>
            )
            const contenido = salida.estado === 'Completada' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                    <SalidaEstadoDot estado="Completada" />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Completada</Typography>
                </Box>
            ) : salida.estado === 'En Ruta' && salida.paquetesPendientes ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={puedeGestionarEstado
                        ? { display: 'flex', alignItems: 'center', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: 'hidden' }
                        : { display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, flex: 1 }}>
                            <SalidaEstadoDot estado="En Ruta" />
                            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', color: getEstadoColor('En Ruta').color }}>
                                En Ruta
                            </Typography>
                        </Box>
                        {puedeGestionarEstado && (
                            <>
                                <Box sx={{ width: '1px', height: 28, backgroundColor: theme.palette.divider, flexShrink: 0 }} />
                                <Box
                                    onClick={() => onCancelarEnRuta(id)}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <SalidaEstadoDot estado="Cancelada" />
                                    <Typography variant="body2" sx={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap', color: getEstadoColor('Cancelada').color }}>
                                        Cancelada
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                    <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                        {salida.sedesTotales > 0 && `Sedes ${salida.sedesCompletadas ?? 0}/${salida.sedesTotales} · `}
                        Paquetes pendientes
                    </Typography>
                </Box>
            ) : salida.estado === 'En Ruta' && salida.sedesTotales > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Box
                        onClick={puedeGestionarEstado ? (e) => onAbrirMenuEstado(e.currentTarget, id, salida.estado || 'Programada', salida) : undefined}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1, width: '100%', px: 1, py: 0.6,
                            ...(puedeGestionarEstado
                                ? { cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, '&:hover': { borderColor: theme.palette.text.secondary } }
                                : { cursor: 'default' }),
                        }}
                    >
                        <SalidaEstadoDot estado="En Ruta" />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor('En Ruta').color }}>En Ruta</Typography>
                        {puedeGestionarEstado && <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                        {`Sedes ${salida.sedesCompletadas ?? 0}/${salida.sedesTotales} completadas`}
                    </Typography>
                </Box>
            ) : (
                <Box
                    onClick={puedeGestionarEstado ? (e) => onAbrirMenuEstado(e.currentTarget, id, salida.estado || 'Programada', salida) : undefined}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1, width: 'fit-content', px: 1, py: 0.6,
                        ...(puedeGestionarEstado
                            ? { cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, '&:hover': { borderColor: theme.palette.text.secondary } }
                            : { cursor: 'default' }),
                    }}
                >
                    <SalidaEstadoDot estado={salida.estado || 'Programada'} />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', color: getEstadoColor(salida.estado).color }}>
                        {salida.estado || 'Programada'}
                    </Typography>
                    {puedeGestionarEstado && <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />}
                </Box>
            )
            if (!infoRegreso) return contenido
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    {contenido}
                    {infoRegreso}
                </Box>
            )
        },
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (salida) => {
            const id = getSalidaId(salida)
            const esRegreso = salida.idSalidaIda != null
            const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
            const puedeEditarAdmin = tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && !salida.esRegresoDeSedePropia
            const puedeEditarSede = esOperadorSede && tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && esRegreso
            const puedeInhabilitarAdmin = tienePermiso(PERMISOS.INHABILITAR_RUTA) && !salida.esRegresoDeSedePropia
            const puedeInhabilitarSede = esOperadorSede && tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && esRegreso
            return (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {/* Solo una ida (nunca un regreso) puede recibir su propio regreso, y no
                        si el destino de ESTA ida tiene su propio operador_sede
                        (`salida.miDestinoTieneOperadorSede`) -- programar ese regreso es
                        exclusivo de esa sede (crearRegresoDesdeSede). */}
                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && salida.estado === 'Completada' && !esRegreso && !salida.salidaRegreso && !salida.miDestinoTieneOperadorSede && (
                        <Tooltip title="Programar viaje de regreso">
                            <IconButton size="small" onClick={() => onProgramarRegreso(salida)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <SyncAltOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* "Reutilizar salida": preselecciona la MISMA plantilla de ruta (y
                        convoy) como punto de partida editable para una salida NUEVA
                        e independiente -- no toca idSalidaIda. Nunca sobre un regreso. */}
                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && salida.estado === 'Completada' && !esRegreso && (
                        <Tooltip title="Reutilizar salida">
                            <IconButton size="small" onClick={() => onReutilizarSalida(salida)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* operador_sede: acción propia (WS4, "Sedes remotas") — una ida
                        Completada, sin regreso enlazado, cuyo convoy sigue en el municipio
                        de la sede del operador. */}
                    {tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && salida.estado === 'Completada' && !salida.salidaRegreso
                        && sedeActual && (salida.paresVehiculoConductor || []).some(
                            (p) => p?.conductor?.idDestinoActual === sedeActual.idDestino || p?.vehiculo?.idDestinoActual === sedeActual.idDestino
                        ) && (
                        <Tooltip title="Programar regreso">
                            <IconButton size="small" onClick={() => onProgramarRegresoSede(salida)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <SyncAltOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* Agregar un vehículo+conductor más al convoy sin abrir todo el wizard de
                        edición -- solo tiene sentido antes de que la salida arranque, con el
                        mismo permiso que editarla. Un regreso nunca lo muestra: hereda el
                        convoy completo de la ida, no se le puede sumar nada. */}
                    {puedeEditarAdmin && !esRegreso && salida.estado === 'Programada' && (
                        <Tooltip title="Asignar Conductor">
                            <IconButton size="small" onClick={() => onAsignarRepartidor(salida)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => onConsultar(salida)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {puedeEditarAdmin && (
                        salida.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : !['Programada', 'Cancelada'].includes(salida.estado) ? (
                            <Tooltip title="Solo se puede editar una salida Programada o Cancelada">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => onEditar(salida)}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {puedeEditarSede && (
                        salida.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : !['Programada', 'Cancelada'].includes(salida.estado) ? (
                            <Tooltip title="Solo se puede editar un regreso Programado o Cancelado">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar fecha/hora">
                                <IconButton size="small" onClick={() => onEditarHorarioSede(salida)}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {(puedeInhabilitarAdmin || puedeInhabilitarSede) && (
                        <ToggleSwitch id={id} checked={salida.habilitado !== false} onChange={() => onToggleHabilitado(id)} />
                    )}
                </Box>
            )
        },
    },
]

export default useSalidaColumns
