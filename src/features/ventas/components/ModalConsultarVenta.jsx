import { useState } from 'react'
import { useTheme, alpha } from '@mui/material/styles'
import {
    Box, Typography, Chip, Button, Dialog, IconButton, Menu, MenuItem
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { getVentaEstadoDot, getPaqueteEstadoDot, getEstadoPagoDot } from '../../../shared/utils/estadoColors.js'
import { descargarGuiaPaquete } from '../../../shared/utils/exportGuia/exportGuiaPdf.js'
import { formatFecha, formatFechaHora } from '../../../shared/utils/formatters.js'
import CampoFila from '../../../shared/components/CampoFila.jsx'
import FichaCard from '../../../shared/components/FichaCard.jsx'
import ModalHistorialEntrega from './ModalHistorialEntrega.jsx'

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
    const [paqueteIndex, setPaqueteIndex] = useState(0)
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [imagenAmpliada, setImagenAmpliada] = useState(null)
    const [historialOpen, setHistorialOpen] = useState(false)

    if (!venta) return null

    const estadoInfo = getVentaEstadoDot(venta.estado)
    const paquetes = venta.paquetes?.length > 0 ? venta.paquetes : [venta.paquete].filter(Boolean)
    const paquete = paquetes[paqueteIndex] || paquetes[0] || null

    const dim = paquete && [paquete.alto, paquete.ancho, paquete.profundidad].every(v => v != null)
        ? `${paquete.alto}×${paquete.ancho}×${paquete.profundidad} cm`
        : '—'

    const seleccionarPaquete = (index) => {
        setPaqueteIndex(index)
        setMenuAnchor(null)
    }

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
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                                {paquete?.numeroGuia || '—'}
                            </Typography>
                            <Chip label={getPaqueteEstadoDot(paquete?.estado).label} size="small"
                                sx={{ fontWeight: 600, fontSize: '0.68rem', height: 20,
                                    backgroundColor: alpha(getPaqueteEstadoDot(paquete?.estado).color, 0.12),
                                    color: getPaqueteEstadoDot(paquete?.estado).color }} />
                            {paquetes.length > 1 && (
                                <>
                                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}
                                        sx={{ color: theme.palette.text.secondary, ml: -0.5 }}>
                                        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                    <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                                        {paquetes.map((p, i) => (
                                            <MenuItem key={p.idPaquete || i} selected={i === paqueteIndex} onClick={() => seleccionarPaquete(i)}
                                                sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{p.numeroGuia}</Typography>
                                                    <Typography variant="caption" color={theme.palette.text.secondary}>Paquete {i + 1} de {paquetes.length}</Typography>
                                                </Box>
                                                <Chip label={getPaqueteEstadoDot(p.estado).label} size="small"
                                                    sx={{ fontWeight: 600, fontSize: '0.68rem', height: 20, flexShrink: 0,
                                                        backgroundColor: alpha(getPaqueteEstadoDot(p.estado).color, 0.12),
                                                        color: getPaqueteEstadoDot(p.estado).color }} />
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}
                        </Box>
                        <Typography variant="caption" color={theme.palette.text.secondary}>
                            {venta.cliente?.nombre} {venta.cliente?.apellido}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                    <FichaCard icon={PersonOutlinedIcon} title="Remitente">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Nombre</Typography>
                            <Typography variant="body2" fontWeight={500}
                                onClick={() => window.open(`/clientes/listar?highlight=${venta.idCliente}`, '_blank')}
                                sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', '&:hover': { opacity: 0.75 } }}>
                                {venta.cliente?.nombre} {venta.cliente?.apellido}
                            </Typography>
                        </Box>
                        <CampoFila label="Documento" value={venta.cliente?.tipoIdentificacion && venta.cliente?.numeroIdentificacion
                            ? `${venta.cliente.tipoIdentificacion} ${venta.cliente.numeroIdentificacion}`
                            : null} />
                        <CampoFila label="Teléfono" value={venta.cliente?.telefono} />
                        <CampoFila label="Correo" value={venta.cliente?.email} />
                        <CampoFila label="Municipio" value={venta.cliente?.destino
                            ? `${venta.cliente.destino.municipio}, ${venta.cliente.destino.departamento}`
                            : null} />
                        <CampoFila label="Dirección" value={venta.cliente?.direccion} />
                        <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 1, pt: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 18, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Destinatario</Typography>
                            </Box>
                            <CampoFila label="Nombre" value={venta.destinatario?.nombreDestinatario} />
                            <CampoFila label="Documento" value={venta.destinatario?.tipoIdentificacionDestinatario && venta.destinatario?.numeroIdentificacionDestinatario
                                ? `${venta.destinatario.tipoIdentificacionDestinatario} ${venta.destinatario.numeroIdentificacionDestinatario}`
                                : null} />
                            <CampoFila label="Teléfono" value={venta.destinatario?.telefonoDestinatario} />
                            <CampoFila label="Correo" value={venta.destinatario?.correoDestinatario} />
                            <CampoFila label="Destino" value={venta.destinatario?.destino
                                ? `${venta.destinatario.destino.municipio} - ${venta.destinatario.destino.departamento}`
                                : null} />
                            <CampoFila label="Dirección" value={venta.destinatario?.direccionDestinatario} />
                        </Box>
                    </FichaCard>

                    <FichaCard icon={PaymentOutlinedIcon} title="Envío y Pago">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado envío</Typography>
                            <EstadoDot info={estadoInfo} label={estadoInfo.label} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado pago</Typography>
                            <EstadoDot info={getEstadoPagoDot(venta.estadoPago)} label={getEstadoPagoDot(venta.estadoPago).label} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Ruta</Typography>
                            <Chip label={venta.ruta ? `${venta.ruta.origen || '—'} → ${venta.ruta.destino?.municipio || '—'}` : '—'} size="small"
                                onClick={() => window.open(`/transporte/rutas?highlight=${venta.idRuta}`, '_blank')}
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                        </Box>
                        {/* Vehículo/conductor del PAQUETE que se está viendo (paquete/i arriba) —
                        una ruta ahora puede tener varios vehículos y cada paquete de la venta
                        puede ir en uno distinto, así que esto ya no es un dato único por ruta. */}
                        <CampoFila label="Vehículo" value={paquete?.asignacion?.vehiculo ? `${paquete.asignacion.vehiculo.placa} — ${paquete.asignacion.vehiculo.marca} ${paquete.asignacion.vehiculo.modelo}` : null} />
                        <CampoFila label="Conductor" value={paquete?.asignacion?.conductor?.usuario ? `${paquete.asignacion.conductor.usuario.nombre} ${paquete.asignacion.conductor.usuario.apellido}` : null} />
                        <CampoFila label="Modalidad de recaudo" value={venta.modalidadRecaudo} />
                        <CampoFila label="Total a pagar" value={venta.total != null ? `$${Math.round(Number(venta.total)).toLocaleString('es-CO')}` : null} />
                        <CampoFila label="Fecha registro" value={formatFecha(venta.fechaRegistro)} />
                        <CampoFila label="Fecha est. entrega" value={formatFecha(venta.fechaEstimadaEntrega)} />
                        <CampoFila label="Observaciones" value={venta.observaciones} />
                    </FichaCard>
                </Box>

                {/* Ancho completo, horizontal por dentro (datos del paquete a la izquierda,
                estado de entrega a la derecha) -- así no queda apretada en la mitad del
                modal como cuando compartía fila con Remitente/Destinatario. */}
                <FichaCard icon={Inventory2OutlinedIcon} title="Paquete">
                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <CampoFila label="Contenido" value={paquete?.descripcionContenido} />
                            <CampoFila label="Tipo de carga" value={paquete?.tipoCarga === 'hierro' ? 'Hierro' : paquete?.tipoCarga === 'normal' ? 'Paquete normal' : null} />
                            <CampoFila label="Peso" value={paquete?.peso != null ? `${paquete.peso} kg` : null} />
                            <CampoFila label="Dimensiones" value={dim} />
                        </Box>
                        <Box sx={{ width: '1px', backgroundColor: theme.palette.divider, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado del paquete</Typography>
                                <EstadoDot info={getPaqueteEstadoDot(paquete?.estado)} label={getPaqueteEstadoDot(paquete?.estado).label} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado de pago</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: paquete?.estadoPago === 'Pagado' ? '#059669' : 'transparent', border: `2px solid ${paquete?.estadoPago === 'Pagado' ? '#059669' : '#D97706'}` }} />
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>{paquete?.estadoPago || '—'}</Typography>
                                </Box>
                            </Box>
                            <CampoFila label="Observación" value={paquete?.observacionEstado || null} />
                            {paquete?.intentosEntrega > 0 && (
                                <CampoFila label="Insistencia" value={`${paquete.intentosEntrega} ${paquete.intentosEntrega === 1 ? 'intento' : 'intentos'}${paquete.fechaUltimoIntento ? ` · último ${formatFechaHora(paquete.fechaUltimoIntento)}` : ''}`} />
                            )}
                            {(paquete?.intentosEntrega > 0 || paquete?.estado === 'Entregado' || paquete?.estado === 'Devuelto') && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 0.5 }}>
                                    <Typography
                                        component="button" onClick={() => setHistorialOpen(true)}
                                        variant="body2" fontWeight={600}
                                        sx={{
                                            color: theme.palette.primary.main, cursor: 'pointer', background: 'none', border: 'none', p: 0,
                                            textDecoration: 'underline', textDecorationStyle: 'dotted', '&:hover': { opacity: 0.75 },
                                        }}>
                                        Ver historial de entrega
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Evidencia</Typography>
                                {paquete?.fotoEntrega ? (
                                    <Typography variant="body2" fontWeight={500}
                                        onClick={() => setImagenAmpliada(paquete.fotoEntrega)}
                                        sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', '&:hover': { opacity: 0.75 } }}>
                                        Ver foto
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>—</Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </FichaCard>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 3, pb: 3 }}>
                <Button onClick={() => descargarGuiaPaquete(venta, paquete)} variant="outlined"
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
                        <Box component="img" src={imagenAmpliada} alt="Evidencia de entrega"
                            sx={{ maxWidth: '80vw', maxHeight: '85vh', display: 'block', borderRadius: 2 }} />
                    </Box>
                </Dialog>
            )}

            <ModalHistorialEntrega open={historialOpen} onClose={() => setHistorialOpen(false)} idPaquete={paquete?.idPaquete} />
        </Dialog>
    )
}

export default ModalConsultarVenta
