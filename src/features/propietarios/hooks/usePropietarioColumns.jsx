import { Box, Typography, Chip, IconButton, Tooltip, Avatar } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'

const usePropietarioColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado }) => [
    {
        key: 'nombre', label: 'Nombre', sortField: 'nombre',
        render: (propietario) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{
                    width: 34, height: 34,
                    backgroundColor: propietario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                    fontSize: '0.73rem', fontWeight: 700,
                    color: propietario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                }}>
                    {(propietario.nombre?.[0] || '').toUpperCase()}{(propietario.apellido?.[0] || '').toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {propietario.nombre} {propietario.apellido}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'identificacion', label: 'Identificación',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (propietario) => `${propietario.tipoIdentificacion} ${propietario.numeroIdentificacion}`,
    },
    { key: 'telefono', label: 'Teléfono', cellSx: { py: 1.5 }, render: (propietario) => propietario.telefono || '—' },
    { key: 'email', label: 'Email', cellSx: { py: 1.5 }, render: (propietario) => propietario.email || '—' },
    {
        key: 'tipoFlota', label: 'Tipo Flota', cellSx: { py: 1.5 },
        render: (propietario) => (
            <Chip
                label={propietario.tipoFlota || '—'}
                size="small"
                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
            />
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (propietario) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Ver detalle">
                    <IconButton size="small" onClick={() => onConsultar(propietario)}
                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                {propietario.habilitado === false ? (
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
                            onClick={() => onEditar(propietario)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.INHABILITAR_PROPIETARIO) && (
                    <ToggleSwitch id={propietario.idPropietario} checked={propietario.habilitado} onChange={() => onToggleHabilitado(propietario)} />
                )}
            </Box>
        ),
    },
]

export default usePropietarioColumns
