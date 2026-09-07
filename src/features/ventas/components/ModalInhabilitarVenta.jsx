import { useTheme } from '@mui/material/styles'
import { Box, Typography, Paper } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { getRutaEstadoDot } from '../../../shared/utils/estadoColors'
import { getGuiaPrincipal } from '../../../shared/utils/formatters'
import { sumarDias } from '../../../shared/utils/horarioLaboral.js'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'

const renderDot = (dot) => {
    if (dot.type === 'circle') {
        return (
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
        )
    }
    return (
        <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>
            {dot.char}
        </Box>
    )
}

// La ruta ya no tiene "el" vehículo (puede repartirse entre varios) — se usa el del
// primer paquete de la venta como referencia rápida, igual que hace la guía principal.
const getRutaLabel = (ruta, venta) => {
    if (!ruta) return '—'
    const base = ruta.origen ? `${ruta.origen} → ${ruta.destino?.municipio || 'Sin destino'}` : '—'
    const placa = venta?.paquetes?.[0]?.asignacion?.vehiculo?.placa
    return placa ? `${base} · ${placa}` : base
}

const ModalInhabilitarVenta = ({ open, venta, onClose, onExited, onConfirm }) => {
    const theme = useTheme()

    const habilitadoActual = venta?.habilitado === true
    // Solo bloquea inhabilitar una venta "En Ruta" (paquetes físicamente en tránsito
    // ahora mismo) — ver LOGICA.md, "Ventas — Cancelada e inhabilitar/habilitar".
    const bloqueado = habilitadoActual && venta?.estado === 'En Ruta'
    const guia = getGuiaPrincipal(venta) || '—'
    const ruta = venta?.ruta || null

    // Si se va a habilitar una venta Programada, revisa si al reactivarla la ruta ya
    // no sirve (salió, se completó, se canceló) o si la fecha estimada de entrega va a
    // necesitar corregirse — mismo cálculo que hace encomiendaService.toggleHabilitado(),
    // duplicado acá para avisar ANTES de confirmar (ver LOGICA.md).
    const motivoHabilitar = (!habilitadoActual && venta?.estado === 'Programada')
        ? (!ruta || ruta.estado !== 'Programada' || ruta.habilitado === false)
            ? 'ruta'
            : (() => {
                const minima = ruta.fechaLlegadaEstimada || (ruta.fechaSalida ? sumarDias(ruta.fechaSalida, 1) : null)
                return (!venta.fechaEstimadaEntrega || (minima && venta.fechaEstimadaEntrega < minima)) ? 'fecha' : null
            })()
        : null

    const titulo = !habilitadoActual
        ? '¿Habilitar venta?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : '¿Inhabilitar venta?'

    const subtexto = !habilitadoActual
        ? <>La guía <strong>{guia}</strong> volverá a estar activa en el sistema.</>
        : bloqueado
            ? <>La guía <strong>{guia}</strong> está siendo transportada actualmente.</>
            : <>La guía <strong>{guia}</strong> quedará inhabilitada en el sistema.</>

    const rutaLabel = bloqueado && ruta ? 'La ruta en curso que impide la inhabilitación' : null

    // Los paquetes no tienen su propio "habilitado" — dependen del de la venta (ver
    // encomiendaService.getPaquetesDevueltos). Si esta venta tiene algún paquete
    // no entregado (valor interno 'Devuelto'), inhabilitarla también los va a
    // mostrar como inhabilitados en "Paquetes no entregados" — se avisa antes.
    const paquetesNoEntregados = habilitadoActual ? (venta?.paquetes || []).filter(p => p.estado === 'Devuelto') : []
    const tieneNoEntregados = paquetesNoEntregados.length > 0

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={onExited}
            onConfirm={onConfirm}
            icono={habilitadoActual
                ? <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={titulo}
            subtitulo={subtexto}
            soloCerrar={bloqueado}
            textoConfirmar={habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
        >
            {!bloqueado && tieneNoEntregados && (
                <Box sx={{ mt: 2, mx: 0.5, p: 1.5, borderRadius: 2, textAlign: 'left', backgroundColor: `${theme.palette.warning.main}14`, border: `1px solid ${theme.palette.warning.main}44` }}>
                    <Typography variant="caption" sx={{ color: theme.palette.warning.dark, lineHeight: 1.5 }}>
                        Esta venta tiene {paquetesNoEntregados.length === 1 ? '1 paquete no entregado' : `${paquetesNoEntregados.length} paquetes no entregados`}. Al inhabilitarla, también se mostrará{paquetesNoEntregados.length === 1 ? '' : 'n'} como inhabilitado{paquetesNoEntregados.length === 1 ? '' : 's'} en el listado de Paquetes no entregados.
                    </Typography>
                </Box>
            )}

            {motivoHabilitar && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 2, mx: 0.5, color: theme.palette.text.secondary }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18, mt: '1px', flexShrink: 0 }} />
                    <Typography variant="body2">
                        {motivoHabilitar === 'ruta'
                            ? 'Su ruta ya no está disponible (salió, se completó o se canceló), así que quedará Cancelada.'
                            : 'Su fecha estimada de entrega quedó desactualizada mientras estaba inhabilitada — se corrige sola a la mínima vigente de su ruta.'}
                    </Typography>
                </Box>
            )}

            {bloqueado && (
                <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                    {ruta ? (() => {
                        const dot = getRutaEstadoDot(ruta.estado)
                        return (
                            <>
                                {rutaLabel && (
                                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                        {rutaLabel}
                                    </Typography>
                                )}
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <Box
                                        onClick={() => window.open(`/transporte/rutas?highlight=${ruta.idRuta}`, '_blank')}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                                    >
                                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                            {getRutaLabel(ruta, venta)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {renderDot(dot)}
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>
                                                {dot.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </>
                        )
                    })() : (() => {
                        const dot = getRutaEstadoDot(venta?.estado)
                        return (
                            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{guia}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        {renderDot(dot)}
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        )
                    })()}
                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mt: 1, display: 'block' }}>
                        No se puede inhabilitar una venta que está en tránsito.
                    </Typography>
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarVenta
