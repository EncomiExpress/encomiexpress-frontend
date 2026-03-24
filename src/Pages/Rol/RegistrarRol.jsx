import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Paper, FormControlLabel, Checkbox, Grid, Alert } from '@mui/material'
import { Security } from '@mui/icons-material'
import { useAuth, PERMISOS } from '../../Context/AuthContext'
import { 
  theme, FormField, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const RegistrarRol = () => {
  const { tienePermiso, registrarRol, getRoles } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const todosLosPermisos = Object.values(PERMISOS)

  const permisosPorCategoria = {
    'Registrar': Object.values(PERMISOS).filter(p => p.startsWith('registrar')),
    'Listar': Object.values(PERMISOS).filter(p => p.startsWith('listar')),
    'Consultar': Object.values(PERMISOS).filter(p => p.startsWith('consultar')),
    'Actualizar': Object.values(PERMISOS).filter(p => p.startsWith('actualizar')),
    'Inhabilitar': Object.values(PERMISOS).filter(p => p.startsWith('inhabilitar')),
  }

  const handlePermisoChange = (permiso) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter(p => p !== permiso)
        : [...prev.permisos, permiso]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nombre) {
      setError('El nombre del rol es requerido')
      return
    }

    if (formData.permisos.length === 0) {
      setError('Debe seleccionar al menos un permiso')
      return
    }

    registrarRol(formData)
    
    setMensaje('Rol registrado correctamente')
    setError('')
    
    setFormData({
      nombre: '',
      permisos: []
    })
    
    setTimeout(() => setMensaje(''), 3000)
  }

  if (!tienePermiso(PERMISOS.REGISTRAR_ROL)) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800, mx: 'auto' }}>
          <FormAlert severity="error">
            No tienes permisos para registrar roles.
          </FormAlert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800, mx: 'auto' }}>
        <FormHeader 
          icon={Security} 
          title="Registrar Nuevo Rol" 
          subtitle="Configura los permisos del rol"
        />

        {mensaje && (
          <FormAlert severity="success">
            {mensaje}
          </FormAlert>
        )}

        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormField
                label="Nombre del rol"
                name="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Ej: Supervisor, Contador, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.secondary }}>
                Permisos del rol
              </Typography>
              
              {Object.entries(permisosPorCategoria).map(([categoria, permisos]) => (
                <Box key={categoria} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.secondary }}>
                    {categoria}
                  </Typography>
                  <Grid container spacing={1}>
                    {permisos.map(permiso => (
                      <Grid item xs={12} sm={6} md={4} key={permiso}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permisos.includes(permiso)}
                              onChange={() => handlePermisoChange(permiso)}
                              sx={{ color: theme.primary, '&.Mui-checked': { color: theme.primary } }}
                            />
                          }
                          label={permiso.replace(/_/g, ' ')}
                          sx={{ 
                            '& .MuiFormControlLabel-label': { fontSize: '0.85rem' },
                            mb: 0
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12}>
              <FormButtonGroup>
                <PrimaryButton children="Registrar" />
                <SecondaryButton 
                  onClick={() => navigate('/roles/listar')}
                  children="Cancelar"
                />
              </FormButtonGroup>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarRol
