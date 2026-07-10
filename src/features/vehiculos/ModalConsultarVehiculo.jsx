import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as rutaService from '../../shared/services/rutaService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { isVencido } from '../../shared/utils/formatters.js'
import { getEstadoColorRuta } from '../../shared/utils/estadoColors.js'

const PlacaDisplay = ({ placa, theme }) => {
    const letras = placa?.slice(0, 3) ?? ''
    const numeros = placa?.slice(3) ?? ''
    const c = theme.palette.primary.main
    return (
        <Box sx={{
            position: 'relative', width: 60, height: 25,
            backgroundColor: alpha(c, 0.07), border: `1.5px solid ${alpha(c, 0.28)}`,
            borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>{letras}</Typography>
            <Box sx={{ width: 3, height: 3, backgroundColor: alpha(c, 0.5), borderRadius: '50%', mx: '2px', flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>{numeros}</Typography>
        </Box>
    )
}

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{label}</Typography>
            {esChip ? (
                <Chip
                    label={value || '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={valueColor || theme.palette.text.medium}>
                    {value ?? '—'}
                </Typography>
            )}
        </Box>
    )
}


const ModalConsultarVehiculo = ({ vehiculo, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabRutas, setTabRutas] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!vehiculo || tabIndex !== 1) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabRutas({ data: [], loading: true })
        rutaService.getRutas({ idVehiculo: vehiculo.idVehiculo, limit: 100 })
            .then(res => setTabRutas({ data: res?.data || [], loading: false }))
            .catch(() => setTabRutas({ data: [], loading: false }))
    }, [vehiculo, tabIndex])

    if (!vehiculo) return null

    const handleClose = () => { setTabIndex(0); onClose() }

    const estadoEfectivo = vehiculo.estadoEfectivo || vehiculo.estado
    const dotEstado = estadoEfectivo === 'En Ruta'
        ? { backgroundColor: theme.palette.status.info.color, border: `2px solid ${theme.palette.status.info.color}` }
        : estadoEfectivo === 'Mantenimiento'
        ? { backgroundColor: theme.palette.status.warning.color, border: `2px solid ${theme.palette.status.warning.color}` }
        : { backgroundColor: 'transparent', border: `2px solid ${theme.palette.status.activeText}` }

    const propietarioNombre = vehiculo.propietario
        ? `${vehiculo.propietario.nombre} ${vehiculo.propietario.apellido || ''}`.trim()
        : '—'

    return (
        <Dialog open onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={handleClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <PlacaDisplay placa={vehiculo.placa} theme={theme} />
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {vehiculo.marca} {vehiculo.modelo}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>{vehiculo.tipo}</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Rutas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Datos del Vehículo</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Características y clasificación
                            </Typography>
                            <CampoFila label="Placa" value={vehiculo.placa} esChip />
                            <CampoFila label="Tarjeta propiedad" value={vehiculo.tarjetaPropiedad || '—'} />
                            <CampoFila label="Tipo" value={vehiculo.tipo} esChip />
                            <CampoFila label="Marca" value={vehiculo.marca} />
                            <CampoFila label="Modelo" value={vehiculo.modelo} />
                            <CampoFila label="Color" value={vehiculo.color} />
                            <CampoFila label="Capacidad" value={vehiculo.capacidad ? `${vehiculo.capacidad} kg` : '—'} />
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <EventOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Propietario y Documentos</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Titular y vencimientos de documentos
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Propietario</Typography>
                                <Typography
                                    variant="body2" fontWeight={500}
                                    onClick={() => vehiculo.propietario && window.open(`/transporte/propietarios?highlight=${vehiculo.propietario.idPropietario}`, '_blank')}
                                    sx={{
                                        color: theme.palette.primary.main, cursor: vehiculo.propietario ? 'pointer' : 'default',
                                        textDecoration: vehiculo.propietario ? 'underline' : 'none',
                                        textDecorationStyle: 'dotted',
                                        '&:hover': vehiculo.propietario ? { opacity: 0.75 } : {}
                                    }}
                                >
                                    {propietarioNombre}
                                </Typography>
                            </Box>
                            <CampoFila label="Origen" value={vehiculo.origen} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, ...dotEstado }} />
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                        {estadoEfectivo || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                            {[
                                { label: 'Venc. SOAT',          fecha: vehiculo.vencimientoSOAT },
                                { label: 'Venc. Rev. Técnica',  fecha: vehiculo.vencimientoRevisionTecnica },
                                { label: 'Venc. Seg. Terceros', fecha: vehiculo.vencimientoSeguroTerceros },
                            ].map(({ label, fecha }) => (
                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{label}</Typography>
                                    <Chip
                                        label={fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}
                                        size="small"
                                        variant={isVencido(fecha) ? 'filled' : 'outlined'}
                                        sx={isVencido(fecha)
                                            ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                            : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                                        }
                                    />
                                </Box>
                            ))}
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
                        Rutas asignadas a este vehículo
                    </Typography>
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

export default ModalConsultarVehiculo
