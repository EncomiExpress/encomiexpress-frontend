import { useState } from 'react'
import { Box, Typography, TextField, Button, Paper, Alert, MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton } from '@mui/material'
import { Person, Email, Lock, Badge, Business, Save, Clear } from '@mui/icons-material'
import { useAuth, ROLES } from '../../Context/AuthContext'

const RegistrarUsuario = () => {
  const { tienePermiso, registrarUsuario, getUsuarios } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    iniciales: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setMensaje('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.email || !formData.password || !formData.rol || !formData.iniciales) {
      setError('Todos los campos son requeridos')
      return
    }

    registrarUsuario(formData)
    
    setMensaje('Usuario registrado correctamente')
    setError('')
    
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '',
      iniciales: ''
    })
    
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleLimpiar = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '',
      iniciales: ''
    })
    setMensaje('')
    setError('')
  }

  if (!tienePermiso('registrar_usuario')) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            No tienes permisos para registrar usuarios.
          </Alert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Person sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Registrar Nuevo Usuario
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Ingresa los datos del nuevo usuario
            </Typography>
          </Box>
        </Box>

        {mensaje && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {mensaje}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Nombre completo */}
            <TextField
              fullWidth
              label="Nombre completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Correo electrónico */}
            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="juan@ejemplo.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Contraseña */}
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      {showPassword ? <Lock /> : <Lock />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Rol */}
            <FormControl fullWidth required sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#CC1818' },
                '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
              },
            }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>Rol</InputLabel>
              <Select
                name="rol"
                value={formData.rol}
                label="Rol"
                onChange={handleChange}
              >
                {Object.values(ROLES).map((rol) => (
                  <MenuItem key={rol.id} value={rol.nombre}>
                    {rol.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Iniciales */}
            <TextField
              fullWidth
              label="Iniciales"
              name="iniciales"
              value={formData.iniciales}
              onChange={handleChange}
              required
              placeholder="Ej: JP"
              inputProps={{ maxLength: 3 }}
              helperText="Máximo 3 caracteres (ej: VP, JG, MV)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />
            
            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={<Save />}
                sx={{ 
                  backgroundColor: '#CC1818', 
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)',
                  '&:hover': { 
                    backgroundColor: '#b91c1c',
                    boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)'
                  },
                }}
              >
                Registrar
              </Button>
              <Button 
                type="button" 
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleLimpiar}
                sx={{ 
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { 
                    borderColor: '#94a3b8',
                    backgroundColor: '#f8fafc'
                  },
                }}
              >
                Limpiar
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarUsuario
