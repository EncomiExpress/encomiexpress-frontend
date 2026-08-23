import { useTheme } from '@mui/material/styles'
import { Box, Typography, Paper } from '@mui/material'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { getAnticipoEstadoDot, getRutaEstadoDot } from '../../shared/utils/estadoColors'
import ConfirmToggleDialog from '../../shared/components/ConfirmToggleDialog.jsx'

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

const getRutaLabel = (ruta) => {
    if (!ruta) return '—'
    const placa = ruta.vehiculo?.placa
    const base = ruta.origen ? `${ruta.origen} → ${ruta.destino?.ciudad || 'Sin destino'}` : '—'
    return placa ? `${base} · ${placa}` : base
}

const ModalInhabilitarAnticipo = ({ open, anticipo, onClose, onExited, onConfirm }) => {
    const theme = useTheme()

    const habilitadoActual = anticipo?.habilitado === true
    const bloqueado = habilitadoActual && anticipo?.estado !== 'Completado'
    const ruta = anticipo?.ruta || null

    const nombreConductor = anticipo?.conductor?.usuario
        ? `${anticipo.conductor.usuario.nombre} ${anticipo.conductor.usuario.apellido}`
        : 'el conductor'

    const titulo = !habilitadoActual
        ? '¿Habilitar anticipo?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : '¿Inhabilitar anticipo?'

    const subtexto = !habilitadoActual
        ? <>El anticipo de <strong>{nombreConductor}</strong> volverá a estar activo.</>
        : bloqueado
            ? anticipo.estado === 'En Legalización'
                ? <><strong>{nombreConductor}</strong> aún no ha registrado los gastos del anticipo.</>
                : anticipo.estado === 'Excedente pendiente'
                    ? (parseFloat(anticipo.excedente) < 0
                        ? <>Hay un faltante pendiente de reponerle al conductor.</>
                        : <>El conductor tiene un excedente pendiente de devolución.</>)
                    : <>El anticipo aún no ha sido completado.</>
            : <>El anticipo de <strong>{nombreConductor}</strong> quedará inhabilitado.</>

    const rutaLabel = bloqueado && ruta
        ? anticipo.estado === 'En Legalización'
            ? 'La ruta en curso que impide la inhabilitación'
            : 'La ruta asociada a este anticipo'
        : null

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
                                            {getRutaLabel(ruta)}
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
                        const dot = getAnticipoEstadoDot(anticipo.estado)
                        return (
                            <>
                                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                    Estado actual del anticipo
                                </Typography>
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
                                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                            {nombreConductor}
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
                    })()}
                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mt: 1, display: 'block' }}>
                        Solo se puede inhabilitar un anticipo cuando esté Completado.
                    </Typography>
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarAnticipo
