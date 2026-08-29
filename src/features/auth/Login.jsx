import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Paper, Alert, InputAdornment, IconButton, CircularProgress, Snackbar } from '@mui/material'
import {
  EmailOutlined as Email,
  LockOutlined as Lock,
  VisibilityOutlined as Visibility,
  VisibilityOffOutlined as VisibilityOff,
  Login as LoginIcon,
  ArrowBack,
} from '@mui/icons-material'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import LoadingScreen from '../../shared/components/LoadingScreen.jsx'
import useSlowRequest from '../../shared/hooks/useSlowRequest.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import logo from '../../assets/logo.png'
import logoDark from '../../assets/logoDark.png'
import { validarEmailValor, validarPasswordValor } from './validations/authValidation.js'
import ModalRecuperarPassword from './components/ModalRecuperarPassword.jsx'

// Debe coincidir con PASSWORD_REGEX en shared/layouts/Header.jsx, features/auth/ResetearPassword.jsx
// y el validador del backend
const PASSWORD_HELP = 'El formato correcto es: debe tener mínimo una mayúscula, una minúscula, un número y un símbolo'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [camposError, setCamposError] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [apiCargando, setApiCargando] = useState(false)

  const [openRecuperar, setOpenRecuperar] = useState(false)

  const { login, usuario, loading, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const tardando = useSlowRequest(apiCargando)

  useEffect(() => {
    if (!loading && !cargando && !apiCargando && usuario) {
      navigate('/dashboard', { replace: true })
    }
  }, [usuario, loading, cargando, apiCargando, navigate])

  const validarFormulario = () => {
    const errores = { email: validarEmailValor(email), password: validarPasswordValor(password, PASSWORD_HELP) }
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
      {cargando && <LoadingScreen mensaje={<>Sesión iniciada correctamente:<br />Preparando panel de administrador...</>} />}

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
            <img src={theme.palette.mode === 'dark' ? logoDark : logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
              Ha pasado mucho tiempo desde tu última actividad. Inicia sesión de nuevo para continuar.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Correo electrónico" type="email"
              value={email} onChange={(e) => { setEmail(e.target.value); setCamposError(prev => ({ ...prev, email: '' })); setError('') }}
              onBlur={() => setCamposError(prev => ({ ...prev, email: validarEmailValor(email) }))}
              required placeholder="correo@ejemplo.com"
              error={!!camposError.email} helperText={camposError.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8b8382' }} /></InputAdornment> }}
              sx={[formFieldStyles, { mb: 1.5 }]}
            />
            <TextField
              fullWidth label="Contraseña" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => { setPassword(e.target.value); setCamposError(prev => ({ ...prev, password: '' })); setError('') }}
              onBlur={() => setCamposError(prev => ({ ...prev, password: validarPasswordValor(password, PASSWORD_HELP) }))}
              required
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
              sx={[formFieldStyles, { mb: 2 }]}
            />

            {/* ── ¿Olvidaste tu contraseña? ── */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Typography
                onClick={() => setOpenRecuperar(true)}
                sx={{
                  fontSize: '0.8rem', color: theme.palette.primary.main,
                  fontWeight: 600, cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" size="large"
              endIcon={cargando || apiCargando ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
              disabled={cargando || apiCargando}
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

        </Box>
      </Paper>

      <ModalRecuperarPassword open={openRecuperar} onClose={() => setOpenRecuperar(false)} />

      <Snackbar
        open={apiCargando && tardando}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            backgroundColor: theme.palette.status.info.bg,
            color: theme.palette.status.info.color,
            '& .MuiAlert-icon': { color: theme.palette.status.info.color },
          }}
        >
          Conectando con el servidor... esto puede tardar unos segundos.
        </Alert>
      </Snackbar>

    </Box>
  )
}

export default Login