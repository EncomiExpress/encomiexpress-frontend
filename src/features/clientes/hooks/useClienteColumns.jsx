import { Box, Typography, IconButton, Tooltip, Avatar } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'

const useClienteColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado }) => [
    {
        key: 'nombre', label: 'Nombre', sortField: 'nombre',
        render: (cliente) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{
                    width: 34, height: 34,
                    backgroundColor: cliente.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: cliente.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                }}>
                    {cliente.iniciales && cliente.iniciales !== 'U' ? cliente.iniciales : (cliente.nombre?.[0] || '') + (cliente.apellido?.[0] || '') || 'C'}
                </Avatar>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {cliente.nombre} {cliente.apellido}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'identificacion', label: 'Identificación',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (cliente) => `${cliente.tipoIdentificacion} ${cliente.numeroIdentificacion}`,
    },
    {
        key: 'telefono', label: 'Teléfono',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (cliente) => cliente.telefono,
    },
    {
        key: 'email', label: 'Email',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5, maxWidth: 200 },
        render: (cliente) => (
            <Typography variant="body2" color={theme.palette.text.primary} noWrap>
                {cliente.email}
            </Typography>
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (cliente) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_CLIENTE) && (
                    <Tooltip title="Ver detalle">
                        <IconButton
                            size="small"
                            onClick={() => onConsultar(cliente)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                        >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_CLIENTE) && (
                    cliente.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton
                                size="small"
                                onClick={() => onEditar(cliente)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                            >
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_CLIENTE) && (
                    <ToggleSwitch id={cliente.idCliente} checked={cliente.habilitado} onChange={() => onToggleHabilitado(cliente)} />
                )}
            </Box>
        ),
    },
]

export default useClienteColumns
