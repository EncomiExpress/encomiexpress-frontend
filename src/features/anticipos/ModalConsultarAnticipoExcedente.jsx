import { useTheme, alpha } from '@mui/material/styles'
import { useState } from 'react'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton
} from '@mui/material'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'
import { formatFecha } from '../../shared/utils/formatters.js'

const esImagen = (url) => {
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0]
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}

const formatMoney = (val) => {
    const num = parseFloat(val || 0)
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
}

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

const ModalConsultarAnticipoExcedente = ({ anticipo, conductores, rutas, onClose }) => {
    const theme = useTheme()
    const [imagenAmpliada, setImagenAmpliada] = useState(null)
    if (!anticipo) return null

    const resolveConductor = () => {
        if (anticipo.conductor?.usuario) {
            return `${anticipo.conductor.usuario.nombre} ${anticipo.conductor.usuario.apellido}`
        }
        const c = conductores?.find(c => c.idConductor === parseInt(anticipo.idConductor))
        return c ? c.nombre : '—'
    }

    const resolveRuta = () => {
        if (anticipo.ruta?.nombreRuta) return anticipo.ruta.nombreRuta
        const r = rutas?.find(r => r.idRuta === parseInt(anticipo.idRuta))
        return r ? (r.nombreRuta || r.nombre) : '—'
    }

    const resolveDestino = () => {
        const destino = anticipo.ruta?.destino
            || rutas?.find(r => r.idRuta === parseInt(anticipo.idRuta))?.destino
        if (!destino) return null
        return [destino.ciudad, destino.departamento].filter(Boolean).join(', ')
    }

    const nombreConductor = resolveConductor()
    const nombreRuta = resolveRuta()
    const destinoTexto = resolveDestino()
    // Filtra entradas vacías/rotas — subidas viejas hechas antes de corregir el
    // backend (guardaba `undefined` en vez de la URL real) quedaron como `null`.
    const soporteValido = (anticipo.soporte || []).filter(Boolean)
    const estadoInfo = getAnticipoEstadoDot(anticipo.estado)
    const tieneGasto = parseFloat(anticipo.valorGastado || 0) > 0
    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, pb: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <PaymentsOutlinedIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {nombreConductor}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>
                            {nombreRuta}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="0.95rem">Conductor y Ruta</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Recursos asignados al anticipo
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Conductor</Typography>
                            <Typography variant="body2" fontWeight={500}
                                onClick={() => window.open(`/transporte/conductores?highlight=${anticipo.idConductor}`, '_blank')}
                                sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', '&:hover': { opacity: 0.75 } }}>
                                {nombreConductor}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Ruta</Typography>
                            <Chip label={nombreRuta || '—'} size="small"
                                onClick={() => window.open(`/transporte/rutas?highlight=${anticipo.idRuta}`, '_blank')}
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                        </Box>
                        <CampoFila label="Destino" value={destinoTexto} />
                    </Paper>

                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="0.95rem">Valores y Estado</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Montos, fechas y estado del anticipo
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Valor anticipo</Typography>
                            <Chip label={formatMoney(anticipo.valorAnticipo)} size="small" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, fontSize: '0.7rem', borderRadius: '2px', height: 24 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Valor gastado</Typography>
                            {tieneGasto
                                ? <Chip label={`-${formatMoney(anticipo.valorGastado)}`} size="small" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark, fontSize: '0.7rem', borderRadius: '2px', height: 24 }} />
                                : <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>—</Typography>
                            }
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Excedente</Typography>
                            {tieneGasto
                                ? <Chip label={`+${formatMoney(excedente)}`} size="small" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, fontSize: '0.7rem', borderRadius: '2px', height: 24 }} />
                                : <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>—</Typography>
                            }
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                {estadoInfo.type === 'symbol'
                                    ? <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: estadoInfo.char === '✓' ? '0.8rem' : '0.85rem', color: estadoInfo.color, lineHeight: 1, flexShrink: 0 }}>{estadoInfo.char}</Box>
                                    : <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: estadoInfo.fill ? estadoInfo.color : 'transparent', border: `2px solid ${estadoInfo.color}` }} />
                                }
                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                    {anticipo.estado || '—'}
                                </Typography>
                            </Box>
                        </Box>
                        <CampoFila label="F. Entrega" value={formatFecha(anticipo.fechaEntrega) || '—'} />
                        <CampoFila label="F. Legalización" value={formatFecha(anticipo.fechaLegalizacion) || '—'} />
                        <CampoFila label="F. Entrega excedente" value={formatFecha(anticipo.fechaEntregaExcedente) || '—'} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Soporte</Typography>
                            {soporteValido.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.3 }}>
                                    {soporteValido.map((url, i) => (
                                        <Typography
                                            key={i}
                                            variant="body2" fontWeight={500}
                                            onClick={() => esImagen(url) ? setImagenAmpliada(url) : window.open(url, '_blank')}
                                            sx={{
                                                color: theme.palette.primary.main, cursor: 'pointer',
                                                textDecoration: 'underline', textDecorationStyle: 'dotted',
                                                '&:hover': { opacity: 0.75 },
                                            }}
                                        >
                                            Ver soporte{soporteValido.length > 1 ? ` ${i + 1}` : ''}
                                        </Typography>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>—</Typography>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                    Cerrar
                </Button>
            </Box>

            {imagenAmpliada && (
                <Dialog open onClose={() => setImagenAmpliada(null)} maxWidth="md"
                    slotProps={{ paper: { sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' } } }}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton onClick={() => setImagenAmpliada(null)} size="small" sx={{
                            position: 'absolute', right: -16, top: -16, backgroundColor: theme.palette.background.paper,
                            boxShadow: 2, '&:hover': { backgroundColor: theme.palette.background.paper },
                        }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                        <Box component="img" src={imagenAmpliada} alt="Soporte"
                            sx={{ maxWidth: '80vw', maxHeight: '85vh', display: 'block', borderRadius: 2 }} />
                    </Box>
                </Dialog>
            )}
        </Dialog>
    )
}

export default ModalConsultarAnticipoExcedente
