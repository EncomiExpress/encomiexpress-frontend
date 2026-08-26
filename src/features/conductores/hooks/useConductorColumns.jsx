import { Box, Typography, Chip, IconButton, Tooltip, Avatar } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import { isVencido, formatFecha } from '../../../shared/utils/formatters.js'

const useConductorColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado }) => [
    {
        key: 'nombre', label: 'Nombre', sortField: 'nombre',
        render: (conductor) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, backgroundColor: conductor.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg, fontSize: '0.73rem', fontWeight: 700, color: conductor.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color }}>
                    {conductor.nombre?.[0] || ''}{conductor.apellido?.[0] || ''}
                </Avatar>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {conductor.nombre} {conductor.apellido}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'identificacion', label: 'Identificación',
        cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
        render: (conductor) => `${conductor.tipoIdentificacion} ${conductor.numeroIdentificacion}`,
    },
    { key: 'telefono', label: 'Teléfono', cellSx: { py: 1.5 }, render: (conductor) => conductor.telefono || '-' },
    { key: 'email', label: 'Email', cellSx: { py: 1.5 }, render: (conductor) => conductor.email || '-' },
    {
        key: 'licencia', label: 'Licencia', cellSx: { py: 1.5 },
        render: (conductor) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(conductor.categoriasLicencia || []).length === 0 ? (
                        <Chip label="—" size="small"
                            sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }} />
                    ) : conductor.categoriasLicencia.map((cat, i) => (
                        <Chip key={i}
                            label={`${cat.categoria} · ${cat.vencimiento ? formatFecha(cat.vencimiento) : 'N/A'}`}
                            size="small"
                            variant={isVencido(cat.vencimiento) ? 'filled' : 'outlined'}
                            sx={isVencido(cat.vencimiento)
                                ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                            } />
                    ))}
                </Box>
                {conductor.numeroLicencia && (
                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ lineHeight: 1.2 }}>
                        {conductor.numeroLicencia}
                    </Typography>
                )}
            </Box>
        ),
    },
    {
        key: 'estado', label: 'Estado', cellSx: { py: 1.5 },
        render: (conductor) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    ...(conductor.estadoEfectivo === 'en_ruta'
                        ? { backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }
                        : { backgroundColor: 'transparent', border: '2px solid #10b981' })
                }} />
                <Typography variant="body2" sx={{
                    fontSize: '0.82rem', fontWeight: 500,
                    color: conductor.estadoEfectivo === 'en_ruta' ? '#3B82F6' : '#10b981',
                }}>
                    {conductor.estadoEfectivo === 'en_ruta' ? 'En Ruta' : 'Disponible'}
                </Typography>
            </Box>
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (conductor) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_CONDUCTOR) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(conductor)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                    conductor.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEditar(conductor)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_CONDUCTOR) && (
                    <ToggleSwitch id={conductor.idConductor} checked={conductor.habilitado} onChange={() => onToggleHabilitado(conductor)} />
                )}
            </Box>
        ),
    },
]

export default useConductorColumns
