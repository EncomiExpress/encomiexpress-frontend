import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import { formatFechaHora } from '../../../shared/utils/formatters.js'
import { getPaqueteEstadoDot } from '../../../shared/utils/estadoColors.js'
import EstadoDot from '../../rutas/components/EstadoDot.jsx'

const usePaqueteDevueltoColumns = ({ theme, onVerVenta, onVerImagen }) => [
    {
        // `width` en la config de columna solo llega al <th> del encabezado
        // (DataTable.jsx) -- las celdas del cuerpo solo reciben `cellSx`, así que
        // sin un `maxWidth` ahí el contenido con `noWrap` se salía del ancho
        // "sugerido" y la tabla igual desbordaba (2026-09-13, la usuaria notó que
        // el primer recorte "mejoró pero le faltó un poquito" -- esta era la razón).
        // numeroGuia es de la venta dueña (P12), no del paquete.
        key: 'guia', label: 'Guía', width: 110, cellSx: { py: 1.5, maxWidth: 110 },
        render: (paquete) => (
            <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main} noWrap>
                {paquete.encomienda?.numeroGuia || '—'}
            </Typography>
        ),
    },
    {
        key: 'cliente', label: 'Cliente', width: 150, cellSx: { py: 1.5, maxWidth: 150 },
        render: (paquete) => {
            const cliente = paquete.encomienda?.cliente
            const nombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : '—'
            return (
                <>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap title={nombre}>
                        {nombre}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary} noWrap title={cliente?.email}>
                        {cliente?.email || 'Sin correo registrado'}
                    </Typography>
                </>
            )
        },
    },
    {
        // Municipio donde de verdad quedó varado el paquete (2026-09-13) —
        // antes mostraba el origen→destino de toda la ruta de ida (mismo
        // criterio que la columna "Destino" de Ventas, ver useVentaColumns.jsx).
        key: 'destino', label: 'Destino', width: 90, cellSx: { py: 1.5, maxWidth: 90 },
        render: (paquete) => (
            <Typography variant="body2" color={theme.palette.text.primary} noWrap>
                {paquete.encomienda?.destinatario?.destino?.municipio || '—'}
            </Typography>
        ),
    },
    {
        key: 'intentos', label: 'Insistencia', width: 140, cellSx: { py: 1.5, maxWidth: 140 },
        render: (paquete) => {
            const n = paquete.intentosEntrega || 0
            return (
                <>
                    <Typography variant="body2" fontWeight={600}
                        color={n > 0 ? '#D97706' : theme.palette.text.secondary}>
                        {n === 0 ? 'Sin intentos' : n === 1 ? '1 intento' : `${n} intentos`}
                    </Typography>
                    {paquete.fechaUltimoIntento && (
                        // Sin `noWrap` a propósito -- la fecha completa envuelve a una
                        // segunda línea en vez de truncarse con "...", que dejaría la
                        // hora exacta ilegible (a diferencia de Observación, un dato
                        // puntual sí importa mostrarlo completo).
                        <Typography variant="caption" color={theme.palette.text.secondary}>
                            Último: {formatFechaHora(paquete.fechaUltimoIntento)}
                        </Typography>
                    )}
                </>
            )
        },
    },
    {
        key: 'fecha', label: 'Fecha último estado', width: 105, cellSx: { py: 1.5, maxWidth: 105 },
        render: (paquete) => (
            // Mismo criterio que "Último" de Insistencia -- envuelve en vez de truncar.
            <Typography variant="body2" color={theme.palette.text.primary}>
                {paquete.fechaUltimoEstado ? formatFechaHora(paquete.fechaUltimoEstado) : '—'}
            </Typography>
        ),
    },
    {
        key: 'observacion', label: 'Observación', width: 140, cellSx: { py: 1.5, maxWidth: 140 },
        render: (paquete) => (
            <Typography variant="body2" color={theme.palette.text.secondary} noWrap title={paquete.observacionEstado}>
                {paquete.observacionEstado || '—'}
            </Typography>
        ),
    },
    {
        // Antes esta lista solo traía `estado: 'Devuelto'`, así que todas las filas eran
        // el mismo estado y no hacía falta columna -- ahora también trae "Devuelto a
        // base" (2026-09-13, la usuaria notó que ese paquete desaparecía de acá sin dejar
        // rastro visible apenas el conductor del regreso confirmaba "Llegó a Medellín").
        // Esta columna es lo que distingue "todavía allá" de "ya de vuelta en Medellín".
        key: 'estado', label: 'Estado', width: 170, cellSx: { py: 1.5, minWidth: 170 },
        render: (paquete) => {
            const dot = <EstadoDot {...getPaqueteEstadoDot(paquete.estado)} />
            if (paquete.estado !== 'Devuelto a base') return dot
            const usuario = paquete.conductorDevolucion?.usuario
            const nombreConfirmo = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : ''
            const cuando = paquete.fechaDevolucion ? formatFechaHora(paquete.fechaDevolucion) : ''
            const detalle = [nombreConfirmo && `Confirmado por ${nombreConfirmo}`, cuando].filter(Boolean).join(' · ')
            return detalle ? <Tooltip title={detalle} arrow placement="top"><Box component="span">{dot}</Box></Tooltip> : dot
        },
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
