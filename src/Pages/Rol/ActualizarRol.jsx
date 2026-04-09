import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert } from '@mui/material'
import { Security } from '@mui/icons-material'
import { MODULOS, ROLES } from '../../Context/AuthContext'
import { 
  FormField, PrimaryButton, SecondaryButton, 
  FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const ActualizarRol = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const rolId = parseInt(id)
    const rol = Object.values(ROLES).find(r => r.id === rolId)
    if (rol) {
      setFormData({
        nombre: rol.nombre || '',
        permisos: rol.permisos || []
      })
    }
  }, [id, ROLES])

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
      setTimeout(() => navigate('/roles/listar'), 1500)
    } catch (err) {
      setError(err.message || 'Error al actualizar el rol')
    }
  }

  return (
    <Box sx={{ p: 2.5, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Security sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Actualizar Rol
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edita los permisos del rol en el sistema
          </Typography>
        </Box>
      </Box>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: `1px solid #E0E0E0`, borderRadius: 3, p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
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

          <FormButtonGroup sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
            <SecondaryButton onClick={() => navigate('/roles/listar')}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit">
              Actualizar Rol
            </PrimaryButton>
          </FormButtonGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default ActualizarRol
