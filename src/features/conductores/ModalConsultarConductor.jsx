import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as rutaService from '../../shared/services/rutaService'
import * as anticipoService from '../../shared/services/anticipoService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { isVencido } from '../../shared/utils/formatters.js'
import { getEstadoColorRuta, getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'

const renderEstadoRuta = (estado) => {
    const color = getEstadoColorRuta(estado).color
    if (estado === 'Cancelada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color, lineHeight: 1 }}>−</Box>
    if (estado === 'Completada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color, lineHeight: 1 }}>✓</Box>
    if (estado === 'Programada')
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: `2px solid ${color}` }} />
    return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: color, border: `2px solid ${color}` }} />
}

const CampoFila = ({ label, value, esChip, valueColor }) => {
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
                <Typography variant="body2" fontWeight={500} color={valueColor || theme.palette.text.medium}
                    sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {value ?? '—'}
                </Typography>
            )}
        </Box>
    )
}

const ModalConsultarConductor = ({ conductor, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabRutas, setTabRutas] = useState({ data: [], total: 0, loading: false })
    const [tabAnticipos, setTabAnticipos] = useState({ data: [], total: 0, loading: false })

    useEffect(() => {
        if (!conductor || tabIndex !== 1) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabRutas({ data: [], total: 0, loading: true })
        rutaService.getRutas({ idConductor: conductor.idConductor, limit: 100 })
            .then(res => setTabRutas({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabRutas({ data: [], total: 0, loading: false }))
    }, [conductor, tabIndex])

    useEffect(() => {
        if (!conductor || tabIndex !== 2) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabAnticipos({ data: [], total: 0, loading: true })
        anticipoService.getAnticipos(undefined, { idConductor: conductor.idConductor, limit: 100 })
            .then(res => setTabAnticipos({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabAnticipos({ data: [], total: 0, loading: false }))
    }, [conductor, tabIndex])

    if (!conductor) return null

    const handleClose = () => { setTabIndex(0); onClose() }

    const dotEstado = conductor.estadoEfectivo === 'en_ruta'
        ? { backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }
        : { backgroundColor: 'transparent', border: '2px solid #10b981' }

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
                        backgroundColor: conductor.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: conductor.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                    }}>
                        {(conductor.nombre?.[0] || '').toUpperCase()}{(conductor.apellido?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {conductor.nombre} {conductor.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Conductor</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Rutas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Detalles del Conductor</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Identificación y datos personales
                            </Typography>
                            <CampoFila label="Identificación" value={`${conductor.tipoIdentificacion} ${conductor.numeroIdentificacion}`} />
                            <CampoFila label="Nombre" value={conductor.nombre} />
                            <CampoFila label="Apellido" value={conductor.apellido} />
                            <CampoFila label="Teléfono" value={conductor.telefono} />
                            <CampoFila label="Email" value={conductor.email} />
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <BadgeOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Licencia y Estado</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Datos de licencia y estado operativo
                            </Typography>
                            <CampoFila label="N° Licencia" value={conductor.numeroLicencia} />
                            {(conductor.categoriasLicencia || []).length === 0 ? (
                                <CampoFila label="Categorías" value="—" />
                            ) : conductor.categoriasLicencia.map((cat, i) => (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{cat.categoria}</Typography>
                                    <Chip
                                        label={cat.vencimiento ? new Date(cat.vencimiento).toLocaleDateString() : 'N/A'}
                                        size="small"
                                        variant={isVencido(cat.vencimiento) ? 'filled' : 'outlined'}
                                        sx={isVencido(cat.vencimiento)
                                            ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                            : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                                        }
                                    />
                                </Box>
                            ))}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, ...dotEstado }} />
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}>
                                        {conductor.estadoEfectivo === 'en_ruta' ? 'En Ruta' : 'Disponible'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: tabRutas.total > 100 ? 0.5 : 2 }}>
                        Rutas asignadas a este conductor
                    </Typography>
                    {tabRutas.total > 100 && (
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 2 }}>
                            Mostrando los 100 más recientes de {tabRutas.total}.
                        </Typography>
                    )}
                    {tabRutas.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabRutas.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin rutas registradas</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Ruta</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Destino</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Fecha salida</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabRutas.data.map(r => (
                                        <TableRow key={r.idRuta}
                                            onClick={() => window.open(`/transporte/rutas?highlight=${r.idRuta}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.nombreRuta || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.destino?.ciudad || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.fechaSalida ? new Date(r.fechaSalida).toLocaleDateString() : '—'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    {renderEstadoRuta(r.estado)}
                                                    <Typography fontSize="0.82rem" color={theme.palette.text.primary}>{r.estado || '—'}</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </Box>
            )}

            {tabIndex === 2 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: tabAnticipos.total > 100 ? 0.5 : 2 }}>
                        Anticipos registrados para este conductor
                    </Typography>
                    {tabAnticipos.total > 100 && (
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 2 }}>
                            Mostrando los 100 más recientes de {tabAnticipos.total}.
                        </Typography>
                    )}
                    {tabAnticipos.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabAnticipos.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin anticipos registrados</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Gastado</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabAnticipos.data.map(a => {
                                        const info = getAnticipoEstadoDot(a.estado)
                                        return (
                                        <TableRow key={a.idAnticipoExcedente}
                                            onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorAnticipo).toLocaleString('es-CO')}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorGastado || 0).toLocaleString('es-CO')}</TableCell>
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
                <Button onClick={handleClose} variant="contained"
                    sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarConductor
