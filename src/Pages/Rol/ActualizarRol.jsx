import { useState, useEffect } from 'react'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material'
import { Security, Close } from '@mui/icons-material'
import { MODULOS, ROLES } from '../../Context/AuthContext'
import { 
  FormField, PrimaryButton, SecondaryButton, 
  FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const COLORS = {
  primary: '#CC1818',
  primaryLight: '#FFE8E8',
  secondary: '#1A2E6E',
  text: '#1a0e0c',
  textMuted: '#8A94A6',
  border: '#E0E0E0',
  hoverBg: '#F9F9F9',
}

const ActualizarRol = ({ open, onClose, rol: rolProp, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (rolProp) {
      setFormData({
        nombre: rolProp.nombre || '',
        permisos: rolProp.permisos || []
      })
    }
  }, [rolProp])

  const modulos = Object.entries(MODULOS)

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

    try {
      setMensaje('Rol actualizado exitosamente')
      setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al actualizar el rol')
    }
  }

  const handleCancelar = () => {
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh' } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Actualizar Rol
          </Typography>
          <Typography variant="body2" color={COLORS.textMuted}>
            Modifica los permisos del rol.
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#8A94A6' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {error && (
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
            disabled
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 700, color: '#1a0e0c' }}>
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
                    <Security sx={{ color: '#CC1818', fontSize: 20 }} />
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
                          color: '#CC1818',
                          '&.Mui-checked': { color: '#CC1818' },
                          '&.MuiCheckbox-indeterminate': { color: '#CC1818' }
                        }}
                      />
                    }
                    label={`${modulo.permisos.filter(p => formData.permisos.includes(p)).length}/${modulo.permisos.length}`}
                  />
                </Box>

                <Box sx={{ p: 1.5, backgroundColor: 'white' }}>
                  <Grid container spacing={0.5}>
                    {modulo.permisos.map((permiso) => (
                      <Grid item xs={6} sm={4} md={3} key={permiso}>
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
                                color: '#CC1818',
                                '&.Mui-checked': { color: '#CC1818' }
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
              mt: 3, pt: 2, borderTop: `1px solid ${COLORS.border}`,
            }}>
              <Box />
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button onClick={handleCancelar} disableRipple
                  sx={{
                    textTransform: 'none', color: COLORS.textMuted, fontWeight: 500, borderRadius: 2,
                    '&:hover': { backgroundColor: COLORS.hoverBg, color: COLORS.text },
                  }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disableRipple
                  sx={{
                    textTransform: 'none', borderRadius: 2, fontWeight: 600,
                    backgroundColor: COLORS.primary,
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                  }}>
                  Actualizar Rol
                </Button>
              </Box>
            </Box>
        </form>
      </DialogContent>

      <Snackbar open={!!mensaje} autoHideDuration={2500} onClose={() => setMensaje('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setMensaje('')}>
          ¡Rol actualizado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default ActualizarRol