import { Box, Typography, Paper, Divider, Alert } from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { formatFecha } from '../../../../shared/utils/formatters.js'

/**
 * Paso 5 del wizard de edición: resumen de todo lo capturado, comparado contra los
 * valores originales de la venta (cada ConfirmRow muestra el valor anterior tachado
 * cuando cambió) y un contador de cuántos campos se modificaron.
 */
export default function PasoConfirmacion({
    theme, apiError, setApiError, cardSx, clienteSeleccionado, form, formOriginal,
    ventaOriginal, sinCambios, setSinCambios, clientes, rutasProgramadas,
}) {
    const clienteOriginal = formOriginal
        ? clientes.find(c => c.idCliente === parseInt(formOriginal.idCliente)) || ventaOriginal?.cliente
        : null
    const totalActual = form.total ? `$${parseFloat(form.total).toLocaleString()}` : null
    const totalOriginal = formOriginal ? (formOriginal.total ? `$${parseFloat(formOriginal.total).toLocaleString()}` : null) : undefined
    const valorServicioActual = form.valorServicio ? `$${parseFloat(form.valorServicio).toLocaleString()}` : null
    const valorServicioOriginal = formOriginal ? (formOriginal.valorServicio ? `$${parseFloat(formOriginal.valorServicio).toLocaleString()}` : null) : undefined
    const impuestosActual = form.impuestos ? `$${parseFloat(form.impuestos).toLocaleString()}` : null
    const impuestosOriginal = formOriginal ? (formOriginal.impuestos ? `$${parseFloat(formOriginal.impuestos).toLocaleString()}` : null) : undefined

    const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
    const camposComparados = formOriginal ? [
        [form.idCliente, formOriginal.idCliente],
        [form.nombreDestinatario, formOriginal.nombreDestinatario],
        [form.telefonoDestinatario, formOriginal.telefonoDestinatario],
        [form.direccionDestinatario, formOriginal.direccionDestinatario],
        [JSON.stringify(form.paquetes), JSON.stringify(formOriginal.paquetes)],
        [form.idRuta, formOriginal.idRuta],
        [form.fechaEstimadaEntrega, formOriginal.fechaEstimadaEntrega],
        [form.observaciones, formOriginal.observaciones],
        [form.metodoPago, formOriginal.metodoPago],
        [form.valorServicio, formOriginal.valorServicio],
        [form.impuestos, formOriginal.impuestos],
    ] : []
    const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {totalModificados > 0 && (
                <Alert severity="info" icon={<EditOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                    Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
                </Alert>
            )}
            {sinCambios && (
                <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                    No has realizado ningún cambio. Los datos ya están actualizados.
                </Alert>
            )}
            {apiError && (
                <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                    {apiError}
                </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Remitente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del remitente</Typography>
                    {clienteSeleccionado && <>
                        <ConfirmRow label="Nombre" value={`${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ''}`.trim()} previousValue={clienteOriginal ? `${clienteOriginal.nombre} ${clienteOriginal.apellido || ''}`.trim() : undefined} />
                        <ConfirmRow label="Identificación" value={clienteSeleccionado.numeroIdentificacion} previousValue={clienteOriginal?.numeroIdentificacion} />
                        <ConfirmRow label="Teléfono" value={clienteSeleccionado.telefono} previousValue={clienteOriginal?.telefono} />
                    </>}
                </Paper>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Destinatario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del destinatario</Typography>
                    <ConfirmRow label="Nombre" value={form.nombreDestinatario} previousValue={formOriginal?.nombreDestinatario} />
                    <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} previousValue={formOriginal?.telefonoDestinatario} />
                    <ConfirmRow label="Dirección" value={form.direccionDestinatario} previousValue={formOriginal?.direccionDestinatario} />
                </Paper>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>{form.paquetes.length > 1 ? 'Paquetes' : 'Paquete'}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        {form.paquetes.length > 1 ? 'Verifica los datos de los paquetes' : 'Verifica los datos del paquete'}
                    </Typography>
                    {form.paquetes.map((p, i) => {
                        const pOriginal = formOriginal?.paquetes?.[i]
                        const dimensionesActual = p.alto ? `${p.alto}×${p.ancho}×${p.profundidad} cm` : null
                        const dimensionesOriginal = pOriginal?.alto ? `${pOriginal.alto}×${pOriginal.ancho}×${pOriginal.profundidad} cm` : undefined
                        const valorDeclaradoActual = p.valorDeclarado ? `$${parseFloat(p.valorDeclarado).toLocaleString()}` : null
                        const valorDeclaradoOriginal = pOriginal ? (pOriginal.valorDeclarado ? `$${parseFloat(pOriginal.valorDeclarado).toLocaleString()}` : null) : undefined
                        const rutaSelActual = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
                        const placaActual = (rutaSelActual?.paresVehiculoConductor || []).find(par => par.idRutaVehiculoConductor === parseInt(p.idRutaVehiculoConductor))?.vehiculo?.placa || '—'
                        const placaOriginal = pOriginal ? (ventaOriginal?.paquetes?.[i]?.asignacion?.vehiculo?.placa || '—') : undefined
                        return (
                            <Box key={i}>
                                {form.paquetes.length > 1 && (
                                    <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary}
                                        sx={{ display: 'block', mt: i > 0 ? 1.5 : 0, mb: 0.5 }}>
                                        Paquete {i + 1}
                                    </Typography>
                                )}
                                <ConfirmRow label="Contenido" value={p.descripcionContenido} previousValue={pOriginal?.descripcionContenido} />
                                <ConfirmRow label="Peso" value={p.peso ? `${p.peso} kg` : null} previousValue={pOriginal ? (pOriginal.peso ? `${pOriginal.peso} kg` : null) : undefined} />
                                <ConfirmRow label="Dimensiones" value={dimensionesActual} previousValue={dimensionesOriginal} />
                                <ConfirmRow label="Valor declarado" value={valorDeclaradoActual} previousValue={valorDeclaradoOriginal} />
                                <ConfirmRow label="Vehículo" value={placaActual} previousValue={placaOriginal} />
                                {i < form.paquetes.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        )
                    })}
                </Paper>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Envío y Pago</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Ruta y valores</Typography>
                    <ConfirmRow label="Ruta" value={form.destino} previousValue={formOriginal?.destino} />
                    <ConfirmRow label="Fecha entrega" value={formatFecha(form.fechaEstimadaEntrega)} previousValue={formOriginal?.fechaEstimadaEntrega ? formatFecha(formOriginal.fechaEstimadaEntrega) : undefined} />
                    <ConfirmRow label="Observaciones" value={form.observaciones} previousValue={formOriginal?.observaciones} />
                    <ConfirmRow label="Método de pago" value={form.metodoPago} previousValue={formOriginal?.metodoPago} />
                    <ConfirmRow label="Valor del servicio" value={valorServicioActual} previousValue={valorServicioOriginal} />
                    <ConfirmRow label="Impuestos" value={impuestosActual} previousValue={impuestosOriginal} />
                    <ConfirmRow label="Total" value={totalActual} previousValue={totalOriginal} />
                </Paper>
            </Box>
        </Box>
    )
}
