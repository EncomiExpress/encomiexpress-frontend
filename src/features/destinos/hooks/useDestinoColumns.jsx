import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import NacionSVG from '../../../shared/components/NacionSVG.jsx'

const useDestinoColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado }) => [
    {
        key: 'ciudad', label: 'Ciudad', sortField: 'ciudad',
        render: (destino) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NacionSVG color={destino.habilitado ? theme.palette.primary.main : theme.palette.text.disabled} />
                </Box>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {destino.ciudad}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'departamento', label: 'Departamento',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (destino) => destino.departamento,
    },
    {
        key: 'tarifaBase', label: 'Tarifa Base', cellSx: { py: 1.5 },
        render: (destino) => (
            <Chip
                label={destino.tarifaBase !== undefined ? `$${Number(destino.tarifaBase).toLocaleString('es-CO')}` : '—'}
                size="small"
                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', borderRadius: '2px', height: 26 }}
            />
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (destino) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_DESTINO) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(destino)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                    destino.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small"
                                onClick={() => onEditar(destino)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_DESTINO) && (
                    <ToggleSwitch id={destino.idDestino} checked={destino.habilitado} onChange={() => onToggleHabilitado(destino.idDestino, destino.habilitado, destino.ciudad)} />
                )}
            </Box>
        ),
    },
]

export default useDestinoColumns
