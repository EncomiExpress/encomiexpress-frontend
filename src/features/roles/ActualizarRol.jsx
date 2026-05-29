import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material'
import { Security, Close, SaveOutlined } from '@mui/icons-material'
import { MODULOS, ROLES, useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
  FormField, PrimaryButton, SecondaryButton,
  FormButtonGroup
} from '../../shared/components/FormularioEstandarizado.jsx'

const ActualizarRol = ({ open, onClose, rol: rolProp, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sinCambios, setSinCambios] = useState(false)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [formOriginal, setFormOriginal] = useState(null)
  const [permisosDisponibles, setPermisosDisponibles] = useState([])

  const { getPermisosBackend, actualizarRolBackend } = useAuth()
  const theme = useTheme()

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

  useEffect(() => {
    if (rolProp) {
      const nuevoForm = {
        nombre: rolProp.nombre || '',
        permisos: (rolProp.permisos || []).map(p => typeof p === 'string' ? p : p.nombre)
      }
      setFormData(nuevoForm)
      setFormOriginal(nuevoForm)
      setSinCambios(false)
      setIntentoGuardar(false)
    }
  }, [rolProp])

  useEffect(() => {
    if (formOriginal) {
      setSinCambios(
        formData.nombre === formOriginal.nombre &&
        JSON.stringify(formData.permisos.sort()) === JSON.stringify(formOriginal.permisos.sort())
      )
    }
  }, [formData, formOriginal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIntentoGuardar(true)

    if (!formData.nombre.trim() && !sinCambios) {
      setError('El nombre del rol es requerido')
      return
    }

    if (formData.permisos.length === 0 && !sinCambios) {
      setError('Debe seleccionar al menos un permiso')
      return
    }

    if (sinCambios) {
      setError('')
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

      const respuesta = await actualizarRolBackend(rolProp.idRol || rolProp.id, formData.nombre, idsPermisos, rolProp.habilitado)

      if (respuesta.success) {
        onSuccess && onSuccess()
        onClose()
      } else {
        setError(respuesta.message || 'Error al actualizar el rol')
      }
    } catch (err) {
      setError('Error al actualizar el rol')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh' } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Actualizar Rol
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            Modifica los permisos del rol.
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {intentoGuardar && sinCambios && !error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setIntentoGuardar(false)}>
            No has realizado ningún cambio. Los permisos del rol ya están actualizados.
          </Alert>
        )}
        {error && !(intentoGuardar && sinCambios) && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', paddingTop: 20 }}>
          <FormField
            label="Nombre del Rol"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Administrador"
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 700, color: theme.palette.text.primary }}>
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
        </form>
      </DialogContent>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 2, pt: 2, pr: 3, borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Box />
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={onClose} disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disableRipple
            disabled={enviando}
            endIcon={enviando ? undefined : <SaveOutlined />}
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
              '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: '#9E9E9E' },
            }}
          >
            {enviando ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarRol

