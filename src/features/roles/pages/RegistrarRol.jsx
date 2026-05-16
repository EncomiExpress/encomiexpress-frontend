import theme from '../../../shared/styles/theme.js'
import { useState, useEffect } from 'react'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert, IconButton, Snackbar, Dialog, DialogTitle, DialogContent, Button } from '@mui/material'
import { Security, Close, CheckOutlined } from '@mui/icons-material'
import { useAuth, PERMISOS, MODULOS } from '../../../shared/contexts/AuthContext'
import { 
  FormField, 
  FormAlert 
} from '../../../shared/components/FormularioEstandarizado'

const COLORS = theme.palette

const RegistrarRol = ({ open, onClose, onSuccess }) => {
  const { tienePermiso, registrarRol, getPermisosBackend } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [permisosDisponibles, setPermisosDisponibles] = useState([])

  const modulos = Object.entries(MODULOS)

  // Cargar permisos disponibles desde el backend al montar
  useEffect(() => {
    const cargarPermisos = async () => {
      const respuesta = await getPermisosBackend()
      if (respuesta.success) {
        setPermisosDisponibles(respuesta.data || [])
      }
    }
    cargarPermisos()
  }, [getPermisosBackend])

   const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      setError('El nombre del rol es requerido')
      return
    }

    if (formData.permisos.length === 0) {
      setError('Debe seleccionar al menos un permiso')
      return
    }

    setMensaje('')
    setError('')
    setEnviando(true)
    try {
      // Convertir nombres de permisos a IDs numéricos
      const idsPermisos = formData.permisos
        .map(nombrePermiso => {
          const permiso = permisosDisponibles.find(p => p.nombre === nombrePermiso)
          return permiso ? permiso.idPermiso || permiso.id : null
        })
        .filter(id => id !== null)

      const respuesta = await registrarRol(formData.nombre, idsPermisos)

      if (respuesta.success) {
        onSuccess && onSuccess()
        handleClose()
        setMensaje('Rol registrado exitosamente')
      } else {
        setError(respuesta.message || 'Error al registrar el rol')
      }
    } catch (err) {
      setError('Error al registrar el rol')
    } finally {
      setEnviando(false)
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: '',
      permisos: []
    })
    setError('')
    setMensaje('')
    onClose()
  }

  const getPermisoLabel = (permiso) => {
    const labels = {
      'registrar_usuario': 'Registrar',
      'listar_usuario': 'Listar',
      'consultar_usuario': 'Consultar',
      'actualizar_usuario': 'Actualizar',
      'inhabilitar_usuario': 'Inhabilitar',
      'registrar_rol': 'Registrar',
      'listar_rol': 'Listar',
      'consultar_rol': 'Consultar',
      'actualizar_rol': 'Actualizar',
      'registrar_cliente': 'Registrar',
      'listar_cliente': 'Listar',
      'consultar_cliente': 'Consultar',
      'actualizar_cliente': 'Actualizar',
      'inhabilitar_cliente': 'Inhabilitar',
      'registrar_vehiculo': 'Registrar',
      'listar_vehiculo': 'Listar',
      'consultar_vehiculo': 'Consultar',
      'actualizar_vehiculo': 'Actualizar',
      'registrar_conductor': 'Registrar',
      'listar_conductor': 'Listar',
      'consultar_conductor': 'Consultar',
      'actualizar_conductor': 'Actualizar',
      'registrar_destino': 'Registrar',
      'listar_destino': 'Listar',
      'consultar_destino': 'Consultar',
      'actualizar_destino': 'Actualizar',
      'registrar_ruta': 'Registrar',
      'listar_ruta': 'Listar',
      'consultar_ruta': 'Consultar',
      'actualizar_ruta': 'Actualizar',
      'registrar_encomienda': 'Registrar',
      'listar_encomienda': 'Listar',
      'consultar_encomienda': 'Consultar',
      'actualizar_encomienda': 'Actualizar',
      'registrar_anticipo': 'Registrar',
      'listar_anticipo': 'Listar',
      'consultar_anticipo': 'Consultar',
      'actualizar_anticipo': 'Actualizar',
      'registrar_venta': 'Registrar',
    }
    return labels[permiso] || permiso
  }

  if (!tienePermiso(PERMISOS.REGISTRAR_ROL)) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 3 } } }}>
        <FormAlert severity="error">
          No tienes permisos para registrar roles.
        </FormAlert>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh' } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Registrar Nuevo Rol
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            Selecciona los permisos del nuevo rol.
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', paddingTop: 20 }}>
          <Box sx={{ mb: 2 }}>
            <FormField
              label="Nombre del Rol"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Gerente, Vendedor, Conductor"
              required
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1, fontWeight: 700, color: theme.palette.text.primary }}>
            Permisos del Rol
          </Typography>

          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
            {modulos.map(([moduloKey, modulo]) => (
              <Paper 
                key={moduloKey}
                elevation={0}
                sx={{ 
                  border: '1px solid #E0E0E0', 
                  borderRadius: 2, 
                  mb: 1.5,
                  backgroundColor: '#F8F9FA'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: '#F8F9FA'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {modulo.nombre}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={modulo.permisos.every(p => formData.permisos.includes(p))}
                        indeterminate={
                          modulo.permisos.filter(p => formData.permisos.includes(p)).length > 0 &&
                          modulo.permisos.some(p => !formData.permisos.includes(p))
                        }
                        onChange={() => {
                          const todosSeleccionados = modulo.permisos.every(p => formData.permisos.includes(p))
                          if (todosSeleccionados) {
                            setFormData(prev => ({
                              ...prev,
                              permisos: prev.permisos.filter(p => !modulo.permisos.includes(p))
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permisos: [...new Set([...prev.permisos, ...modulo.permisos])]
                            }))
                          }
                        }}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&.Mui-checked': { color: theme.palette.primary.main },
                          '&.MuiCheckbox-indeterminate': { color: theme.palette.primary.main }
                        }}
                      />
                    }
                    label={`${modulo.permisos.filter(p => formData.permisos.includes(p)).length}/${modulo.permisos.length}`}
                  />
                </Box>

                <Box sx={{ p: 1.5, backgroundColor: 'white' }}>
                  <Grid container spacing={0.5}>
                    {modulo.permisos.map((permiso) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={permiso}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permisos.includes(permiso)}
                              onChange={(e) => {
                                const newPermisos = e.target.checked
                                  ? [...formData.permisos, permiso]
                                  : formData.permisos.filter(p => p !== permiso)
                                setFormData({ ...formData, permisos: newPermisos })
                              }}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&.Mui-checked': { color: theme.palette.primary.main }
                              }}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {permiso.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            ))}
          </Box>

          <Box sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}`,
            }}>
              <Box />
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button onClick={handleClose} disableRipple
                  sx={{
                    textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                    '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                  }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disableRipple
                  disabled={enviando}
                  endIcon={enviando ? undefined : <CheckOutlined />}
                  sx={{
                    textTransform: 'none', borderRadius: 2, fontWeight: 600,
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                    '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: '#9E9E9E' },
                  }}>
                  {enviando ? 'Registrando...' : 'Registrar'}
                </Button>
              </Box>
            </Box>
        </form>
      </DialogContent>

      <Snackbar open={!!mensaje} autoHideDuration={2500} onClose={() => setMensaje('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setMensaje('')}>
          ¡Rol registrado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default RegistrarRol