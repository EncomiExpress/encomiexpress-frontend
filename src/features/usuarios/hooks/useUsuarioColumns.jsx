import { Box, Typography, Chip, IconButton, Tooltip, Avatar } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'

const useUsuarioColumns = ({ theme, tienePermiso, PERMISOS, usuarioActual, onConsultar, onEditar, onToggleHabilitado }) => [
    {
        key: 'nombre', label: 'Nombre', sortField: 'nombre',
        render: (usuario) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{
                    width: 34, height: 34,
                    backgroundColor: usuario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                    fontSize: '0.73rem', fontWeight: 700,
                    color: usuario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                }}>
                    {usuario.iniciales && usuario.iniciales !== 'U' ? usuario.iniciales : (usuario.nombre?.[0] || '') + (usuario.apellido?.[0] || '') || 'U'}
                </Avatar>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {usuario.nombre} {usuario.apellido}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'identificacion', label: 'Identificación',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (usuario) => `${usuario.tipoIdentificacion} ${usuario.numeroIdentificacion}`,
    },
    {
        key: 'telefono', label: 'Teléfono',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (usuario) => usuario.telefono || '—',
    },
    {
        key: 'email', label: 'Email',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (usuario) => usuario.email,
    },
    {
        key: 'rol', label: 'Rol', cellSx: { py: 1.5 },
        render: (usuario) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                <Chip
                    label={usuario.rol?.nombre}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'transparent', color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10, borderColor: theme.palette.divider }}
                />
            </Box>
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (usuario) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_USUARIO) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(usuario)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_USUARIO) && (
                    usuario.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : usuario.idUsuario === 1 && usuarioActual?.idUsuario !== 1 ? (
                        <Tooltip title="Esta cuenta administradora solo puede editarse a sí misma">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : usuario.rol?.nombre?.toLowerCase() === 'conductor' ? (
                        <Tooltip title="Este usuario es un conductor: actualízalo desde el módulo de Conductores">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small"
                                onClick={() => onEditar(usuario)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_USUARIO) && usuario.idUsuario !== usuarioActual?.idUsuario && usuario.idUsuario !== 1 && (
                    <ToggleSwitch id={usuario.idUsuario} checked={usuario.habilitado} onChange={() => onToggleHabilitado(usuario)} />
                )}
            </Box>
        ),
    },
]

export default useUsuarioColumns
