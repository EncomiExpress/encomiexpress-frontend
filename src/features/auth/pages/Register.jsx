import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, TextField, Button, Typography, Paper, Alert, MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton, Grid } from '@mui/material'
import {
  PersonOutline as Person,
  EmailOutlined as Email,
  LockOutlined as Lock,
  BadgeOutlined as Badge,
  PhoneOutlined as Phone,
  VisibilityOutlined as Visibility,
  VisibilityOffOutlined as VisibilityOff,
  ArrowBack,
  PersonAdd
} from '@mui/icons-material'
import { useAuth, ROLES } from '../../../shared/contexts/AuthContext'
import logo from '../../../assets/logo.png'

const TIPOS_IDENTIFICACION = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PAS', label: 'Pasaporte' },
]

const Register = () => {
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    idRol: 2,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { registrarUsuario, usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (usuario) {
      navigate('/dashboard')
    }
  }, [usuario, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const getIniciales = () => {
    const nombre = formData.nombre.trim()
    const apellido = formData.apellido.trim()
    if (!nombre && !apellido) return ''
    const inicialNombre = nombre.split(' ').map(n => n[0]).join('').substring(0, 2)
    const inicialApellido = apellido.split(' ').map(n => n[0]).join('').substring(0, 2)
    return (inicialNombre + inicialApellido).toUpperCase().substring(0, 3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, email, password, idRol } = formData

    if (!tipoIdentificacion || !numeroIdentificacion || !nombre || !apellido || !email || !password) {
      setError('Todos los campos son requeridos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const datosRegistro = {
        ...formData,
        idRol: parseInt(idRol),
      }

      const resultado = await registrarUsuario(datosRegistro)

      if (resultado.success) {
        setSuccess('Usuario registrado correctamente. Redirigiendo...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setError(resultado.mensaje || 'Error al registrar usuario')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        py: 4,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Barra superior roja */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)',
        zIndex: 20,
      }} />

      {/* Cubo decorativo — abajo izquierda */}
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, zIndex: 0, opacity: 0.12, transform: 'rotate(-5deg)' }}>
        <svg width="520" height="520" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 280,90 150,160 20,90" fill="#e84040" />
          <polygon points="20,90 150,160 150,280 20,210" fill="#CC1818" />
          <polygon points="280,90 150,160 150,280 280,210" fill="#9b1010" />
          <polygon points="150,20 280,90 150,160 20,90" fill="none" stroke="#CC1818" strokeWidth="2.5" />
          <polygon points="20,90 150,160 150,280 20,210" fill="none" stroke="#CC1818" strokeWidth="2.5" />
          <polygon points="280,90 150,160 150,280 280,210" fill="none" stroke="#CC1818" strokeWidth="2.5" />
        </svg>
      </Box>

      {/* Cubo decorativo — arriba derecha */}
      <Box sx={{ position: 'absolute', top: -80, right: -80, zIndex: 0, opacity: 0.09, transform: 'rotate(8deg)' }}>
        <svg width="580" height="580" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 280,90 150,160 20,90" fill="#2a3f8f" />
          <polygon points="20,90 150,160 150,280 20,210" fill="#1a2e6e" />
          <polygon points="280,90 150,160 150,280 280,210" fill="#0f1c45" />
          <polygon points="150,20 280,90 150,160 20,90" fill="none" stroke="#1a2e6e" strokeWidth="2.5" />
          <polygon points="20,90 150,160 150,280 20,210" fill="none" stroke="#1a2e6e" strokeWidth="2.5" />
          <polygon points="280,90 150,160 150,280 280,210" fill="none" stroke="#1a2e6e" strokeWidth="2.5" />
        </svg>
      </Box>

      {/* Botón volver al inicio */}
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBack />}
        sx={{
          position: 'absolute',
          top: 20,
          left: 24,
          color: 'rgba(33,33,33,0.6)',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.85rem',
          borderRadius: 2,
          px: 2,
          py: 0.8,
          border: '1px solid rgba(26,46,110,0.15)',
          backgroundColor: 'white',
          zIndex: 20,
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: 'rgba(26,46,110,0.2)',
            color: '#CC1818',
          },
          transition: 'all 0.2s ease',
        }}
      >
        Volver al inicio
      </Button>

      {/* Formulario */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          width: '100%',
          maxWidth: 700,
          borderRadius: 4,
          backgroundColor: 'white',
          border: '1px solid rgba(26,46,110,0.1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header: logo arriba centrado, texto debajo */}
        <Box sx={{
          px: 4,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(26,46,110,0.08)',
        }}>
          <Box sx={{
            width: 140,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#212121', fontWeight: 700, fontSize: '1.5rem', mb: 0.5, lineHeight: 1.2, fontFamily: 'Cambria, Georgia, serif' }}>
              Crear Cuenta
            </Typography>
            <Typography sx={{ color: 'rgba(33,33,33,0.45)', fontSize: '0.875rem' }}>
              Ingresa tus datos para registrarte
            </Typography>
          </Box>
        </Box>

        {/* Cuerpo */}
        <Box sx={{ p: 4 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Columna izquierda */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth required sx={{ mb: 2.5 }}>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>
                    Tipo de Identificación
                  </InputLabel>
                  <Select
                    name="tipoIdentificacion"
                    value={formData.tipoIdentificacion}
                    label="Tipo de Identificación"
                    onChange={handleChange}
                  >
                    {TIPOS_IDENTIFICACION.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Número de Identificación"
                  name="numeroIdentificacion"
                  value={formData.numeroIdentificacion}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 12345678"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge sx={{ color: '#8b8382' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#CC1818' } },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Nombre(s)"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Juan Carlos"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#8b8382' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#CC1818' } },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Apellido(s)"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Pérez Gómez"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#8b8382' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#CC1818' } },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
                  }}
                />
              </Box>

              {/* Columna derecha */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#8b8382' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#CC1818' } },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#8b8382' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#CC1818' } },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#8b8382' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#8b8382' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#CC1818' } },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
                  }}
                />

                <FormControl fullWidth required sx={{ mb: 2.5 }}>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>
                    Rol
                  </InputLabel>
                  <Select
                    name="idRol"
                    value={formData.idRol}
                    label="Rol"
                    onChange={handleChange}
                  >
                    {Object.values(ROLES).filter(r => r.nombre !== 'Administrador').map((rol) => (
                      <MenuItem key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Iniciales automáticas */}
            <Box sx={{
              p: 1.5,
              mb: 3,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid rgba(26,46,110,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Badge sx={{ color: '#8b8382' }} />
              <Typography sx={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9rem' }}>
                Iniciales:
              </Typography>
              <Typography sx={{ color: '#CC1818', fontWeight: 700, fontSize: '1rem' }}>
                {getIniciales() || '---'}
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<PersonAdd />}
              sx={{
                backgroundColor: '#CC1818',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)',
                '&:hover': {
                  backgroundColor: '#b91c1c',
                  boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                }
              }}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(33,33,33,0.45)', fontSize: '0.875rem' }}>
              ¿Ya tienes cuenta?{' '}
              <Button
                component={Link}
                to="/login"
                variant="text"
                sx={{
                  color: '#CC1818',
                  fontWeight: 600,
                  p: 0,
                  minWidth: 'auto',
                  textTransform: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Iniciar Sesión
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Register
