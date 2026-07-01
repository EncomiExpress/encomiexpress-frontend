import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Paper, Alert, Grid, MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material'
import {
  EmailOutlined as Email,
  LockOutlined as Lock,
  VisibilityOutlined as Visibility,
  VisibilityOffOutlined as VisibilityOff,
  PersonAdd,
  Login as LoginIcon,
  Person,
  Badge,
  ArrowBack,
  LockResetOutlined as LockResetIcon,
} from '@mui/icons-material'
import { useAuth, ROLES } from '../../shared/contexts/AuthContext.jsx'
import { recuperarPassword } from '../../shared/services/authService.js'
import LoadingScreen from '../../shared/components/LoadingScreen.jsx'
import logo from '../../assets/logo.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [camposError, setCamposError] = useState({ email: '', password: '' })
  const [openRegister, setOpenRegister] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [apiCargando, setApiCargando] = useState(false)
  const [registerData, setRegisterData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    iniciales: ''
  })
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')

  // Estados para recuperar contraseña
  const [openRecuperar, setOpenRecuperar]       = useState(false)
  const [recuperarEmail, setRecuperarEmail]     = useState('')
  const [recuperarLoading, setRecuperarLoading] = useState(false)
  const [recuperarMensaje, setRecuperarMensaje] = useState(null)

  const { login, registrarUsuario, usuario, loading, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  useEffect(() => {
    if (!loading && !cargando && !apiCargando && usuario) {
      navigate('/dashboard', { replace: true })
    }
  }, [usuario, loading, cargando, apiCargando, navigate])

  const validarFormulario = () => {
    const errores = { email: '', password: '' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) errores.email = 'El correo es obligatorio'
    else if (!emailRegex.test(email.trim())) errores.email = 'Ingresa un correo válido (ejemplo@dominio.com)'
    if (!password) errores.password = 'La contraseña es obligatoria'
    setCamposError(errores)
    return !errores.email && !errores.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validarFormulario()) return
    setApiCargando(true)
    try {
      const resultado = await login(email, password)
      if (resultado.success) {
        setApiCargando(false)
        setCargando(true)
        setTimeout(() => { navigate('/dashboard', { replace: true }) }, 2500)
      } else {
        setApiCargando(false)
        setError(resultado.mensaje)
      }
    } catch {
      setApiCargando(false)
      setError('Error al iniciar sesión')
    }
  }

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setRegisterError('')
    if (!registerData.nombre || !registerData.email || !registerData.password || !registerData.rol || !registerData.iniciales) {
      setRegisterError('Todos los campos son requeridos')
      return
    }
    try {
      registrarUsuario(registerData)
      setRegisterSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.')
      setOpenRegister(false)
      setRegisterData({ nombre: '', email: '', password: '', rol: '', iniciales: '' })
    } catch {
      setRegisterError('Error al registrar usuario')
    }
  }

  const handleRecuperar = async () => {
    if (!recuperarEmail) return
    setRecuperarLoading(true)
    setRecuperarMensaje(null)
    try {
      await recuperarPassword(recuperarEmail)
      setRecuperarMensaje({ tipo: 'success', texto: 'Se envió una contraseña temporal a tu correo.' })
    } catch (err) {
      setRecuperarMensaje({ tipo: 'error', texto: err.message || 'No se pudo enviar el correo.' })
    } finally {
      setRecuperarLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.background.default,
      py: 4, px: 2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {cargando && <LoadingScreen mensaje="Preparando panel de administrador..." />}

      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: theme.palette.gradient.navbar, zIndex: 20,
      }} />

      <Box sx={{ position: 'absolute', bottom: -80, left: -80, zIndex: 0, opacity: 0.12, transform: 'rotate(-5deg)' }}>
        <svg width="520" height="520" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 280,90 150,160 20,90" fill="#e84040" />
          <polygon points="20,90 150,160 150,280 20,210" fill={theme.palette.primary.main} />
          <polygon points="280,90 150,160 150,280 280,210" fill="#9b1010" />
          <polygon points="150,20 280,90 150,160 20,90" fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
          <polygon points="20,90 150,160 150,280 20,210" fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
          <polygon points="280,90 150,160 150,280 280,210" fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
        </svg>
      </Box>

      <Box sx={{ position: 'absolute', top: -80, right: -80, zIndex: 0, opacity: 0.09, transform: 'rotate(8deg)' }}>
        <svg width="580" height="580" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 280,90 150,160 20,90" fill="#2a3f8f" />
          <polygon points="20,90 150,160 150,280 20,210" fill={theme.palette.secondary.main} />
          <polygon points="280,90 150,160 150,280 280,210" fill="#0f1c45" />
          <polygon points="150,20 280,90 150,160 20,90" fill="none" stroke={theme.palette.secondary.main} strokeWidth="2.5" />
          <polygon points="20,90 150,160 150,280 20,210" fill="none" stroke={theme.palette.secondary.main} strokeWidth="2.5" />
          <polygon points="280,90 150,160 150,280 280,210" fill="none" stroke={theme.palette.secondary.main} strokeWidth="2.5" />
        </svg>
      </Box>

      <Button
        component={Link} to="/" startIcon={<ArrowBack />}
        sx={{
          position: 'absolute', top: 20, left: 24,
          color: theme.palette.text.secondary, textTransform: 'none',
          fontWeight: 600, fontSize: '0.85rem', borderRadius: 2, px: 2, py: 0.8,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper, zIndex: 20,
          '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.primary.main },
          transition: 'all 0.2s ease',
        }}
      >
        Volver al inicio
      </Button>

      <Paper elevation={0} sx={{
        p: 0, width: '100%', maxWidth: 440, borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden', position: 'relative', zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <Box sx={{
          px: 4, py: 4, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 1.5,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{ width: 140, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: theme.palette.text.dark, fontWeight: 700, fontSize: '1.5rem', mb: 0.5, lineHeight: 1.2, fontFamily: 'Cambria, Georgia, serif' }}>
              Bienvenido
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              Ingresa tus credenciales para acceder
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          {sessionExpired && !error && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              Tu sesión ha expirado. Inicia sesión nuevamente para continuar.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Correo electrónico" type="email"
              value={email} onChange={(e) => { setEmail(e.target.value); setCamposError(prev => ({ ...prev, email: '' })); setError('') }}
              required placeholder="correo@ejemplo.com"
              error={!!camposError.email} helperText={camposError.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8b8382' }} /></InputAdornment> }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main } },
                '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
              }}
            />
            <TextField
              fullWidth label="Contraseña" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => { setPassword(e.target.value); setCamposError(prev => ({ ...prev, password: '' })); setError('') }}
              required placeholder="••••••"
              error={!!camposError.password} helperText={camposError.password}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#8b8382' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#8b8382' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main } },
                '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
              }}
            />

            {/* ── ¿Olvidaste tu contraseña? ── */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Typography
                onClick={() => { setRecuperarEmail(''); setRecuperarMensaje(null); setOpenRecuperar(true) }}
                sx={{
                  fontSize: '0.8rem', color: theme.palette.secondary.main,
                  fontWeight: 600, cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" size="large"
              endIcon={<LoginIcon />} disabled={cargando || apiCargando}
              sx={{
                backgroundColor: theme.palette.primary.main, borderRadius: 2,
                py: 1.5, fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                boxShadow: `0 4px 14px ${theme.palette.primary.main}4D`,
                '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.main}66` },
              }}
            >
              {cargando || apiCargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>O</Typography>
          </Divider>

          <Box sx={{ p: 2.5, backgroundColor: theme.palette.background.subtle, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem', letterSpacing: '1px', mb: 1.5, fontWeight: 600 }}>
              USUARIO ADMINISTRADOR
            </Typography>
            <Typography sx={{ color: theme.palette.text.dark, fontSize: '0.75rem', fontFamily: 'monospace', display: 'block', mb: 0.5 }}>
              • admin@encomiexpress.com
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem', fontFamily: 'monospace', borderTop: `1px solid ${theme.palette.divider}`, pt: 1.5, display: 'block' }}>
              Contraseña: admin123
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── Dialog recuperar contraseña ── */}
      <Dialog
        open={openRecuperar}
        onClose={() => !recuperarLoading && setOpenRecuperar(false)}
        maxWidth="xs" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
{/* Cabecera con ícono */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          display: 'flex', alignItems: 'center', gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            backgroundColor: theme.palette.secondary.main + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LockResetIcon sx={{ fontSize: '1.4rem', color: theme.palette.secondary.main }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: theme.palette.text.dark, lineHeight: 1.2 }}>
              Recuperar contraseña
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: theme.palette.text.secondary, mt: 0.3 }}>
              Te enviaremos acceso temporal a tu correo
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            size="small"
            value={recuperarEmail}
            onChange={(e) => setRecuperarEmail(e.target.value)}
            disabled={recuperarLoading}
            placeholder="correo@ejemplo.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ fontSize: '1rem', color: '#8b8382' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main } },
              '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.secondary.main },
            }}
          />
          {recuperarMensaje && (
            <Alert severity={recuperarMensaje.tipo} sx={{ mt: 2, fontSize: '0.82rem', borderRadius: 2 }}>
              {recuperarMensaje.texto}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
          <Button
            onClick={() => setOpenRecuperar(false)}
            disabled={recuperarLoading}
            disableRipple
            sx={{
              textTransform: 'none', fontWeight: 500, borderRadius: 2,
              color: theme.palette.text.secondary,
              border: `1px solid ${theme.palette.divider}`,
              px: 2.5,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.dark },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRecuperar}
            variant="contained"
            disableRipple
            disabled={recuperarLoading || !recuperarEmail}
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600,
              minWidth: 110, px: 2.5,
              backgroundColor: theme.palette.secondary.main,
              boxShadow: `0 4px 14px ${theme.palette.secondary.main}4D`,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
                boxShadow: `0 6px 20px ${theme.palette.secondary.main}66`,
              },
            }}
          >
            {recuperarLoading
              ? <><CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} /> Enviando...</>
              : 'Enviar acceso'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog registro ── */}
      <Dialog open={openRegister} onClose={() => setOpenRegister(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          p: 3, textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography sx={{ color: theme.palette.text.dark, fontWeight: 700, fontSize: '1.1rem' }}>
            Crear Cuenta
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {registerSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{registerSuccess}</Alert>}
          {registerError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{registerError}</Alert>}
          <Box component="form" onSubmit={handleRegister}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Nombre completo" name="nombre" value={registerData.nombre} onChange={handleRegisterChange} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#8b8382' }} /></InputAdornment> }} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Correo electrónico" name="email" type="email" value={registerData.email} onChange={handleRegisterChange} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8b8382' }} /></InputAdornment> }} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Contraseña" name="password" type="password" value={registerData.password} onChange={handleRegisterChange} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#8b8382' }} /></InputAdornment> }} />
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select name="rol" value={registerData.rol} label="Rol" onChange={handleRegisterChange}>
                    {Object.values(ROLES).map((rol) => (
                      <MenuItem key={rol.id} value={rol.nombre}>{rol.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Iniciales" name="iniciales" value={registerData.iniciales} onChange={handleRegisterChange} required
                  inputProps={{ maxLength: 3 }} helperText="Ej: VP, JG, MV"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: '#8b8382' }} /></InputAdornment> }} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenRegister(false)} sx={{ color: 'rgba(33,33,33,0.45)' }}>Cancelar</Button>
          <Button onClick={handleRegister} variant="contained" startIcon={<PersonAdd />}
            sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, px: 3, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
            Registrarse
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Login