import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Paper, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material'
import {
  LockOutlined as Lock,
  VisibilityOutlined as Visibility,
  VisibilityOffOutlined as VisibilityOff,
  ArrowBack,
  CheckOutlined,
  LockResetOutlined as LockResetIcon,
} from '@mui/icons-material'
import { resetearPassword } from '../../shared/services/authService.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import logo from '../../assets/logo.png'
import logoDark from '../../assets/logoDark.png'

// Debe coincidir con PASSWORD_REGEX en Register.jsx, Header.jsx y el validador del backend
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,64}$/
const PASSWORD_HELP = '8-64 caracteres, con mayúsculas, minúsculas, números y un carácter especial'

// Sin enlace en ningún menú — se llega solo vía el correo de "¿Olvidaste tu contraseña?"
const ResetearPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [passwordNueva, setPasswordNueva] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)

  const theme = useTheme()
  const navigate = useNavigate()

  const validar = () => {
    const e = {}
    if (!passwordNueva) e.passwordNueva = 'La contraseña es obligatoria'
    else if (!PASSWORD_REGEX.test(passwordNueva)) e.passwordNueva = PASSWORD_HELP
    if (!confirmarPassword) e.confirmarPassword = 'Confirma la contraseña'
    else if (passwordNueva !== confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setError('')
    if (!token) {
      setError('Este enlace no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.')
      return
    }
    if (!validar()) return

    setLoading(true)
    try {
      await resetearPassword(token, passwordNueva)
      setExito(true)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.palette.background.default, py: 4, px: 2,
      position: 'relative', overflow: 'hidden',
    }}>
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
        component={Link} to="/login" startIcon={<ArrowBack />}
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
        Volver al inicio de sesión
      </Button>

      <Paper elevation={0} sx={{
        p: 0, width: '100%', maxWidth: 440, borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden', position: 'relative', zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <Box sx={{
          px: 4, py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{ width: 140, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={theme.palette.mode === 'dark' ? logoDark : logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: theme.palette.text.dark, fontWeight: 700, fontSize: '1.5rem', mb: 0.5, lineHeight: 1.2, fontFamily: 'Cambria, Georgia, serif' }}>
              Nueva contraseña
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              Elige la contraseña con la que vas a ingresar de ahora en adelante
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          {exito ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
              <Box sx={{ width: 67, height: 67, borderRadius: 2, backgroundColor: '#05966920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckOutlined sx={{ fontSize: 35, color: '#059669' }} />
              </Box>
              <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                ¡Contraseña actualizada!
              </Typography>
              <Typography fontSize="0.9rem" color={theme.palette.text.secondary}>
                Ya puedes iniciar sesión con tu nueva contraseña.
              </Typography>
              <Button
                onClick={() => navigate('/login')}
                variant="contained" fullWidth disableRipple
                sx={{
                  mt: 1, backgroundColor: theme.palette.primary.main, borderRadius: 2,
                  py: 1.5, fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                  boxShadow: `0 4px 14px ${theme.palette.primary.main}4D`,
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}
              >
                Ir a iniciar sesión
              </Button>
            </Box>
          ) : (
            <>
              {!token && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  Este enlace no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión, con el botón "¿Olvidaste tu contraseña?".
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth label="Nueva contraseña" type={showPassword ? 'text' : 'password'}
                    value={passwordNueva}
                    onChange={(e) => { setPasswordNueva(e.target.value); setErrores(prev => ({ ...prev, passwordNueva: '' })); setError('') }}
                    required disabled={!token}
                    error={!!errores.passwordNueva} helperText={errores.passwordNueva || PASSWORD_HELP}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(p => !p)} edge="end" sx={{ color: theme.palette.text.secondary }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      inputProps: { maxLength: 64 },
                    }}
                    sx={formFieldStyles}
                  />

                  <TextField
                    fullWidth label="Confirmar nueva contraseña" type={showConfirmarPassword ? 'text' : 'password'}
                    value={confirmarPassword}
                    onChange={(e) => { setConfirmarPassword(e.target.value); setErrores(prev => ({ ...prev, confirmarPassword: '' })); setError('') }}
                    required disabled={!token}
                    error={!!errores.confirmarPassword} helperText={errores.confirmarPassword}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmarPassword(p => !p)} edge="end" sx={{ color: theme.palette.text.secondary }}>
                            {showConfirmarPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      inputProps: { maxLength: 64 },
                    }}
                    sx={formFieldStyles}
                  />
                </Box>

                <Button
                  type="submit" fullWidth variant="contained" size="large"
                  disabled={loading || !token}
                  endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
                  sx={{
                    mt: 3, backgroundColor: theme.palette.primary.main, borderRadius: 2,
                    py: 1.5, fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.main}4D`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.main}66` },
                  }}
                >
                  {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default ResetearPassword
