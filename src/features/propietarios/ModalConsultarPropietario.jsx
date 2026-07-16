import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as vehiculoService from '../../shared/services/vehiculoService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'

const CampoFila = ({ label, value, esChip }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            {esChip ? (
                <Chip
                    label={value || '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}
                    sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {value ?? '—'}
                </Typography>
            )}
        </Box>
    )
}

const ModalConsultarPropietario = ({ propietario, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabVehiculos, setTabVehiculos] = useState({ data: [], total: 0, loading: false })

    useEffect(() => {
        if (!propietario || tabIndex !== 1) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabVehiculos({ data: [], total: 0, loading: true })
        vehiculoService.getVehiculos(undefined, { idPropietario: propietario.idPropietario, limit: 100 })
            .then(res => setTabVehiculos({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabVehiculos({ data: [], total: 0, loading: false }))
    }, [propietario, tabIndex])

    if (!propietario) return null

    const handleClose = () => { setTabIndex(0); onClose() }

    return (
        <Dialog open onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={handleClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{
                        backgroundColor: propietario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: propietario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                    }}>
                        {(propietario.nombre?.[0] || '').toUpperCase()}{(propietario.apellido?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {propietario.nombre} {propietario.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Propietario</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Vehículos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Detalles del Propietario</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Identificación y datos personales
                            </Typography>
                            <CampoFila label="Identificación" value={`${propietario.tipoIdentificacion} ${propietario.numeroIdentificacion}`} />
                            <CampoFila label="Nombre" value={propietario.nombre} />
                            <CampoFila label="Apellido" value={propietario.apellido} />
                        </Paper>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Contacto y Flota</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Datos de contacto y flota
                            </Typography>
                            <CampoFila label="Teléfono" value={propietario.telefono} />
                            <CampoFila label="Email" value={propietario.email} />
                            <CampoFila label="Tipo de flota" value={propietario.tipoFlota} esChip />
                            <CampoFila label="Estado" value={propietario.habilitado ? 'Habilitado' : 'Inhabilitado'} />
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: tabVehiculos.total > 100 ? 0.5 : 2 }}>
                        Vehículos registrados para este propietario
                    </Typography>
                    {tabVehiculos.total > 100 && (
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 2 }}>
                            Mostrando los 100 más recientes de {tabVehiculos.total}.
                        </Typography>
                    )}
                    {tabVehiculos.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabVehiculos.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin vehículos registrados</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Placa</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Marca / Modelo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Habilitado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabVehiculos.data.map(v => {
                                        const dotSx = v.estado === 'Disponible'
                                            ? { backgroundColor: 'transparent', border: '2px solid #10b981' }
                                            : v.estado === 'En Ruta'
                                            ? { backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }
                                            : v.estado === 'Mantenimiento'
                                            ? { backgroundColor: '#ea580c', border: '2px solid #ea580c' }
                                            : { backgroundColor: '#9CA3AF', border: '2px solid #9CA3AF' }
                                        return (
                                        <TableRow
                                            key={v.idVehiculo}
                                            onClick={() => window.open(`/vehiculos/listar?highlight=${v.idVehiculo}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}
                                        >
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.placa}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.marca} {v.modelo}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.tipo || '—'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, ...dotSx }} />
                                                    <Typography fontSize="0.82rem" color={theme.palette.text.primary}>{v.estado || '—'}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontSize="0.82rem" color={theme.palette.text.medium}>
                                                    {v.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                <Button onClick={handleClose} variant="contained"
                    sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarPropietario
