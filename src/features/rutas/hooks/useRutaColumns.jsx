import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import { formatFecha, formatHora12 } from '../../../shared/utils/formatters.js'
import { getEstadoColorRuta as getEstadoColor } from '../../../shared/utils/estadoColors.js'
import { RutaEstadoDot } from '../components/EstadoDot.jsx'
import { resolvePares, resolveDestino, getRutaId } from '../utils/rutaResolvers.js'
import { warningChipSx, errorChipSx } from '../style/chips.js'

const useRutaColumns = ({
    theme, tienePermiso, PERMISOS, destinos, getVehiculos, getConductores, sedeActual, usuario,
    onConsultar, onEditar, onEditarHorarioSede, onToggleHabilitado, onAbrirMenuEstado, onCancelarEnRuta, onProgramarRegreso, onProgramarRegresoSede, onReutilizarRuta,
}) => [
    { key: 'origen', label: 'Origen', sortField: 'origen', cellSx: { py: 1.5, fontSize: '0.85rem' }, render: (ruta) => ruta.origen || '—' },
    {
        key: 'destino', label: 'Destino', width: 190, cellSx: { py: 1.5, fontSize: '0.85rem' },
        render: (ruta) => (
            <Typography sx={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={resolveDestino(ruta, destinos, { preferNombre: true })}>
                {resolveDestino(ruta, destinos, { preferNombre: true })}
            </Typography>
        ),
    },
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
                            <Tooltip title={`${adicionales} ${adicionales === 1 ? 'vehículo adicional' : 'vehículos adicionales'}`}>
                                <Chip
                                    label={`+${adicionales}`}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                                />
                            </Tooltip>
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
                            <Tooltip title={`${adicionales} ${adicionales === 1 ? 'conductor adicional' : 'conductores adicionales'}`}>
                                <Chip
                                    label={`+${adicionales}`}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                                />
                            </Tooltip>
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
        key: 'estado', label: 'Estado', width: 230, cellSx: { py: 1.5, minWidth: 230 },
        render: (ruta) => {
            const id = getRutaId(ruta)
            const esRegreso = ruta.idRutaIda != null
            // El menú de cambiar estado (PATCH /rutas/:id/estado) exige actualizar_ruta
            // en el backend — sin el permiso, se pinta sin borde/chevron/cursor (como
            // el Estado de solo lectura de Ventas), para no parecer un botón que no
            // lleva a nada — ver el `puedeGestionarEstado` de cada rama más abajo.
            // Si además la ruta es el regreso de una sede con operador_sede propio
            // (`ruta.esRegresoDeSedePropia`, calculado en rutaService.getAll), ni
            // siquiera `actualizar_ruta` alcanza — es de esa sede en exclusiva
            // (corregido 2026-09-12: el backend ya lo rechazaba, pero el admin
            // seguía viendo el menú como si pudiera). El segundo OR es la única
            // excepción real: `operador_sede` puede "poner en ruta"
            // (Programada -> En Ruta) el regreso de su propia sede — es quien de
            // verdad ve salir el convoy — pero ninguna otra transición ni otra
            // ruta (el backend lo re-valida igual). OJO: acá se exige el ROL
            // exacto (`usuario.rol.codigo`), no solo el permiso
            // `programar_regreso_sede` — el admin también lo tiene (lo recibe
            // automáticamente, como cualquier permiso, ver LOGICA.md), así que
            // mirar solo `tienePermiso` dejaba a un admin colarse por este OR en
            // el mismo caso que el de arriba bloquea (bug corregido 2026-09-12).
            // Como el listado de Rutas de operador_sede ya viene acotado a lo
            // suyo (rutaService.buildSedeCondition), cualquier fila con
            // `idRutaIda` que ve es necesariamente SU regreso.
            const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
            const puedeGestionarEstado = (tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && !ruta.esRegresoDeSedePropia)
                || (esOperadorSede && tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && esRegreso && ruta.estado === 'Programada')
            // Una ruta de ida ya Completada cuyo convoy sigue "fuera de base" (algún par
            // con idDestinoActual) y todavía sin regreso programado: el conductor/vehículo
            // están varados en el destino. Aviso no bloqueante (ver Captura 4/7).
            const regresoPendiente = !esRegreso && ruta.estado === 'Completada' && !ruta.rutaRegreso
                && (ruta.paresVehiculoConductor || []).some(
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
            const contenido = ruta.estado === 'Completada' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                    <RutaEstadoDot estado="Completada" />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Completada</Typography>
                </Box>
            ) : ruta.estado === 'En Ruta' && ruta.paquetesPendientes ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* El borde + separador solo tienen sentido cuando de verdad hay un
                        "Cancelada" pegado al lado — sin `puedeGestionarEstado` (ej. el
                        regreso de otra sede, o cualquier fila que la propia sede solo
                        consulta) se pinta plano, sin look de botón. Corregido 2026-09-12. */}
                    <Box sx={puedeGestionarEstado
                        ? { display: 'flex', alignItems: 'center', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: 'hidden' }
                        : { display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, flex: 1 }}>
                            <RutaEstadoDot estado="En Ruta" />
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
                                    <RutaEstadoDot estado="Cancelada" />
                                    <Typography variant="body2" sx={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap', color: getEstadoColor('Cancelada').color }}>
                                        Cancelada
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                    <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                        {ruta.sedesTotales > 0 && `Sedes ${ruta.sedesCompletadas ?? 0}/${ruta.sedesTotales} · `}
                        Paquetes pendientes
                    </Typography>
                </Box>
            ) : ruta.estado === 'En Ruta' && ruta.sedesTotales > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Box
                        onClick={puedeGestionarEstado ? (e) => onAbrirMenuEstado(e.currentTarget, id, ruta.estado || 'Programada', ruta) : undefined}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1, width: '100%', px: 1, py: 0.6,
                            ...(puedeGestionarEstado
                                ? { cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, '&:hover': { borderColor: theme.palette.text.secondary } }
                                : { cursor: 'default' }),
                        }}
                    >
                        <RutaEstadoDot estado="En Ruta" />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor('En Ruta').color }}>En Ruta</Typography>
                        {puedeGestionarEstado && <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                        {`Sedes ${ruta.sedesCompletadas ?? 0}/${ruta.sedesTotales} completadas`}
                    </Typography>
                </Box>
            ) : (
                // Sin "En Ruta" de por medio (Programada/Cancelada/etc.) esta caja no
                // necesita todo el ancho de la columna -- se deja del tamaño de su propio
                // contenido, en vez de estirarse igual que la de "En Ruta" (que sí lo
                // necesita: trae el botón partido de cancelar o el texto de sedes debajo).
                // Sin `puedeGestionarEstado`, se pinta como el Estado de solo lectura de
                // Ventas (dot + texto, sin borde ni look de botón) — corregido
                // 2026-09-12: antes el borde se mostraba siempre, así no hubiera ninguna
                // acción detrás (ej. el regreso de otra sede que ni el admin puede tocar,
                // o cualquier fila que la propia sede solo puede consultar).
                <Box
                    onClick={puedeGestionarEstado ? (e) => onAbrirMenuEstado(e.currentTarget, id, ruta.estado || 'Programada', ruta) : undefined}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1, width: 'fit-content', px: 1, py: 0.6,
                        ...(puedeGestionarEstado
                            ? { cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, '&:hover': { borderColor: theme.palette.text.secondary } }
                            : { cursor: 'default' }),
                    }}
                >
                    <RutaEstadoDot estado={ruta.estado || 'Programada'} />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', color: getEstadoColor(ruta.estado).color }}>
                        {ruta.estado || 'Programada'}
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
        render: (ruta) => {
            const id = getRutaId(ruta)
            const esRegreso = ruta.idRutaIda != null
            const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
            // Editar/Inhabilitar del admin quedan apagados en el regreso de una sede
            // con operador propio (`ruta.esRegresoDeSedePropia`, ver rutaService.getAll
            // y el mismo corte ya hecho en la columna Estado) — es de esa sede en
            // exclusiva, ni el admin la toca. A cambio, operador_sede tiene sus PROPIAS
            // versiones recortadas de esas dos acciones sobre su propio regreso (mismo
            // permiso `programar_regreso_sede` que ya usa para crearlo/ponerlo en
            // ruta): "Editar" abre un modal chico de solo fecha/hora (nunca el wizard
            // completo — convoy/paradas/destino los hereda de la ida), e "Inhabilitar"
            // es el mismo interruptor genérico (el backend ya revalida que sea suyo).
            // Corregido 2026-09-12, ver LOGICA.md, "Sedes remotas".
            const puedeEditarAdmin = tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && !ruta.esRegresoDeSedePropia
            const puedeEditarSede = esOperadorSede && tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && esRegreso
            const puedeInhabilitarAdmin = tienePermiso(PERMISOS.INHABILITAR_RUTA) && !ruta.esRegresoDeSedePropia
            const puedeInhabilitarSede = esOperadorSede && tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && esRegreso
            return (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {/* Solo una ida (nunca un regreso) puede recibir su propio regreso --
                        sin el `!esRegreso`, un regreso ya Completada (sin nada enlazado a
                        ÉL vía idRutaIda) volvía a cumplir `!ruta.rutaRegreso` y el ícono
                        reaparecía ofreciendo "programar el regreso del regreso": el backend
                        tampoco lo bloqueaba (validarRutaIda nunca chequeaba que la "ida" no
                        fuera ya un regreso) y el origen resuelto (destino de la ida) habría
                        quedado igual al destino fijo (Medellín) -- una ruta de longitud
                        cero. Corregido 2026-09-13.
                        Tampoco se ofrece si el destino de ESTA ida tiene su propio
                        operador_sede (`ruta.miDestinoTieneOperadorSede`, calculado en
                        rutaService.getAll) -- programar ese regreso es exclusivo de esa
                        sede (crearRegresoDesdeSede), ni el admin puede adelantársele. El
                        backend ya lo rechazaba (create() con idRutaIda), pero el ícono
                        seguía apareciendo como si el admin pudiera. Corregido 2026-09-13. */}
                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && ruta.estado === 'Completada' && !esRegreso && !ruta.rutaRegreso && !ruta.miDestinoTieneOperadorSede && (
                        <Tooltip title="Programar viaje de regreso">
                            <IconButton size="small" onClick={() => onProgramarRegreso(ruta)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <SyncAltOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* "Reutilizar ruta" (2026-09-13): repite el destino/paradas/convoy de
                        una ida ya Completada como punto de partida editable para una ruta
                        NUEVA e independiente -- no toca idRutaIda ni exige que esta ida
                        todavía no tenga su regreso programado (por eso no comparte el
                        `!ruta.rutaRegreso` de arriba). Nunca sobre un regreso: repetir un
                        regreso no aporta nada que su propia ida no cubra ya, y confundía
                        con "programar el regreso del regreso" (ver bug de arriba). */}
                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && ruta.estado === 'Completada' && !esRegreso && (
                        <Tooltip title="Reutilizar ruta">
                            <IconButton size="small" onClick={() => onReutilizarRuta(ruta)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* operador_sede: acción propia (WS4, "Sedes remotas") — una ida
                        Completada, sin regreso enlazado, cuyo convoy sigue en el
                        municipio de la sede del operador. Distinta del ícono de arriba
                        (ese abre el wizard completo, gateado por registrar_ruta; este
                        abre solo el modal chico de fecha/hora, gateado por
                        programar_regreso_sede). */}
                    {tienePermiso(PERMISOS.PROGRAMAR_REGRESO_SEDE) && ruta.estado === 'Completada' && !ruta.rutaRegreso
                        && sedeActual && (ruta.paresVehiculoConductor || []).some(
                            (p) => p?.conductor?.idDestinoActual === sedeActual.idDestino || p?.vehiculo?.idDestinoActual === sedeActual.idDestino
                        ) && (
                        <Tooltip title="Programar regreso">
                            <IconButton size="small" onClick={() => onProgramarRegresoSede(ruta)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <SyncAltOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => onConsultar(ruta)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {puedeEditarAdmin && (
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
                    {puedeEditarSede && (
                        ruta.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : !['Programada', 'Cancelada'].includes(ruta.estado) ? (
                            <Tooltip title="Solo se puede editar un regreso Programado o Cancelado">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar fecha/hora">
                                <IconButton size="small" onClick={() => onEditarHorarioSede(ruta)}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {(puedeInhabilitarAdmin || puedeInhabilitarSede) && (
                        <ToggleSwitch id={id} checked={ruta.habilitado !== false} onChange={() => onToggleHabilitado(id)} />
                    )}
                </Box>
            )
        },
    },
]

export default useRutaColumns
