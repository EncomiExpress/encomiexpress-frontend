import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import { formatFechaHora } from '../../../shared/utils/formatters.js'

const usePaqueteDevueltoColumns = ({ theme, onVerVenta, onVerImagen }) => [
    {
        key: 'guia', label: 'Guía', cellSx: { py: 1.5 },
        render: (paquete) => (
            <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                {paquete.numeroGuia}
            </Typography>
        ),
    },
    {
        key: 'cliente', label: 'Cliente', cellSx: { py: 1.5 },
        render: (paquete) => {
            const cliente = paquete.encomienda?.cliente
            return (
                <>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                        {cliente ? `${cliente.nombre} ${cliente.apellido}` : '—'}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                        {cliente?.email || 'Sin correo registrado'}
                    </Typography>
                </>
            )
        },
    },
    {
        key: 'ruta', label: 'Ruta', cellSx: { py: 1.5 },
        render: (paquete) => {
            const ruta = paquete.asignacion?.ruta
            return (
                <Typography variant="body2" color={theme.palette.text.primary}>
                    {ruta ? `${ruta.origen || '—'} → ${ruta.destino?.ciudad || '—'}` : '—'}
                </Typography>
            )
        },
    },
    {
        key: 'fecha', label: 'Fecha último estado', cellSx: { py: 1.5 },
        render: (paquete) => (
            <Typography variant="body2" color={theme.palette.text.primary}>
                {paquete.fechaUltimoEstado ? formatFechaHora(paquete.fechaUltimoEstado) : '—'}
            </Typography>
        ),
    },
    {
        key: 'observacion', label: 'Observación', cellSx: { py: 1.5, maxWidth: 260 },
        render: (paquete) => (
            <Typography variant="body2" color={theme.palette.text.secondary} noWrap>
                {paquete.observacionEstado || '—'}
            </Typography>
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (paquete) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Ver venta">
                    <IconButton
                        size="small"
                        onClick={() => onVerVenta(paquete)}
                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                    >
                        <OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                {paquete.fotoEntrega ? (
                    <Tooltip title="Ver evidencia">
                        <IconButton
                            size="small"
                            onClick={() => onVerImagen(paquete.fotoEntrega)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                        >
                            <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Sin evidencia adjunta">
                        <span>
                            <IconButton size="small" disabled>
                                <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </Box>
        ),
    },
]

export default usePaqueteDevueltoColumns
