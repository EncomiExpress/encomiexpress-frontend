import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import NacionSVG from '../../../shared/components/NacionSVG.jsx'
import { getRutaLabel } from '../utils/rutaResolvers.js'

// Columnas de la tabla de plantillas de Ruta — mucho más liviana que la de
// Salidas (sin fecha/hora/estado/convoy: eso vive en la agenda). Sin columna de
// "Nombre": cada ruta se identifica por su corredor (Medellín -> destino),
// calculado en getRutaLabel, igual que antes de la migración Ruta/SalidaProgramada.
const useRutaColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado, onVerSalidas }) => [
    {
        // sortField ordena por el destino (municipio), no por la etiqueta completa
        // "Medellín -> destino": el origen es siempre fijo, así que ordenar por la
        // etiqueta entera no aportaría nada que ordenar por el destino no dé ya.
        key: 'ruta', label: 'Ruta', sortField: 'municipio', cellSx: { py: 1.5 },
        render: (ruta) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 26, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NacionSVG color={ruta.habilitado !== false ? theme.palette.primary.main : theme.palette.text.disabled} />
                </Box>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} sx={{ fontSize: '0.85rem' }}>
                    {getRutaLabel(ruta)}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'departamento', label: 'Departamento', cellSx: { py: 1.5 },
        render: (ruta) => (
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                {ruta.destino?.departamento || '—'}
            </Typography>
        ),
    },
    {
        key: 'observaciones', label: 'Observaciones', cellSx: { py: 1.5, maxWidth: 260 },
        render: (ruta) => (
            <Typography sx={{ fontSize: '0.82rem', color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ruta.observaciones || ''}>
                {ruta.observaciones || '—'}
            </Typography>
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (ruta) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(ruta)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                    <Tooltip title="Salidas — ver y programar los viajes de esta ruta">
                        <IconButton size="small" onClick={() => onVerSalidas(ruta)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <EventRepeatOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && (
                    ruta.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEditar(ruta)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_RUTA) && (
                    <ToggleSwitch id={ruta.idRuta} checked={ruta.habilitado !== false} onChange={() => onToggleHabilitado(ruta.idRuta, ruta.habilitado !== false, getRutaLabel(ruta))} />
                )}
            </Box>
        ),
    },
]

export default useRutaColumns
