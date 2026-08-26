import { useTheme } from '@mui/material/styles'
import { Box, Typography, Paper } from '@mui/material'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { getRutaEstadoDot } from '../../../shared/utils/estadoColors'
import { getGuiaPrincipal } from '../../../shared/utils/formatters'
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
    const base = ruta.origen ? `${ruta.origen} → ${ruta.destino?.ciudad || 'Sin destino'}` : '—'
    const placa = venta?.paquetes?.[0]?.asignacion?.vehiculo?.placa
    return placa ? `${base} · ${placa}` : base
}

const ModalInhabilitarVenta = ({ open, venta, onClose, onExited, onConfirm }) => {
    const theme = useTheme()

    const habilitadoActual = venta?.habilitado === true
    const bloqueado = habilitadoActual && venta?.estado !== 'Entregada' && venta?.estado !== 'Completada con novedades' && venta?.estado !== 'Cancelada'
    const guia = getGuiaPrincipal(venta) || '—'
    const ruta = venta?.ruta || null

    const titulo = !habilitadoActual
        ? '¿Habilitar venta?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : '¿Inhabilitar venta?'

    const subtexto = !habilitadoActual
        ? <>La guía <strong>{guia}</strong> volverá a estar activa en el sistema.</>
        : bloqueado
            ? venta.estado === 'Programada'
                ? <>La guía <strong>{guia}</strong> aún no ha iniciado su despacho.</>
                : <>La guía <strong>{guia}</strong> está siendo transportada actualmente.</>
            : <>La guía <strong>{guia}</strong> quedará inhabilitada en el sistema.</>

    const rutaLabel = bloqueado && ruta
        ? venta.estado === 'En Ruta'
            ? 'La ruta en curso que impide la inhabilitación'
            : 'La ruta asociada a esta venta'
        : null

    // Los paquetes no tienen su propio "habilitado" — dependen del de la venta (ver
    // encomiendaService.getPaquetesDevueltos). Si esta venta tiene algún paquete
    // Devuelto, inhabilitarla también los va a mostrar como inhabilitados en el
    // listado de Paquetes devueltos — se avisa antes de confirmar, no después.
    const paquetesDevueltos = habilitadoActual ? (venta?.paquetes || []).filter(p => p.estado === 'Devuelto') : []
    const tieneDevueltos = paquetesDevueltos.length > 0

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
            {!bloqueado && tieneDevueltos && (
                <Box sx={{ mt: 2, mx: 0.5, p: 1.5, borderRadius: 2, textAlign: 'left', backgroundColor: `${theme.palette.warning.main}14`, border: `1px solid ${theme.palette.warning.main}44` }}>
                    <Typography variant="caption" sx={{ color: theme.palette.warning.dark, lineHeight: 1.5 }}>
                        Esta venta tiene {paquetesDevueltos.length === 1 ? '1 paquete devuelto' : `${paquetesDevueltos.length} paquetes devueltos`}. Al inhabilitarla, también se mostrará{paquetesDevueltos.length === 1 ? '' : 'n'} como inhabilitado{paquetesDevueltos.length === 1 ? '' : 's'} en el listado de Paquetes devueltos.
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
                        Solo se puede inhabilitar una venta cuando esté Entregada, Completada con novedades o Cancelada.
                    </Typography>
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarVenta
