import { useTheme, alpha } from '@mui/material/styles'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { descargarGuiaPdf } from '../../shared/utils/exportGuiaPdf.js'

const CampoFila = ({ label, value }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{label}</Typography>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                {String(value ?? '—')}
            </Typography>
        </Box>
    )
}

const EstadoDot = ({ info, label }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {info.type === 'symbol'
                ? <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: info.char === '✓' ? '0.8rem' : '0.85rem', color: info.color, lineHeight: 1, flexShrink: 0 }}>{info.char}</Box>
                : <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: info.fill ? info.color : 'transparent', border: `2px solid ${info.color}` }} />
            }
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>{label}</Typography>
        </Box>
    )
}

const ModalConsultarVenta = ({ venta, onClose }) => {
    const theme = useTheme()
    if (!venta) return null

    const estadoInfo = getVentaEstadoDot(venta.estado)
    const esPagado = venta.estadoPago === 'Pagado'
    const dim = venta.paquete
        ? [venta.paquete.alto, venta.paquete.ancho, venta.paquete.profundidad].every(v => v != null)
            ? `${venta.paquete.alto}×${venta.paquete.ancho}×${venta.paquete.profundidad} cm`
            : '—'
        : '—'

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            {/* Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, pb: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {venta.numeroGuia}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>
                            {venta.cliente?.nombre} {venta.cliente?.apellido}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                    {/* Columna izquierda: Remitente/Destinatario + Paquete */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                        <Paper elevation={0} sx={{ ...cardSx }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Remitente</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Nombre</Typography>
                                <Typography variant="body2" fontWeight={500}
                                    onClick={() => window.open(`/clientes/listar?highlight=${venta.idCliente}`, '_blank')}
                                    sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', '&:hover': { opacity: 0.75 } }}>
                                    {venta.cliente?.nombre} {venta.cliente?.apellido}
                                </Typography>
                            </Box>
                            <CampoFila label="Teléfono" value={venta.cliente?.telefono} />
                            <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 1, pt: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 18, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Destinatario</Typography>
                                </Box>
                                <CampoFila label="Nombre" value={venta.destinatario?.nombreDestinatario} />
                                <CampoFila label="Teléfono" value={venta.destinatario?.telefonoDestinatario} />
                                <CampoFila label="Dirección" value={venta.destinatario?.direccionDestinatario} />
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ ...cardSx }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Inventory2OutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Paquete</Typography>
                            </Box>
                            <CampoFila label="Contenido" value={venta.paquete?.descripcionContenido} />
                            <CampoFila label="Peso" value={venta.paquete?.peso != null ? `${venta.paquete.peso} kg` : null} />
                            <CampoFila label="Dimensiones" value={dim} />
                            <CampoFila label="Valor declarado" value={venta.paquete?.valorDeclarado != null ? `$${Number(venta.paquete.valorDeclarado).toLocaleString('es-CO')}` : null} />
                        </Paper>
                    </Box>

                    {/* Columna derecha: Envío y Pago — ocupa toda la altura */}
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="0.95rem">Envío y Pago</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado envío</Typography>
                            <EstadoDot info={estadoInfo} label={estadoInfo.label} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado pago</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: esPagado ? '#059669' : 'transparent', border: `2px solid ${esPagado ? '#059669' : '#D97706'}` }} />
                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>{venta.estadoPago || '—'}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Ruta</Typography>
                            <Chip label={venta.ruta?.nombreRuta || '—'} size="small"
                                onClick={() => window.open(`/transporte/rutas?highlight=${venta.idRuta}`, '_blank')}
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                        </Box>
                        <CampoFila label="Método de pago" value={venta.metodoPago} />
                        <CampoFila label="Valor servicio" value={venta.valorServicio != null ? `$${Number(venta.valorServicio).toLocaleString('es-CO')}` : null} />
                        <CampoFila label="Impuestos" value={venta.impuestos != null ? `$${Number(venta.impuestos).toLocaleString('es-CO')}` : null} />
                        <CampoFila label="Total" value={venta.total != null ? `$${Number(venta.total).toLocaleString('es-CO')}` : null} />
                        <CampoFila label="Fecha registro" value={venta.fechaRegistro} />
                        <CampoFila label="Fecha est. entrega" value={venta.fechaEstimadaEntrega} />
                        <CampoFila label="Observaciones" value={venta.observaciones} />
                    </Paper>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 3, pb: 3 }}>
                <Button onClick={() => descargarGuiaPdf(venta)} variant="outlined"
                    startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                        borderRadius: 2, textTransform: 'none', color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                        '&:hover': { backgroundColor: theme.palette.action.hover, borderColor: theme.palette.divider },
                    }}>
                    Descargar guía
                </Button>
                <Button onClick={onClose} variant="contained" sx={{
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

export default ModalConsultarVenta
