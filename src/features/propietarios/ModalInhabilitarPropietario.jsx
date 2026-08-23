import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, CircularProgress,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as vehiculoService from '../vehiculos/services/vehiculoService.js'
import ConfirmToggleDialog from '../../shared/components/ConfirmToggleDialog.jsx'

const ModalInhabilitarPropietario = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [vehiculosDetalle, setVehiculosDetalle] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.idPropietario || !data.habilitadoActual) return
        setVehiculosDetalle({ data: [], loading: true })
        vehiculoService.getVehiculos(undefined, { idPropietario: data.idPropietario, habilitado: 'true', limit: 100 })
            .then(res => setVehiculosDetalle({ data: res?.data || [], loading: false }))
            .catch(() => setVehiculosDetalle({ data: [], loading: false }))
    }, [open, data.idPropietario, data.habilitadoActual])

    const handleExited = () => {
        setVehiculosDetalle({ data: [], loading: false })
        onExited?.()
    }

    const bloqueado = data.habilitadoActual && vehiculosDetalle.data.length > 0

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
                ? bloqueado ? 'No se puede inhabilitar' : vehiculosDetalle.loading ? 'Inhabilitar propietario' : '¿Inhabilitar propietario?'
                : '¿Habilitar propietario?'}
            subtitulo={data.habilitadoActual
                ? bloqueado
                    ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras tenga vehículos activos asociados.</>
                    : <><strong>{data.nombreCompleto}</strong> quedará inhabilitado en el sistema.</>
                : <><strong>{data.nombreCompleto}</strong> volverá a estar activo en el sistema.</>}
            soloCerrar={bloqueado}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
            deshabilitarConfirmar={vehiculosDetalle.loading}
        >
            {vehiculosDetalle.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                    <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                </Box>
            ) : vehiculosDetalle.data.length > 0 && (
                <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                        Vehículos activos que impiden la inhabilitación
                    </Typography>
                    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 120 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Placa</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Marca / Modelo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vehiculosDetalle.data.map(v => (
                                        <TableRow key={v.idVehiculo}
                                            onClick={() => window.open(`/vehiculos/listar?highlight=${v.idVehiculo}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>{v.placa}</TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                                {[v.marca, v.modelo].filter(Boolean).join(' ') || '—'}
                                            </TableCell>
                                            <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                                    <Box sx={{
                                                        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                                                        ...(v.estado === 'En Ruta'
                                                            ? { backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }
                                                            : v.estado === 'Mantenimiento'
                                                                ? { backgroundColor: '#ea580c', border: '2px solid #ea580c' }
                                                                : { backgroundColor: 'transparent', border: '2px solid #10b981' })
                                                    }} />
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '0.8rem', fontWeight: 500,
                                                        color: v.estado === 'En Ruta' ? '#3B82F6' : v.estado === 'Mantenimiento' ? '#ea580c' : '#10b981',
                                                    }}>
                                                        {v.estado || 'Disponible'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarPropietario
