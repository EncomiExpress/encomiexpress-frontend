import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'

const useRolColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado }) => [
  {
    key: 'nombre', label: 'Rol', sortField: 'nombre', width: '30%',
    render: (rol) => (
      <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
        {rol.nombre}
      </Typography>
    ),
  },
  {
    key: 'descripcion', label: 'Descripción', width: '40%', cellSx: { py: 1.5 },
    render: (rol) => (
      <Typography variant="body2" color={theme.palette.text.secondary} sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {rol.descripcion || 'Sin descripción'}
      </Typography>
    ),
  },
  {
    key: 'permisos', label: 'Permisos', width: '25%', cellSx: { py: 1.5 },
    render: (rol) => (
      <Chip
        label={`${rol.permisos?.length || 0} permisos`}
        size="small"
        variant="outlined"
        sx={{ backgroundColor: 'transparent', color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10, borderColor: theme.palette.divider }}
      />
    ),
  },
  {
    key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
    render: (rol) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {tienePermiso(PERMISOS.CONSULTAR_ROL) && (
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              onClick={(e) => { e.currentTarget.blur(); onConsultar(rol) }}
              sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        {tienePermiso(PERMISOS.ACTUALIZAR_ROL) && (
          rol.id === 1 ? (
            <Tooltip title="El rol de administrador no se puede modificar">
              <span>
                <IconButton size="small" disabled>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          ) : rol.habilitado === false ? (
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
                onClick={(e) => { e.currentTarget.blur(); onEditar(rol) }}
                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )
        )}
        {tienePermiso(PERMISOS.INHABILITAR_ROL) && (
          <ToggleSwitch id={rol.id} checked={rol.habilitado} onChange={() => onToggleHabilitado(rol.id, rol.nombre, rol.habilitado)} />
        )}
      </Box>
    ),
  },
]

export default useRolColumns
