import { useState } from 'react'
import { Box, Typography, TextField, Button, Paper, FormControlLabel, Checkbox, Grid, Alert } from '@mui/material'
import { useAuth, PERMISOS } from '../../Context/AuthContext'

const RegistrarRol = () => {
  const { tienePermiso, registrarRol, getRoles } = useAuth()
  
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No tienes permisos para registrar roles.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Registrar Nuevo Rol
      </Typography>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Nombre del rol"
                name="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                fullWidth
                required
                placeholder="Ej: Supervisor, Contador, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Permisos del rol
              </Typography>
              
              {Object.entries(permisosPorCategoria).map(([categoria, permisos]) => (
                <Box key={categoria} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1A2E6E' }}>
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
                              sx={{ color: '#CC1818', '&.Mui-checked': { color: '#CC1818' } }}
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
              <Box sx={{ mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#CC1818', 
                    '&:hover': { backgroundColor: '#a01515' },
                    mr: 2
                  }}
                >
                  Registrar
                </Button>
                <Button 
                  type="button" 
                  variant="outlined"
                  onClick={() => setFormData({ nombre: '', permisos: [] })}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarRol


