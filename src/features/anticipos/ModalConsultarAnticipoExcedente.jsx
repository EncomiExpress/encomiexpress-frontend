import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, IconButton
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import RouteIcon from '@mui/icons-material/Route'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloseIcon from '@mui/icons-material/Close'
import { getEstadoColorAnticipo } from '../../shared/utils/estadoColors.js'
import { formatFecha } from '../../shared/utils/formatters.js'

const formatMoney = (val) => {
    const num = parseFloat(val || 0)
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
}

const CampoFila = ({ label, value, esEstado, estadoValue }) => {
    const theme = useTheme()
    const estadoColors = esEstado ? getEstadoColorAnticipo(estadoValue) : null
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{label}</Typography>
            {esEstado ? (
                <Chip
                    label={estadoValue}
                    size="small"
                    sx={{
                        backgroundColor: estadoColors?.bg || '#F3F4F6',
                        color: estadoColors?.color || '#9CA3AF',
                        fontWeight: 600, fontSize: '0.72rem',
                        height: 22, borderRadius: 10, border: 'none', textTransform: 'capitalize',
                    }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                    {String(value ?? '—')}
                </Typography>
            )}
        </Box>
    )
}

const ModalConsultarAnticipoExcedente = ({ anticipo, conductores, rutas, onClose }) => {
    const theme = useTheme()
    if (!anticipo) return null

    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
    const soportes = anticipo.soportes || []

    const getNombreConductor = (id) => {
        const c = conductores.find(c => c.idConductor === parseInt(id))
        return c ? c.nombre : '—'
    }

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : '—'
    }

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 36, height: 36 }}>
                    <RouteIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={theme.palette.secondary.main}>
                        Anticipo #{anticipo.idAnticipoExcedente}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary}>
                        {getNombreConductor(anticipo.idConductor)} · {getNombreRuta(anticipo.idRuta)}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Datos del Anticipo</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Información principal del anticipo
                        </Typography>
                        <CampoFila label="Conductor" value={getNombreConductor(anticipo.idConductor)} />
                        <CampoFila label="Ruta" value={getNombreRuta(anticipo.idRuta)} />
                        <CampoFila label="Valor anticipo" value={formatMoney(anticipo.valorAnticipo)} />
                        <CampoFila label="Valor gastado" value={anticipo.valorGastado ? formatMoney(anticipo.valorGastado) : '—'} />
                        <CampoFila
                            label={excedente >= 0 ? 'Excedente' : 'Faltante'}
                            value={(excedente >= 0 ? '+' : '-') + formatMoney(Math.abs(excedente))}
                        />
                        <CampoFila label="Estado" value={anticipo.estado} esEstado estadoValue={anticipo.estado} />
                    </Paper>

                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Fechas</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Fechas relacionadas al anticipo
                        </Typography>
                        <CampoFila label="F. Entrega" value={formatFecha(anticipo.fechaEntrega)} />
                        <CampoFila label="F. Legalización" value={formatFecha(anticipo.fechaLegalizacion)} />
                        <CampoFila label="F. Excedente" value={formatFecha(anticipo.fechaEntregaExcedente)} />
                        {anticipo.observaciones && (
                            <Box sx={{ pt: 1 }}>
                                <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600} display="block">Observaciones</Typography>
                                <Typography variant="body2" color={theme.palette.text.primary}>{anticipo.observaciones}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {soportes.length > 0 && (
                    <Paper elevation={0} sx={{ ...cardSx }}>
                        <Box sx={tituloSx}>
                            <ImageIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Soportes de pago</Typography>
                            <Chip label={`${soportes.length} archivo${soportes.length !== 1 ? 's' : ''}`} size="small"
                                sx={{ ml: 'auto', fontSize: '0.68rem', height: 20, backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                            {soportes.map((s, idx) => (
                                <Box key={idx} sx={{ width: 80, borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                                    {s.tipo === 'image' ? (
                                        <Box component="img" src={s.url} alt={s.nombre} sx={{ width: '100%', height: 60, objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                                            <InsertDriveFileIcon sx={{ color: theme.palette.text.secondary }} />
                                        </Box>
                                    )}
                                    <Typography variant="caption" sx={{ display: 'block', p: 0.5, fontSize: '0.6rem', color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.nombre}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained"
                    sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalConsultarAnticipoExcedente
