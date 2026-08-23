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
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                    {r.origen || `#${r.idRuta}`}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                    {r.destino?.ciudad || '—'}
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

const ModalInhabilitarVehiculo = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [rutasInhabilitar, setRutasInhabilitar] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.id || !data.habilitadoActual) return
        setRutasInhabilitar({ data: [], loading: true })
        rutaService.getRutas({ idVehiculo: data.id, habilitado: 'true', limit: 100 })
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

    const modalCargando = rutasInhabilitar.loading
    const modalBloqueado = data.habilitadoActual && rutasInhabilitar.data.some(r => r.estado === 'En Ruta')
    const modalProgramadas = rutasInhabilitar.data.filter(r => r.estado === 'Programada')
    const enMantenimiento = data.estadoVehiculo === 'Mantenimiento'

    let titulo
    let subtitulo
    let children = null

    if (!data.habilitadoActual) {
        titulo = '¿Habilitar vehículo?'
        subtitulo = <>El vehículo <strong>{data.placa}</strong> volverá a estar activo en el sistema.</>
    } else if (modalCargando) {
        titulo = '¿Inhabilitar vehículo?'
        subtitulo = ''
        children = (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
            </Box>
        )
    } else if (modalBloqueado) {
        titulo = 'No se puede inhabilitar'
        subtitulo = <>No es posible inhabilitar el vehículo <strong>{data.placa}</strong> mientras esté en ruta.</>
        children = (
            <Box sx={{ mt: 0.5, width: '100%', textAlign: 'left' }}>
                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 0.5 }}>
                    Ruta activa que impide la inhabilitación
                </Typography>
                <RutasMiniTabla rutas={rutasInhabilitar.data.filter(r => r.estado === 'En Ruta')} theme={theme} />
            </Box>
        )
    } else if (enMantenimiento && modalProgramadas.length === 0) {
        titulo = '¿Inhabilitar vehículo?'
        subtitulo = <>El vehículo <strong>{data.placa}</strong> está actualmente en mantenimiento. Al inhabilitarlo dejará de estar disponible en el sistema.</>
    } else if (modalProgramadas.length > 0) {
        titulo = '¿Inhabilitar vehículo?'
        subtitulo = enMantenimiento
            ? <>El vehículo <strong>{data.placa}</strong> está en mantenimiento. Además tiene {modalProgramadas.length === 1 ? 'una ruta programada' : 'rutas programadas'} que {modalProgramadas.length === 1 ? 'necesitará ser reasignada' : 'necesitarán ser reasignadas'} a otro vehículo.</>
            : <>El vehículo <strong>{data.placa}</strong> tiene {modalProgramadas.length === 1 ? 'una ruta programada' : 'rutas programadas'} que {modalProgramadas.length === 1 ? 'necesitará ser reasignada' : 'necesitarán ser reasignadas'} a otro vehículo.</>
        children = (
            <Box sx={{ width: '100%', textAlign: 'left' }}>
                <RutasMiniTabla rutas={modalProgramadas} theme={theme} />
            </Box>
        )
    } else {
        titulo = '¿Inhabilitar vehículo?'
        subtitulo = <>El vehículo <strong>{data.placa}</strong> quedará inhabilitado en el sistema.</>
    }

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={handleExited}
            onConfirm={onConfirm}
            icono={!data.habilitadoActual
                ? <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={titulo}
            subtitulo={subtitulo}
            soloCerrar={data.habilitadoActual && modalBloqueado}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
            deshabilitarConfirmar={modalCargando}
        >
            {children}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarVehiculo
