import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as ventaService from '../../shared/services/ventaService'
import {
    Box, Typography, Paper, Button, Dialog, Avatar, IconButton,
    Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'

const CampoFila = ({ label, value }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}
                sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {String(value ?? '-')}
            </Typography>
        </Box>
    )
}

const ModalConsultarCliente = ({ cliente, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabVentas, setTabVentas] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!cliente || tabIndex !== 1) return
        let ignore = false
        // Necesario para mostrar el loading apenas se abre la pestaña; sin esto no hay forma
        // de avisar que está cargando antes de que la petición responda.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTabVentas({ data: [], loading: true })
        ventaService.getEncomiendas(undefined, { idCliente: cliente.idCliente, limit: 100 })
            .then(res => { if (!ignore) setTabVentas({ data: res?.data || [], loading: false }) })
            .catch(() => { if (!ignore) setTabVentas({ data: [], loading: false }) })
        return () => { ignore = true }
    }, [cliente, tabIndex])

    if (!cliente) return null
    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }

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
                        backgroundColor: cliente.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: cliente.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                    }}>
                        {cliente.iniciales && cliente.iniciales !== 'U' ? cliente.iniciales : (cliente.nombre?.[0] || '') + (cliente.apellido?.[0] || '') || 'C'}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {cliente.nombre} {cliente.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Cliente</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Encomiendas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <CampoFila label="Identificación" value={`${cliente.tipoIdentificacion} ${cliente.numeroIdentificacion}`} />
                                <CampoFila label="Nombre" value={cliente.nombre} />
                                <CampoFila label="Apellido" value={cliente.apellido} />
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Contacto</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <CampoFila label="Teléfono" value={cliente.telefono} />
                                <CampoFila label="Email" value={cliente.email} />
                                <CampoFila label="Dirección" value={cliente.direccion} />
                                <CampoFila label="Estado" value={cliente.habilitado ? 'Habilitado' : 'Inhabilitado'} />
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Encomiendas registradas para este cliente</Typography>
                    {tabVentas.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabVentas.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin encomiendas registradas</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Guía</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Destino</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabVentas.data.map(v => {
                                        const info = getVentaEstadoDot(v.estado)
                                        return (
                                            <TableRow key={v.idEncomiendaVenta}
                                                onClick={() => window.open(`/ventas/listar?highlight=${v.idEncomiendaVenta}`, '_blank')}
                                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.numeroGuia || `#${v.idEncomiendaVenta}`}</TableCell>
                                                <TableCell sx={{ fontSize: '0.82rem' }}>{v.ruta?.destino?.ciudad || '—'}</TableCell>
                                                <TableCell sx={{ fontSize: '0.82rem' }}>${Number(v.valorServicio || 0).toLocaleString('es-CO')}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                        {info.type === 'symbol'
                                                            ? <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: info.char === '✓' ? '0.8rem' : '0.85rem', color: info.color, lineHeight: 1, flexShrink: 0 }}>{info.char}</Box>
                                                            : <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: info.fill ? info.color : 'transparent', border: `2px solid ${info.color}` }} />
                                                        }
                                                        <Typography fontSize="0.82rem" color={theme.palette.text.primary}>{info.label}</Typography>
                                                    </Box>
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
                <Button onClick={handleClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarCliente
