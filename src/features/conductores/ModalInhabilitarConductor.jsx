import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, CircularProgress,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as rutaService from '../rutas/services/rutaService.js'
import * as anticipoService from '../anticipos/services/anticipoService.js'
import { getEstadoColorRuta, getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'
import ConfirmToggleDialog from '../../shared/components/ConfirmToggleDialog.jsx'

const ESTADOS_BLOQUEO_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente']

const RutasTabla = ({ rutas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 120 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Ruta</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Destino</TableCell>
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
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>{r.origen || `#${r.idRuta}`}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>{r.destino?.ciudad || '—'}</TableCell>
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

const ModalInhabilitarConductor = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [rutasDetalle, setRutasDetalle] = useState({ data: [], loading: false })
    const [anticiposDetalle, setAnticiposDetalle] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.idConductor || !data.habilitadoActual) return
        setRutasDetalle({ data: [], loading: true })
        setAnticiposDetalle({ data: [], loading: true })
        Promise.all([
            rutaService.getRutas({ idConductor: data.idConductor, habilitado: 'true', limit: 100 }),
            anticipoService.getAnticipos(undefined, { idConductor: data.idConductor, habilitado: 'true', limit: 100 }),
        ])
            .then(([rutasRes, anticiposRes]) => {
                setRutasDetalle({ data: rutasRes?.data || [], loading: false })
                setAnticiposDetalle({ data: anticiposRes?.data || [], loading: false })
            })
            .catch(() => {
                setRutasDetalle({ data: [], loading: false })
                setAnticiposDetalle({ data: [], loading: false })
            })
    }, [open, data.idConductor, data.habilitadoActual])

    const handleExited = () => {
        setRutasDetalle({ data: [], loading: false })
        setAnticiposDetalle({ data: [], loading: false })
        onExited?.()
    }

    const rutasEnCurso = rutasDetalle.data.filter(r => r.estado === 'En Ruta')
    const rutasProgramadas = rutasDetalle.data.filter(r => r.estado === 'Programada')
    const anticiposBloqueo = anticiposDetalle.data.filter(a => ESTADOS_BLOQUEO_ANTICIPO.includes(a.estado))
    const cargando = rutasDetalle.loading || anticiposDetalle.loading
    const bloqueado = data.habilitadoActual && (rutasEnCurso.length > 0 || anticiposBloqueo.length > 0)

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
                ? bloqueado ? 'No se puede inhabilitar' : cargando ? 'Inhabilitar conductor' : '¿Inhabilitar conductor?'
                : '¿Habilitar conductor?'}
            subtitulo={data.habilitadoActual
                ? rutasEnCurso.length > 0 && anticiposBloqueo.length > 0
                    ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras esté en ruta y tenga {anticiposBloqueo.length === 1 ? 'un anticipo pendiente' : 'anticipos pendientes'} de legalización.</>
                    : rutasEnCurso.length > 0
                        ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras esté en ruta.</>
                        : anticiposBloqueo.length > 0
                            ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras tenga {anticiposBloqueo.length === 1 ? 'un anticipo pendiente' : 'anticipos pendientes'} de legalización.</>
                            : <><strong>{data.nombreCompleto}</strong> quedará inhabilitado en el sistema.</>
                : <><strong>{data.nombreCompleto}</strong> volverá a estar activo en el sistema.</>}
            soloCerrar={bloqueado}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
            deshabilitarConfirmar={cargando}
        >
            {cargando ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                    <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                </Box>
            ) : (
                <>
                    {rutasEnCurso.length > 0 && (
                        <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                {rutasEnCurso.length === 1 ? 'La ruta En Ruta que impide la inhabilitación' : 'Las rutas En Ruta que impiden la inhabilitación'}
                            </Typography>
                            <RutasTabla rutas={rutasEnCurso} theme={theme} />
                        </Box>
                    )}
                    {anticiposBloqueo.length > 0 && (
                        <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                {anticiposBloqueo.length === 1 ? 'Anticipo pendiente que impide la inhabilitación' : 'Anticipos pendientes que impiden la inhabilitación'}
                            </Typography>
                            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                <TableContainer sx={{ maxHeight: 120 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Fecha entrega</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Valor</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {anticiposBloqueo.map(a => {
                                                const dot = getAnticipoEstadoDot(a.estado)
                                                return (
                                                    <TableRow key={a.idAnticipoExcedente}
                                                        onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                                                        sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                                        <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                                            {a.fechaEntrega ? new Date(a.fechaEntrega + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem', py: 0.75, textAlign: 'right' }}>
                                                            ${Number(a.valorAnticipo).toLocaleString('es-CO')}
                                                        </TableCell>
                                                        <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                                                {dot.type === 'circle'
                                                                    ? <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                                    : <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>{dot.char}</Box>
                                                                }
                                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    )}
                    {!bloqueado && rutasProgramadas.length > 0 && (
                        <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                {rutasProgramadas.length === 1 ? 'Ruta programada que necesitará ser reasignada a otro conductor' : 'Rutas programadas que necesitarán ser reasignadas a otro conductor'}
                            </Typography>
                            <RutasTabla rutas={rutasProgramadas} theme={theme} />
                        </Box>
                    )}
                </>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarConductor
