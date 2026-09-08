import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Dialog, IconButton, CircularProgress, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { getHistorialEntregaPaquete } from '../services/ventaService.js'
import { formatFechaHora } from '../../../shared/utils/formatters.js'
import { getErrorMessage } from '../../../shared/utils/errorMessage.js'

// Un chip por acción -- mismo criterio de color que getPaqueteEstadoDot (verde
// Entregado, rojo No entregado) más uno nuevo para Intento (no es un `estado` de
// Paquete, es solo una acción del distribuidor que no lo cambia).
const CHIP_POR_ACCION = {
    Entregado: { label: 'Entregado', tono: 'success' },
    Devuelto: { label: 'No entregado', tono: 'error' },
    Intento: { label: 'Intento', tono: 'warning' },
}

// Modal liviano (sobre el modal Consultar de Ventas) con el historial completo de
// la entrega final de un paquete -- una fila por cada vez que el distribuidor
// registró algo (Intento/Entregado/Devuelto), con su propia novedad/foto/fecha.
// Antes esa evidencia se perdía: Paquete.observacionEstado/fotoEntrega son un
// único campo compartido que cada registro sobrescribía. Ver LOGICA.md,
// "Historial de entrega final".
const ModalHistorialEntrega = ({ open, onClose, idPaquete }) => {
    const theme = useTheme()
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [registros, setRegistros] = useState([])

    useEffect(() => {
        if (!open || !idPaquete) return
        let cancelado = false
        // Función interna en vez de setState directo en el cuerpo del efecto --
        // mismo orden de ejecución, pero así el linter (react-hooks/set-state-in-effect)
        // no confunde el reseteo previo al fetch con una mutación "impura". Mismo
        // patrón que usePaquetesPorPar.js.
        const cargarHistorial = () => {
            setCargando(true)
            setError('')
            getHistorialEntregaPaquete(idPaquete)
                .then((res) => { if (!cancelado) setRegistros(res.data || []) })
                .catch((err) => { if (!cancelado) setError(getErrorMessage(err, 'No se pudo cargar el historial')) })
                .finally(() => { if (!cancelado) setCargando(false) })
        }
        cargarHistorial()
        return () => { cancelado = true }
    }, [open, idPaquete])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryOutlinedIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                    <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                        Historial de entrega
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ px: 3, py: 2.5, maxHeight: '60vh', overflowY: 'auto' }}>
                {cargando ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : error ? (
                    <Typography variant="body2" color={theme.palette.error.main} textAlign="center">{error}</Typography>
                ) : registros.length === 0 ? (
                    <Typography variant="body2" color={theme.palette.text.secondary} textAlign="center">
                        Todavía no hay ningún registro de entrega para este paquete.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {registros.map((r, i) => {
                            const chip = CHIP_POR_ACCION[r.accion] || { label: r.accion, tono: 'default' }
                            const distribuidor = r.distribuidor ? `${r.distribuidor.nombre} ${r.distribuidor.apellido}` : '—'
                            return (
                                <Box key={r.idPaqueteEntregaFinal ?? i} sx={{
                                    borderLeft: `3px solid ${theme.palette[chip.tono]?.main || theme.palette.divider}`,
                                    pl: 1.5,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Chip label={chip.label} size="small" color={chip.tono} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                        <Typography variant="caption" color={theme.palette.text.secondary}>
                                            {formatFechaHora(r.fecha)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 0.25 }}>
                                        {distribuidor}
                                    </Typography>
                                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: r.foto ? 0.5 : 0 }}>
                                        {r.novedad || '—'}
                                    </Typography>
                                    {r.foto && (
                                        <Typography
                                            component="a" href={r.foto} target="_blank" rel="noreferrer"
                                            variant="body2" fontWeight={500}
                                            sx={{ color: theme.palette.primary.main, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                                            Ver foto
                                        </Typography>
                                    )}
                                </Box>
                            )
                        })}
                    </Box>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalHistorialEntrega
