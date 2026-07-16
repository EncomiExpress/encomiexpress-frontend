import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Paper, Alert, InputAdornment, IconButton, Dialog, DialogContent, CircularProgress, Snackbar } from '@mui/material'
import {
  EmailOutlined as Email,
  LockOutlined as Lock,
  VisibilityOutlined as Visibility,
  VisibilityOffOutlined as VisibilityOff,
  Login as LoginIcon,
  ArrowBack,
  LockResetOutlined as LockResetIcon,
  Close,
} from '@mui/icons-material'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { recuperarPassword } from '../../shared/services/authService.js'
import LoadingScreen from '../../shared/components/LoadingScreen.jsx'
import useSlowRequest from '../../shared/hooks/useSlowRequest.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import logo from '../../assets/logo.png'
import logoDark from '../../assets/logoDark.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [camposError, setCamposError] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [apiCargando, setApiCargando] = useState(false)

  // Estados para recuperar contraseña
  const [openRecuperar, setOpenRecuperar]       = useState(false)
  const [recuperarEmail, setRecuperarEmail]     = useState('')
  const [recuperarLoading, setRecuperarLoading] = useState(false)
  const [recuperarMensaje, setRecuperarMensaje] = useState(null)

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

  const handleRecuperar = async () => {
    if (!recuperarEmail) return
    setRecuperarLoading(true)
    setRecuperarMensaje(null)
    try {
      const resultado = await recuperarPassword(recuperarEmail)
      setRecuperarMensaje({ tipo: 'success', texto: resultado.message })
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

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Correo electrónico" type="email"
              value={email} onChange={(e) => { setEmail(e.target.value); setCamposError(prev => ({ ...prev, email: '' })); setError('') }}
              required placeholder="correo@ejemplo.com"
              error={!!camposError.email} helperText={camposError.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#8b8382' }} /></InputAdornment> }}
              sx={[formFieldStyles, { mb: 1.5 }]}
            />
            <TextField
              fullWidth label="Contraseña" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => { setPassword(e.target.value); setCamposError(prev => ({ ...prev, password: '' })); setError('') }}
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
                onClick={() => { setRecuperarEmail(''); setRecuperarMensaje(null); setOpenRecuperar(true) }}
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

          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              ¿No estás registrado?{' '}
              <Button
                component={Link} to="/register" variant="text"
                sx={{
                  color: theme.palette.primary.main, fontWeight: 600, p: 0, minWidth: 'auto',
                  textTransform: 'none', '&:hover': { textDecoration: 'underline' },
                }}
              >
                Regístrate
              </Button>
            </Typography>
          </Box>

        </Box>
      </Paper>

      {/* ── Dialog recuperar contraseña ── */}
      <Dialog
        open={openRecuperar}
        onClose={() => !recuperarLoading && setOpenRecuperar(false)}
        maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
      >
        <DialogContent sx={{ p: 3, pb: 1, textAlign: 'center', position: 'relative' }}>
          <IconButton
            onClick={() => !recuperarLoading && setOpenRecuperar(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
          >
            <Close />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
            <Box sx={{ width: 67, height: 67, borderRadius: 2, backgroundColor: theme.palette.primary.main + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockResetIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                Recuperar contraseña
              </Typography>
              <Typography fontSize="1rem" color={theme.palette.text.secondary} sx={{ textAlign: 'center' }}>
                Ingresa tu correo registrado
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'left' }}>
            {recuperarMensaje && (
              <Alert severity={recuperarMensaje.tipo} sx={{ mb: 2, fontSize: '0.82rem', borderRadius: 2 }}>
                {recuperarMensaje.texto}
              </Alert>
            )}
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              value={recuperarEmail}
              onChange={(e) => {
                setRecuperarEmail(e.target.value)
                setRecuperarMensaje(null)
              }}
              disabled={recuperarLoading}
              placeholder="correo@ejemplo.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
              sx={formFieldStyles}
            />
          </Box>
        </DialogContent>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
          <Button
            onClick={() => setOpenRecuperar(false)}
            disabled={recuperarLoading}
            disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
              px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRecuperar}
            variant="contained"
            disableRipple
            disabled={recuperarLoading || !recuperarEmail || recuperarMensaje?.tipo === 'success'}
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 110, px: 5, py: 0.76, fontSize: '0.875rem',
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}
          >
            {recuperarLoading
              ? <><CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} /> Enviando...</>
              : recuperarMensaje?.tipo === 'success'
                ? 'Correo enviado'
                : 'Enviar enlace'
            }
          </Button>
        </Box>
      </Dialog>

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