import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Paper, Alert, MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton, Stepper, Step, StepLabel, CircularProgress } from '@mui/material'
import {
  PersonOutlined as Person,
  EmailOutlined as Email,
  LockOutlined as Lock,
  BadgeOutlined as Badge,
  PhoneOutlined as Phone,
  VisibilityOutlined as Visibility,
  VisibilityOffOutlined as VisibilityOff,
  ArrowBack,
  ArrowBackOutlined,
  ArrowForwardOutlined,
  CheckOutlined,
  KeyboardArrowDownOutlined as KeyboardArrowDown,
} from '@mui/icons-material'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { register as registrarAutoregistro } from '../../shared/services/authService.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import logo from '../../assets/logo.png'
import logoDark from '../../assets/logoDark.png'

const TIPOS_IDENTIFICACION = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PAS', label: 'Pasaporte' },
]

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,64}$/
const PASSWORD_HELP = '8-64 caracteres, con mayúsculas, minúsculas, números y un carácter especial'
const steps = ['Datos personales', 'Contacto y acceso']

// Ruta pública sin login (/register) que replica los campos reales del módulo
// Usuarios. Pensada para que el personal administrativo se autoregistre sin que
// un admin tenga que digitar sus datos — NO es el mismo flujo que /usuarios/registrar
// (ese sí requiere estar logueado y con permiso, y crea usuarios ya habilitados).
// Llama a authService.register() → POST /auth/register, que SIEMPRE fuerza
// idRol=1 (Administrador) y la cuenta queda inhabilitada + marcada como pendiente
// hasta que un admin ya activo la habilite desde el módulo de Usuarios (ver
// registroPendiente en usuario.js / usuarioService.js del backend).
const Register = () => {
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    emailLocal: '',
    emailDominio: '@gmail.com',
    password: '',
    confirmarPassword: '',
  })
  const [errores, setErrores] = useState({})
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { usuario } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const esDocAlfanumerico = ['CE', 'PAS'].includes(formData.tipoIdentificacion)
  const maxLengthDoc = esDocAlfanumerico ? 12 : 10
  const docHelperText = esDocAlfanumerico ? 'Alfanumérico, hasta 12 caracteres' : 'Solo dígitos, entre 3 y 10'

  useEffect(() => {
    if (usuario) {
      navigate('/dashboard')
    }
  }, [usuario, navigate])

  const handleChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'nombre' || name === 'apellido') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    }
    if (name === 'telefono') {
      value = value.replace(/[^0-9]/g, '')
    }
    if (name === 'numeroIdentificacion') {
      value = esDocAlfanumerico ? value.replace(/[^a-zA-Z0-9]/g, '') : value.replace(/[^0-9]/g, '')
    }
    if (name === 'tipoIdentificacion') {
      setFormData(prev => ({ ...prev, tipoIdentificacion: value, numeroIdentificacion: '' }))
      setErrores(prev => ({ ...prev, tipoIdentificacion: '', numeroIdentificacion: '' }))
      setError('')
      setSuccess('')
      return
    }
    if (name === 'emailLocal') {
      value = value.replace(/[^a-zA-Z0-9._-]/g, '')
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
    setError('')
    setSuccess('')
  }

  const validarPaso = (step) => {
    const e = {}
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/

    if (step === 0) {
      if (!formData.nombre.trim()) e.nombre = 'El nombre es obligatorio'
      else if (!soloLetras.test(formData.nombre)) e.nombre = 'El nombre solo puede contener letras'

      if (!formData.apellido.trim()) e.apellido = 'El apellido es obligatorio'
      else if (!soloLetras.test(formData.apellido)) e.apellido = 'El apellido solo puede contener letras'

      if (!formData.numeroIdentificacion.trim()) e.numeroIdentificacion = 'El número de documento es obligatorio'
      else if (formData.numeroIdentificacion.length < 3 || formData.numeroIdentificacion.length > maxLengthDoc) {
        e.numeroIdentificacion = `Debe tener entre 3 y ${maxLengthDoc} caracteres`
      }
    }

    if (step === 1) {
      if (!formData.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
      else if (!/^\d{10}$/.test(formData.telefono)) e.telefono = 'El teléfono debe tener exactamente 10 dígitos'

      if (!formData.emailLocal.trim()) e.emailLocal = 'El correo es obligatorio'

      if (!formData.password) e.password = 'La contraseña es obligatoria'
      else if (!PASSWORD_REGEX.test(formData.password)) e.password = PASSWORD_HELP

      if (!formData.confirmarPassword) e.confirmarPassword = 'Confirma la contraseña'
      else if (formData.password !== formData.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden'
    }

    return e
  }

  const handleNext = () => {
    const erroresEncontrados = validarPaso(activeStep)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => setActiveStep(prev => prev - 1)

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    const erroresEncontrados = validarPaso(1)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    setLoading(true)
    try {
      const { emailLocal, emailDominio, confirmarPassword: _confirmarPassword, ...resto } = formData
      const datosRegistro = {
        ...resto,
        email: emailLocal + emailDominio,
        idRol: 1, // Administrador — fijo, ver nota arriba
      }

      // autoLogin=false: la cuenta queda inhabilitada hasta que un admin la apruebe,
      // no tiene caso guardar un token que de todos modos el backend va a rechazar.
      const resultado = await registrarAutoregistro(datosRegistro, false)

      if (resultado.success) {
        setSuccess('¡Listo! Tu registro fue enviado. Un administrador ya activo debe aprobarlo antes de que puedas ingresar.')
        setFormData({
          tipoIdentificacion: 'CC', numeroIdentificacion: '', nombre: '', apellido: '',
          telefono: '', emailLocal: '', emailDominio: '@gmail.com', password: '', confirmarPassword: '',
        })
        setActiveStep(0)
      } else {
        setError(resultado.message || 'Error al registrar usuario')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl fullWidth required sx={formFieldStyles}>
            <InputLabel>
              Tipo de documento
            </InputLabel>
            <Select
              name="tipoIdentificacion" value={formData.tipoIdentificacion} label="Tipo de documento"
              onChange={handleChange} IconComponent={KeyboardArrowDown}
            >
              {TIPOS_IDENTIFICACION.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth label="Número de documento" name="numeroIdentificacion"
            value={formData.numeroIdentificacion} onChange={handleChange} required
            error={!!errores.numeroIdentificacion} helperText={errores.numeroIdentificacion || docHelperText}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Badge sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
              inputProps: { maxLength: maxLengthDoc },
            }}
            sx={formFieldStyles}
          />

          <TextField
            fullWidth label="Nombre(s)" name="nombre"
            value={formData.nombre} onChange={handleChange} required
            error={!!errores.nombre} helperText={errores.nombre}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Person sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
              inputProps: { maxLength: 50 },
            }}
            sx={formFieldStyles}
          />

          <TextField
            fullWidth label="Apellido(s)" name="apellido"
            value={formData.apellido} onChange={handleChange} required
            error={!!errores.apellido} helperText={errores.apellido}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Person sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
              inputProps: { maxLength: 50 },
            }}
            sx={formFieldStyles}
          />
        </Box>
      )
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
          fullWidth label="Teléfono" name="telefono"
          value={formData.telefono} onChange={handleChange} required
          error={!!errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Phone sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
            inputProps: { maxLength: 10 },
          }}
          sx={formFieldStyles}
        />

        <TextField
          fullWidth label="Correo electrónico" name="emailLocal"
          value={formData.emailLocal} onChange={handleChange} required
          error={!!errores.emailLocal} helperText={errores.emailLocal}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Email sx={{ color: theme.palette.text.secondary }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <Select
                  name="emailDominio" value={formData.emailDominio} onChange={handleChange}
                  variant="standard" disableUnderline IconComponent={KeyboardArrowDown}
                  sx={{ fontSize: '1rem', color: theme.palette.text.secondary, '& .MuiSelect-select': { py: 0, pl: 0.5, pr: '22px !important' } }}
                >
                  {DOMINIOS_EMAIL.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </InputAdornment>
            ),
            inputProps: { maxLength: 50 },
          }}
          sx={formFieldStyles}
        />

        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            fullWidth label="Contraseña" name="password" type={showPassword ? 'text' : 'password'}
            value={formData.password} onChange={handleChange} required
            error={!!errores.password} helperText={errores.password || PASSWORD_HELP}
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
            fullWidth label="Confirmar contraseña" name="confirmarPassword" type={showConfirmarPassword ? 'text' : 'password'}
            value={formData.confirmarPassword} onChange={handleChange} required
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
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.palette.background.default, py: 2, px: 2,
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
        p: 0, width: '100%', maxWidth: 700, borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden', position: 'relative', zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <Box sx={{
          px: 4, py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{ width: 140, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={theme.palette.mode === 'dark' ? logoDark : logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: theme.palette.text.dark, fontWeight: 700, fontSize: '1.5rem', mb: 0.5, lineHeight: 1.2, fontFamily: 'Cambria, Georgia, serif' }}>
              Regístrate
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              Completa tus datos para solicitar acceso al sistema
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Stepper activeStep={activeStep} alternativeLabel
            sx={{
              mb: 2,
              '& .MuiStepIcon-root': { color: theme.palette.divider },
              '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
              '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
              '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
              '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
              '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
              '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
              '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
              '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
              '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
            }}
          >
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          <Box sx={{
            p: 1, mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1,
            backgroundColor: theme.palette.primary.main + '18',
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Badge sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
            <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.8rem', fontWeight: 500 }}>
              Serás <strong>Administrador</strong>, pero tu registro quedará pendiente de aprobación por un administrador ya activo.
            </Typography>
          </Box>

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Button
              onClick={handleBack} disabled={activeStep === 0} variant="outlined"
              startIcon={<ArrowBackOutlined />} disableRipple
              sx={{
                textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
                color: theme.palette.text.primary, fontWeight: 500,
                '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
                '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
              }}>
              Anterior
            </Button>
            <Button
              onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
              variant="contained" disabled={loading} disableRipple
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : (activeStep < steps.length - 1 ? <ArrowForwardOutlined /> : <CheckOutlined />)}
              sx={{
                backgroundColor: theme.palette.primary.main, borderRadius: 2, px: 3, minWidth: 200,
                fontWeight: 700, fontSize: '0.95rem', textTransform: 'none',
                boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
              }}
            >
              {activeStep < steps.length - 1 ? 'Siguiente' : (loading ? 'Enviando solicitud...' : 'Enviar registro')}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              ¿Ya estás registrado?{' '}
              <Button
                component={Link} to="/login" variant="text"
                sx={{
                  color: theme.palette.primary.main, fontWeight: 600, p: 0, minWidth: 'auto',
                  textTransform: 'none', '&:hover': { textDecoration: 'underline' },
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
