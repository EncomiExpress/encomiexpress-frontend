import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, CircularProgress,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as rutaService from '../rutas/services/rutaService.js'
import { getEstadoColorRuta } from '../../shared/utils/estadoColors.js'
import ConfirmToggleDialog from '../../shared/components/ConfirmToggleDialog.jsx'

const RutasMiniTabla = ({ rutas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mt: 1.5, width: '100%' }}>
        <TableContainer sx={{ maxHeight: 140 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Ruta</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Fecha salida</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rutas.map(r => {
                        const { color } = getEstadoColorRuta(r.estado)
                        const esProgramada = r.estado === 'Programada'
                        return (
                            <TableRow key={r.idRuta}
                                onClick={() => window.open(`/transporte/rutas?highlight=${r.idRuta}`, '_blank')}
                                sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                    {r.origen || `#${r.idRuta}`}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                    {r.fechaSalida ? new Date(r.fechaSalida + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </TableCell>
                                <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: esProgramada ? 'transparent' : color, border: `2px solid ${color}` }} />
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{r.estado}</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)

const ModalInhabilitarDestino = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [rutasInhabilitar, setRutasInhabilitar] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.id || !data.habilitadoActual) return
        setRutasInhabilitar({ data: [], loading: true })
        rutaService.getRutas({ idDestino: data.id, habilitado: 'true', limit: 100 })
            .then(res => {
                const activas = (res?.data || []).filter(r => r.estado === 'Programada' || r.estado === 'En Ruta')
                setRutasInhabilitar({ data: activas, loading: false })
            })
            .catch(() => setRutasInhabilitar({ data: [], loading: false }))
    }, [open, data.id, data.habilitadoActual])

    const handleExited = () => {
        setRutasInhabilitar({ data: [], loading: false })
        onExited?.()
    }

    const bloqueado = data.habilitadoActual && rutasInhabilitar.data.length > 0

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={handleExited}
            onConfirm={onConfirm}
            icono={data.habilitadoActual
                ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={data.habilitadoActual
                ? bloqueado ? 'No se puede inhabilitar' : rutasInhabilitar.loading ? 'Inhabilitar destino' : '¿Inhabilitar destino?'
                : '¿Habilitar destino?'}
            subtitulo={data.habilitadoActual
                ? bloqueado
                    ? <>El destino <strong>{data.ciudad}</strong> tiene {rutasInhabilitar.data.length === 1 ? 'una ruta activa' : 'rutas activas'} que {rutasInhabilitar.data.length === 1 ? 'debe completarse o cancelarse' : 'deben completarse o cancelarse'} antes de inhabilitar el destino.</>
                    : <>El destino <strong>{data.ciudad}</strong> quedará inhabilitado en el sistema.</>
                : <>El destino <strong>{data.ciudad}</strong> volverá a estar activo en el sistema.</>}
            soloCerrar={bloqueado}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
            deshabilitarConfirmar={rutasInhabilitar.loading}
        >
            {rutasInhabilitar.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                    <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                </Box>
            ) : bloqueado && (
                <Box sx={{ mt: 1, textAlign: 'left' }}>
                    <RutasMiniTabla rutas={rutasInhabilitar.data} theme={theme} />
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarDestino
