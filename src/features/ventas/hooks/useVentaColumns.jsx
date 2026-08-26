import { alpha } from '@mui/material/styles'
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import { formatFecha } from '../../../shared/utils/formatters.js'
import { getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'
import VentaEstadoDot from '../components/VentaEstadoDot.jsx'

const useVentaColumns = ({
    theme, debouncedBusqueda, tienePermiso, PERMISOS,
    onConsultar, onDescargarGuia, onEditar, onToggleHabilitado,
    onAbrirMenuPago, onAbrirMenuEstado,
}) => [
    {
        key: 'guia', label: 'Guía', sortField: 'numeroGuia', cellSx: { py: 1.5 },
        render: (venta) => {
            const q = debouncedBusqueda.trim().toLowerCase()
            const paquetes = venta.paquetes || []
            // Si la búsqueda coincide con la guía de un paquete que NO es el primero,
            // se muestra esa — para no contradecir lo que la usuaria buscó.
            const guiaVisible = (q && paquetes.find(p => p.numeroGuia?.toLowerCase().includes(q))?.numeroGuia)
                || paquetes[0]?.numeroGuia
                || '—'
            const adicionales = Math.max(0, paquetes.length - 1)
            return (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                            {guiaVisible}
                        </Typography>
                        {adicionales > 0 && (
                            <Chip
                                label={`+${adicionales} ${adicionales === 1 ? 'paquete' : 'paquetes'}`}
                                size="small"
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color={theme.palette.text.secondary}>
                        {formatFecha(venta.fechaRegistro)}
                    </Typography>
                </>
            )
        },
    },
    {
        key: 'remitenteDestinatario', label: 'Remitente / Destinatario', cellSx: { py: 1.5 },
        render: (venta) => (
            <>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {venta.cliente?.nombre} {venta.cliente?.apellido}
                </Typography>
                <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                    → {venta.destinatario?.nombreDestinatario || '—'}
                </Typography>
            </>
        ),
    },
    {
        key: 'destino', label: 'Destino', cellSx: { py: 1.5 },
        render: (venta) => (
            <>
                <Typography variant="body2" color={theme.palette.text.primary}>
                    {venta.ruta?.destino?.ciudad || '—'}
                </Typography>
                {venta.estado === 'Programada' && venta.ruta?.estado === 'Cancelada' && (
                    <Chip
                        label="Ruta cancelada · Reasignar"
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark, border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`, mt: 0.5 }}
                    />
                )}
                {venta.estado === 'Programada' && !venta.fechaEstimadaEntrega && (
                    // Queda así cuando alguien mueve la fecha de la ruta y esta venta
                    // deja de caber en el rango nuevo — ver rutaService.update() en el
                    // backend, que vacía el campo en vez de bloquear el cambio de ruta.
                    <Chip
                        label="Falta fecha de entrega"
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark, border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`, mt: 0.5 }}
                    />
                )}
            </>
        ),
    },
    {
        key: 'total', label: 'Total', cellSx: { py: 1.5 },
        render: (venta) => (
            <>
                <Chip
                    label={venta.total !== undefined ? `$${Number(venta.total).toLocaleString('es-CO')}` : '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', borderRadius: '2px', height: 24 }}
                />
                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mt: 0.5 }}>
                    {venta.metodoPago || '—'}
                </Typography>
            </>
        ),
    },
    {
        key: 'estadoPago', label: 'Estado pago', width: 130, cellSx: { py: 1.5, minWidth: 130 },
        render: (venta) => (
            (venta.estadoPago === 'Pagado' || venta.estado === 'Cancelada') ? (
                venta.estadoPago === 'Pagado' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Pagado</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #D97706', backgroundColor: 'transparent', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#D97706' }}>Pendiente</Typography>
                    </Box>
                )
            ) : (venta.metodoPago === 'Contraentrega' && venta.estado !== 'Entregada' && venta.estado !== 'Completada con novedades') ? (
                <Tooltip title="Es Contraentrega: el pago solo se puede confirmar cuando la venta sea entregada">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1, opacity: 0.55 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #D97706', backgroundColor: 'transparent', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#D97706' }}>Pendiente</Typography>
                    </Box>
                </Tooltip>
            ) : (
                <Box
                    onClick={(e) => { e.stopPropagation(); onAbrirMenuPago(e.currentTarget, venta.idEncomiendaVenta) }}
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.3, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                >
                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #D97706', backgroundColor: 'transparent', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#D97706' }}>Pendiente</Typography>
                    <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 13, color: theme.palette.text.secondary, ml: 0.25 }} />
                </Box>
            )
        ),
    },
    {
        key: 'estado', label: 'Estado', width: 155, cellSx: { py: 1.5, minWidth: 155 },
        render: (venta) => (
            venta.estado === 'Programada' ? (
                <Box
                    onClick={(e) => { e.stopPropagation(); onAbrirMenuEstado(e.currentTarget, venta.idEncomiendaVenta) }}
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.3, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                >
                    <VentaEstadoDot estado="Programada" />
                    <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 13, color: theme.palette.text.secondary }} />
                </Box>
            ) : venta.estado === 'En Ruta' ? (
                <Box sx={{ pl: 1 }}>
                    {(() => {
                        const paquetes = venta.paquetes || []
                        const entregados = paquetes.filter(p => p.estado === 'Entregado').length
                        const devueltos = paquetes.filter(p => p.estado === 'Devuelto').length
                        const pendientes = paquetes.length - entregados - devueltos
                        const info = getVentaEstadoDot('En Ruta')
                        return (
                            <Tooltip title={`${entregados} entregados · ${devueltos} devueltos · ${pendientes} pendientes`}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: info.color }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>
                                        {`${entregados} de ${paquetes.length} entregados`}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )
                    })()}
                </Box>
            ) : (
                <Box sx={{ pl: 1 }}><VentaEstadoDot estado={venta.estado} /></Box>
            )
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (venta) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Ver detalle">
                    <IconButton size="small" onClick={() => onConsultar(venta)}
                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Descargar guía">
                    <IconButton size="small" onClick={() => onDescargarGuia(venta)}
                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                {venta.habilitado === false ? (
                    <Tooltip title="Habilita el registro para poder editarlo">
                        <span>
                            <IconButton size="small" disabled>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                ) : venta.estado !== 'Programada' ? (
                    <Tooltip title={
                        venta.estado === 'En Ruta' ? 'Esta venta ya está en tránsito: no se puede editar'
                            : venta.estado === 'Entregada' ? 'Esta venta ya fue entregada: no se puede editar'
                                : venta.estado === 'Completada con novedades' ? 'Esta venta ya se cerró con novedades: no se puede editar'
                                    : 'Esta venta fue cancelada: no se puede editar'
                    }>
                        <span>
                            <IconButton size="small" disabled>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip title="Editar">
                        <IconButton size="small"
                            onClick={() => onEditar(venta)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.INHABILITAR_VENTA) && (
                    <ToggleSwitch id={venta.idEncomiendaVenta} checked={venta.habilitado} onChange={() => onToggleHabilitado(venta)} />
                )}
            </Box>
        ),
    },
]

export default useVentaColumns
