import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import { isVencido, formatFecha, capitalizarPrimeraLetra, formatearMoneda } from '../../../shared/utils/formatters.js'
import { getUbicacionCaption } from '../../../shared/utils/estadoColors.js'

const vencimientoChipSx = (theme, vencido) => vencido
    ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
    : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }

const useVehiculoColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado, onAbrirMenuEstado }) => [
    { key: 'placa', label: 'Placa', sortField: 'placa', render: (transporte) => <PlacaDisplay placa={transporte.placa} theme={theme} /> },
    {
        key: 'marcaModelo', label: 'Marca / Modelo', cellSx: { py: 1.5 },
        render: (transporte) => (
            <>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {capitalizarPrimeraLetra(transporte.marca)}
                </Typography>
                <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                    {transporte.modelo}
                </Typography>
            </>
        ),
    },
    {
        key: 'tipo', label: 'Tipo / Capacidad', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Chip label={transporte.tipo || '—'} size="small" sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }} />
                <Typography variant="caption" color={theme.palette.text.secondary} noWrap sx={{ mt: 0.5 }}>
                    {transporte.capacidad ? `${formatearMoneda(transporte.capacidad)} kg` : '—'}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'propietario', label: 'Propietario', cellSx: { py: 1.5 },
        render: (transporte) => transporte.propietario ? `${transporte.propietario.nombre} ${transporte.propietario.apellido}` : '—',
    },
    {
        key: 'soat', label: 'SOAT', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip
                label={transporte.vencimientoSOAT ? formatFecha(transporte.vencimientoSOAT) : 'N/A'}
                size="small"
                variant={isVencido(transporte.vencimientoSOAT) ? 'filled' : 'outlined'}
                sx={vencimientoChipSx(theme, isVencido(transporte.vencimientoSOAT))}
            />
        ),
    },
    {
        key: 'revTecnica', label: 'Rev. Técnica', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip
                label={transporte.vencimientoRevisionTecnica ? formatFecha(transporte.vencimientoRevisionTecnica) : 'N/A'}
                size="small"
                variant={isVencido(transporte.vencimientoRevisionTecnica) ? 'filled' : 'outlined'}
                sx={vencimientoChipSx(theme, isVencido(transporte.vencimientoRevisionTecnica))}
            />
        ),
    },
    {
        key: 'segTerceros', label: 'Seg. Terceros', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip
                label={transporte.vencimientoSeguroTerceros ? formatFecha(transporte.vencimientoSeguroTerceros) : 'N/A'}
                size="small"
                variant={isVencido(transporte.vencimientoSeguroTerceros) ? 'filled' : 'outlined'}
                sx={vencimientoChipSx(theme, isVencido(transporte.vencimientoSeguroTerceros))}
            />
        ),
    },
    {
        key: 'estado', label: 'Estado', cellSx: { py: 1.5 },
        render: (transporte) => {
            const ubic = getUbicacionCaption(transporte.estadoEfectivo, transporte.destinoActual)
            const caption = ubic && (
                <Typography variant="caption" sx={{ display: 'block', ml: 1, mt: 0.25, lineHeight: 1.2, color: ubic.tone === 'warn' ? '#D97706' : theme.palette.text.secondary }}>
                    {ubic.text}
                </Typography>
            )
            const colorPorEstado = { 'En Ruta': '#3B82F6', 'Disponible': '#10b981', 'Mantenimiento': '#ea580c' }
            const color = colorPorEstado[transporte.estadoEfectivo] || '#9CA3AF'
            const dotSx = transporte.estadoEfectivo === 'Disponible'
                ? { backgroundColor: 'transparent', border: `2px solid ${color}` }
                : { backgroundColor: color, border: `2px solid ${color}` }
            // "Fuera de base": Disponible, pero quedó en otro municipio al terminar/
            // cancelar una ruta que no volvió a Medellín (destinoActual). Mantenimiento
            // solo tiene sentido en la base (ahí está el taller) -- se oculta el menú
            // entero para que no se pueda pasar a Mantenimiento sin antes volver, igual
            // que ya pasa con "En Ruta".
            const fueraDeBaseDisponible = transporte.estadoEfectivo === 'Disponible' && !!transporte.destinoActual
            const bloqueado = transporte.estadoEfectivo === 'En Ruta' || fueraDeBaseDisponible

            return bloqueado ? (
                <Box sx={{ px: 1, py: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, ...dotSx }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color }}>{transporte.estadoEfectivo}</Typography>
                    </Box>
                    {caption}
                </Box>
            ) : (
                <Box>
                    <Box
                        onClick={(e) => onAbrirMenuEstado(e.currentTarget, transporte.idVehiculo, transporte.estadoEfectivo)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
                    >
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, ...dotSx }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color }}>
                            {transporte.estadoEfectivo}
                        </Typography>
                        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
                    </Box>
                    {caption}
                </Box>
            )
        },
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (transporte) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_VEHICULO) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(transporte)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_VEHICULO) && (
                    transporte.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEditar(transporte)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_VEHICULO) && (
                    <ToggleSwitch id={transporte.idVehiculo} checked={transporte.habilitado !== false} onChange={() => onToggleHabilitado(transporte.idVehiculo, transporte.habilitado, transporte.estadoEfectivo, transporte.placa)} />
                )}
            </Box>
        ),
    },
]

export default useVehiculoColumns
