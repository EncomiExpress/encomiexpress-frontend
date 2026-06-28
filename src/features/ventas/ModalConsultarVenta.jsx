import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, IconButton
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { getEstadoColorVenta as getEstadoColor } from '../../shared/utils/estadoColors.js'
import { formatRutaDestino } from '../../shared/utils/formatters.js'

const getPagoColor = (estadoPago, theme) =>
    estadoPago === 'Pagado'
        ? theme.palette.status.pagado
        : theme.palette.status.pendientePago

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

const ModalConsultarVenta = ({ venta, onClose }) => {
    const theme = useTheme()
    if (!venta) return null
    const estadoStyles = getEstadoColor(venta.estado, theme)
    const pagoStyles = getPagoColor(venta.estadoPago, theme)

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <LocalShippingOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Encomienda</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                    Información general de la guía de envío
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 2,
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 45, color: theme.palette.primary.main }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                            {venta.numeroGuia}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                            Factura: {venta.numeroFactura}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.8 }}>
                            <Chip label={venta.estado ? venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1) : '—'} size="small"
                                sx={{ backgroundColor: estadoStyles.bg, color: estadoStyles.color, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10 }} />
                            <Chip label={venta.estadoPago} size="small"
                                sx={{ backgroundColor: pagoStyles.bg, color: pagoStyles.color, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10 }} />
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Fecha de registro</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{venta.fechaRegistro}</Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary} display="block" mt={0.8}>Fecha estimada</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{venta.fechaEstimadaEntrega}</Typography>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Remitente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Datos del cliente que envía
                    </Typography>
                    <CampoFila label="Nombre" value={`${venta.cliente?.nombre} ${venta.cliente?.apellido}`} />
                    <CampoFila label="Identificación" value={`${venta.cliente?.tipoIdentificacion} ${venta.cliente?.numeroIdentificacion}`} />
                    <CampoFila label="Teléfono" value={venta.cliente?.telefono} />
                    <CampoFila label="Dirección" value={venta.cliente?.direccion} />
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Destinatario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Datos de quien recibe el paquete
                    </Typography>
                    <CampoFila label="Nombre" value={venta.destinatario?.nombreDestinatario} />
                    <CampoFila label="Teléfono" value={venta.destinatario?.telefonoDestinatario} />
                    <CampoFila label="Dirección" value={venta.destinatario?.direccionDestinatario} />
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Paquete</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Características del paquete enviado
                    </Typography>
                    <CampoFila label="Contenido" value={venta.paquete?.descripcionContenido} />
                    <CampoFila label="Peso" value={`${venta.paquete?.peso} kg`} />
                    <CampoFila label="Dimensiones" value={`${venta.paquete?.alto}×${venta.paquete?.ancho}×${venta.paquete?.profundidad} cm`} />
                    <CampoFila label="Valor declarado" value={`$${(venta.paquete?.valorDeclarado || 0).toLocaleString()}`} />
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <PaymentOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Pago y Ruta</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Información de pago y ruta de envío
                    </Typography>
                    <CampoFila label="Ruta" value={formatRutaDestino(venta.ruta?.destino)} />
                    <CampoFila label="Método de pago" value={venta.metodoPago} />
                    <CampoFila label="Valor servicio" value={`$${venta.valorServicio?.toLocaleString()}`} />
                    <CampoFila label="Total" value={`$${venta.total?.toLocaleString()}`} />
                </Paper>
            </Box>

            {venta.observaciones && (
                <Paper elevation={0} sx={{ ...cardSx, mt: 2 }}>
                    <Typography variant="subtitle2" color={theme.palette.text.secondary} mb={0.5}>Observaciones</Typography>
                    <Typography variant="body2">{venta.observaciones}</Typography>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarVenta
