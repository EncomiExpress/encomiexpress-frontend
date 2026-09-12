import { alpha } from '@mui/material/styles'
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import { formatFecha } from '../../../shared/utils/formatters.js'
import { getVentaEstadoDot, getEstadoPagoDot } from '../../../shared/utils/estadoColors.js'
import VentaEstadoDot from '../components/VentaEstadoDot.jsx'
import EstadoVentaCancelada from '../components/EstadoVentaCancelada.jsx'

const useVentaColumns = ({
    theme, debouncedBusqueda, tienePermiso, PERMISOS,
    onConsultar, onDescargarGuia, onEditar, onToggleHabilitado,
    onReactivar,
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
                    {venta.destinatario?.destino?.municipio || '—'}
                </Typography>
                {venta.estado === 'Programada' && venta.ruta && (venta.ruta.estado === 'Cancelada' || venta.ruta.habilitado === false) && (
                    // Una ruta inhabilitada normalmente ya no puede tener ventas Programada
                    // apuntándole (verificarDependenciasRuta lo bloquea al inhabilitar la
                    // ruta) — se cubre igual acá por consistencia con rutaSigueSirviendo()
                    // del backend (encomiendaService.js), no por un hueco activo conocido.
                    <Chip
                        label="Ruta no disponible · Reasignar"
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark, border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`, mt: 0.5 }}
                    />
                )}
                {venta.estado === 'Programada' && !venta.fechaEstimadaEntrega && (
                    // Ya no debería pasar en el flujo normal: al crear la venta se
                    // autocompleta con la llegada de la ruta, y al editar la fecha de la
                    // ruta rutaService.update() sincroniza el campo en vez de vaciarlo. Se
                    // deja como red de seguridad para ventas viejas o creadas directo por
                    // API sin ese campo.
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
                    label={venta.total !== undefined ? `$${Math.round(Number(venta.total)).toLocaleString('es-CO')}` : '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', borderRadius: '2px', height: 24 }}
                />
                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mt: 0.5 }}>
                    {venta.modalidadRecaudo || '—'}
                </Typography>
            </>
        ),
    },
    {
        key: 'estadoPago', label: 'Estado pago', width: 130, cellSx: { py: 1.5, minWidth: 130 },
        render: (venta) => {
            // Terminal (Pagada / Pago parcial / Sin pago): chip plano, sin selector
            // clickeable ni chevron — la confirmación manual de pago ya no existe,
            // el rollup lo calcula el backend solo (determinarEstadoPago).
            if (venta.estadoPago !== 'Pendiente') {
                const info = getEstadoPagoDot(venta.estadoPago)
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                        {info.type === 'circle' ? (
                            <Box sx={{
                                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                                backgroundColor: info.fill ? info.color : 'transparent',
                                border: `2px solid ${info.color}`,
                            }} />
                        ) : (
                            <Box sx={{
                                width: 14, height: 14, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0,
                                fontSize: info.char === '✓' ? '0.75rem' : '1rem',
                                fontWeight: 700, color: info.color, lineHeight: 1,
                            }}>
                                {info.char}
                            </Box>
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>
                            {info.label}
                        </Typography>
                    </Box>
                )
            }

            // 'Pendiente' (solo ocurre en Contraentrega en curso): contador "{X} de
            // {N} con pago definido" — X = pagado o Devuelto (cerrado sin cobro).
            // Mismo patrón que el contador de la columna "Estado" de arriba.
            const paquetes = venta.paquetes || []
            const total = paquetes.length
            const pagados = paquetes.filter(p => p.estadoPago === 'Pagado').length
            const sinPago = paquetes.filter(p => p.estado === 'Devuelto').length
            const definidos = pagados + sinPago
            const enCurso = total - definidos
            const info = getEstadoPagoDot('Pendiente')

            return (
                <Tooltip title={`${pagados} pagados · ${sinPago} sin pago · ${enCurso} en curso`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: `2px solid ${info.color}`, backgroundColor: 'transparent', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>
                            {`${definidos} de ${total} con pago definido`}
                        </Typography>
                    </Box>
                </Tooltip>
            )
        },
    },
    {
        key: 'estado', label: 'Estado', width: 155, cellSx: { py: 1.5, minWidth: 155 },
        render: (venta) => (
            venta.estado === 'En Ruta' ? (
                <Box sx={{ pl: 1 }}>
                    {(() => {
                        // FASE CONDUCTOR — mientras algún paquete siga "Por entregar", la
                        // venta se ve como una "En Ruta" normal (ese avance se sigue en la
                        // ruta, no acá).
                        // FASE DISTRIBUIDOR — ya ningún paquete "Por entregar" (todos en la
                        // sede): la persona de la sede hace la entrega final. Se muestra
                        // "N de M gestionados" (N = Entregado + Devuelto, es decir todo
                        // paquete que el distribuidor YA resolvió, sin importar si terminó
                        // entregado o no) con el desglose completo (entregados · no
                        // entregados · en sede) en el tooltip.
                        //
                        // Bug corregido (2026-09-07): antes el número mostraba solo los
                        // "Entregado" ("N de M entregados") — si el distribuidor marcaba un
                        // paquete como no entregado, el número seguía en 0 aunque sí hubiera
                        // actuado sobre él (esa parte solo se veía en el tooltip). Confundía:
                        // parecía que nada había pasado todavía.
                        const paquetes = venta.paquetes || []
                        const total = paquetes.length
                        const porEntregar = paquetes.filter(p => p.estado === 'Por entregar').length

                        if (porEntregar > 0) {
                            return <VentaEstadoDot estado="En Ruta" />
                        }

                        const enSede = paquetes.filter(p => p.estado === 'En sede de destino').length
                        const entregados = paquetes.filter(p => p.estado === 'Entregado').length
                        const noEntregados = paquetes.filter(p => p.estado === 'Devuelto').length
                        const gestionados = entregados + noEntregados
                        const info = getVentaEstadoDot('En Ruta')

                        return (
                            <Tooltip title={`${entregados} entregados · ${noEntregados} no entregados · ${enSede} en sede`}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: info.color }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>
                                        {`${gestionados} de ${total} gestionados`}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )
                    })()}
                </Box>
            ) : venta.estado === 'Cancelada' ? (
                // El menú de reactivar (PATCH /encomiendas/:id/reactivar) exige
                // actualizar_venta en el backend — sin el permiso, se muestra el
                // chip plano en vez del selector clickeable que no llevaría a nada.
                tienePermiso(PERMISOS.ACTUALIZAR_VENTA) ? (
                    <EstadoVentaCancelada venta={venta} onReactivar={onReactivar} />
                ) : (
                    <Box sx={{ pl: 1 }}><VentaEstadoDot estado="Cancelada" /></Box>
                )
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
                {!tienePermiso(PERMISOS.ACTUALIZAR_VENTA) ? null : venta.habilitado === false ? (
                    <Tooltip title="Habilita el registro para poder editarlo">
                        <span>
                            <IconButton size="small" disabled>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                ) : !['Programada', 'Cancelada'].includes(venta.estado) ? (
                    <Tooltip title={
                        venta.estado === 'En Ruta' ? 'Esta venta ya está en tránsito: no se puede editar'
                            : venta.estado === 'Entregada' ? 'Esta venta ya fue entregada: no se puede editar'
                                : 'Esta venta ya se cerró con novedades: no se puede editar'
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
