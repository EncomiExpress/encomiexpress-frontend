import { Box, Typography, Paper, Divider, Alert } from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { formatFecha } from '../../../../shared/utils/formatters.js'

/** Paso 5 del wizard: resumen de todo lo capturado, antes de enviar. */
export default function PasoConfirmacion({ theme, apiError, setApiError, cardSx, clienteSeleccionado, form, getPlacaPaquete }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {apiError && (
                <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                    {apiError}
                </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">Remitente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información del cliente</Typography>
                    {clienteSeleccionado && <>
                        <ConfirmRow label="Nombre" value={`${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`} />
                        <ConfirmRow label="Identificación" value={clienteSeleccionado.numeroIdentificacion} />
                        <ConfirmRow label="Teléfono" value={clienteSeleccionado.telefono} />
                    </>}
                </Paper>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">Destinatario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información del destinatario</Typography>
                    <ConfirmRow label="Nombre" value={form.nombreDestinatario} />
                    <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} />
                    <ConfirmRow label="Dirección" value={form.direccionDestinatario} />
                </Paper>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">{form.paquetes.length > 1 ? 'Paquetes' : 'Paquete'}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        {form.paquetes.length > 1 ? 'Características de los paquetes' : 'Características del paquete'}
                    </Typography>
                    {form.paquetes.map((p, i) => (
                        <Box key={i}>
                            {form.paquetes.length > 1 && (
                                <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary}
                                    sx={{ display: 'block', mt: i > 0 ? 1.5 : 0, mb: 0.5 }}>
                                    Paquete {i + 1}
                                </Typography>
                            )}
                            <ConfirmRow label="Contenido" value={p.descripcionContenido} />
                            <ConfirmRow label="Peso" value={p.peso ? `${p.peso} kg` : null} />
                            <ConfirmRow label="Dimensiones" value={p.alto ? `${p.alto}×${p.ancho}×${p.profundidad} cm` : null} />
                            <ConfirmRow label="Valor declarado" value={p.valorDeclarado ? `$${parseFloat(p.valorDeclarado).toLocaleString()}` : null} />
                            <ConfirmRow label="Vehículo" value={getPlacaPaquete(p)} />
                            {i < form.paquetes.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                    ))}
                </Paper>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">Envío y Pago</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Ruta, fechas y valores</Typography>
                    <ConfirmRow label="Ruta" value={form.destino} />
                    <ConfirmRow label="Fecha entrega" value={formatFecha(form.fechaEstimadaEntrega)} />
                    <ConfirmRow label="Observaciones" value={form.observaciones} />
                    <ConfirmRow label="Método de pago" value={form.metodoPago} />
                    <ConfirmRow label="Valor del servicio" value={form.valorServicio ? `$${parseFloat(form.valorServicio).toLocaleString()}` : null} />
                    <ConfirmRow label="Impuestos" value={form.impuestos ? `$${parseFloat(form.impuestos).toLocaleString()}` : null} />
                    <ConfirmRow label="Total" value={form.total ? `$${parseFloat(form.total).toLocaleString()}` : null} />
                </Paper>
            </Box>
        </Box>
    )
}
