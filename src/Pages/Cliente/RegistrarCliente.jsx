import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Paper, Grid, MenuItem,
  Snackbar, Alert, InputAdornment, Divider, Stepper, Step, StepLabel
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import HomeIcon from '@mui/icons-material/Home'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useClientes } from '../../Context/ClienteContext'

const theme = {
  primary: '#CC1818',
  secondary: '#1A2E6E'
}

const steps = ['Datos Personales', 'Información de Contacto', 'Confirmación']

const RegistrarCliente = () => {
  const { agregarCliente } = useClientes()
  const navigate = useNavigate()
  const [exito, setExito] = useState(false)
  const [errores, setErrores] = useState({})
  const [activeStep, setActiveStep] = useState(0)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    habilitado: true
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validarPaso = (step) => {
    const e = {}
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    const soloNumeros = /^\d+$/
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (step === 0) {
      if (!form.nombre.trim())
        e.nombre = 'El nombre es obligatorio'
      else if (!soloLetras.test(form.nombre))
        e.nombre = 'El nombre solo puede contener letras'

      if (!form.apellido.trim())
        e.apellido = 'El apellido es obligatorio'
      else if (!soloLetras.test(form.apellido))
        e.apellido = 'El apellido solo puede contener letras'

      if (!form.tipoIdentificacion)
        e.tipoIdentificacion = 'Selecciona un tipo de documento'

      if (!form.numeroIdentificacion.trim())
        e.numeroIdentificacion = 'El número de documento es obligatorio'
      else if (!soloNumeros.test(form.numeroIdentificacion))
        e.numeroIdentificacion = 'Solo se permiten números'
    }

    if (step === 1) {
      if (!form.telefono.trim())
        e.telefono = 'El teléfono es obligatorio'
      else if (!/^\d{10}$/.test(form.telefono))
        e.telefono = 'El teléfono debe tener exactamente 10 dígitos'

      if (!form.email.trim())
        e.email = 'El correo es obligatorio'
      else if (!emailValido.test(form.email))
        e.email = 'Ingresa un correo electrónico válido'

      if (!form.direccion.trim())
        e.direccion = 'La dirección es obligatoria'

      if (!form.ciudad.trim())
        e.ciudad = 'La ciudad es obligatoria'
      else if (!soloLetras.test(form.ciudad))
        e.ciudad = 'La ciudad solo puede contener letras'
    }

    return e
  }

  const validar = () => {
    const e = {}
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    const soloNumeros = /^\d+$/
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.nombre.trim())
      e.nombre = 'El nombre es obligatorio'
    else if (!soloLetras.test(form.nombre))
      e.nombre = 'El nombre solo puede contener letras'

    if (!form.apellido.trim())
      e.apellido = 'El apellido es obligatorio'
    else if (!soloLetras.test(form.apellido))
      e.apellido = 'El apellido solo puede contener letras'

    if (!form.tipoIdentificacion)
      e.tipoIdentificacion = 'Selecciona un tipo de documento'

    if (!form.numeroIdentificacion.trim())
      e.numeroIdentificacion = 'El número de documento es obligatorio'
    else if (!soloNumeros.test(form.numeroIdentificacion))
      e.numeroIdentificacion = 'Solo se permiten números'

    if (!form.telefono.trim())
      e.telefono = 'El teléfono es obligatorio'
    else if (!/^\d{10}$/.test(form.telefono))
      e.telefono = 'El teléfono debe tener exactamente 10 dígitos'

    if (!form.email.trim())
      e.email = 'El correo es obligatorio'
    else if (!emailValido.test(form.email))
      e.email = 'Ingresa un correo electrónico válido'

    if (!form.direccion.trim())
      e.direccion = 'La dirección es obligatoria'

    if (!form.ciudad.trim())
      e.ciudad = 'La ciudad es obligatoria'
    else if (!soloLetras.test(form.ciudad))
      e.ciudad = 'La ciudad solo puede contener letras'

    return e
  }

  const handleNext = () => {
    const erroresEncontrados = validarPaso(activeStep)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    const erroresEncontrados = validar()

    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    agregarCliente(form)
    setExito(true)
    setTimeout(() => navigate('/clientes/listar'), 1500)
  }

  const handleCancelar = () => {
    navigate('/clientes/listar')
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Datos Personales
            </Typography>
            
            <TextField
              label="Nombres"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.nombre}
              helperText={errores.nombre}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />

            <TextField
              label="Apellidos"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.apellido}
              helperText={errores.apellido}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />

            <TextField
              select
              label="Tipo de documento"
              name="tipoIdentificacion"
              value={form.tipoIdentificacion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.tipoIdentificacion}
              helperText={errores.tipoIdentificacion}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            >
              <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
              <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
              <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
              <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
              <MenuItem value="RC">Registro Civil (RC)</MenuItem>
              <MenuItem value="PAS">Pasaporte</MenuItem>
            </TextField>

            <TextField
              label="Número de documento"
              name="numeroIdentificacion"
              value={form.numeroIdentificacion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.numeroIdentificacion}
              helperText={errores.numeroIdentificacion}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />
          </Box>
        )
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Información de Contacto
            </Typography>

            <TextField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.telefono}
              helperText={errores.telefono || 'Número de 10 dígitos'}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />

            <TextField
              label="Correo electrónico"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.email}
              helperText={errores.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />

            <TextField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.direccion}
              helperText={errores.direccion || 'Ej: Calle 45 #20-10'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />

            <TextField
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.ciudad}
              helperText={errores.ciudad}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCityIcon sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary }
                },
                '& .MuiFormLabel-root.Mui-focused': { color: theme.primary }
              }}
            />
          </Box>
        )
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Confirmar Información
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                backgroundColor: '#fafafa', 
                borderRadius: 2,
                border: `1px solid ${theme.primary}30`
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Nombres:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.nombre || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Apellidos:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.apellido || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Tipo de Documento:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.tipoIdentificacion || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Número de Documento:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.numeroIdentificacion || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Teléfono:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.telefono || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Correo:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.email || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Dirección:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.direccion || 'No especificado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Ciudad:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>{form.ciudad || 'No especificado'}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          maxWidth: 600, 
          margin: '0 auto',
          borderRadius: 3
        }}
      >
        {/* Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${theme.primary}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PersonAddIcon sx={{ color: theme.primary, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold' }}>
              Registrar Cliente
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Complete los datos del nuevo cliente
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontWeight: activeStep === index ? 600 : 400,
                    color: activeStep === index ? theme.primary : '#94a3b8'
                  },
                  '& .MuiStepIcon-root': {
                    color: activeStep >= index ? theme.primary : '#e2e8f0',
                    '&.Mui-active': {
                      color: theme.primary
                    },
                    '&.Mui-completed': {
                      color: theme.primary
                    }
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 4 }} />

        {/* Contenido del formulario */}
        <Box sx={{ minHeight: 350 }}>
          {renderStepContent()}
        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleCancelar}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              borderColor: '#94a3b8', 
              color: '#64748b',
              '&:hover': { borderColor: '#64748b', backgroundColor: '#f1f5f9' }
            }}
          >
            Cancelar
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  borderColor: theme.primary, 
                  color: theme.primary,
                  '&:hover': { borderColor: theme.primary, backgroundColor: '#fef2f2' }
                }}
              >
                Atrás
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  backgroundColor: theme.primary, 
                  '&:hover': { backgroundColor: '#a01212' }
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleSubmit}
                sx={{ 
                  backgroundColor: theme.primary, 
                  '&:hover': { backgroundColor: '#a01212' }
                }}
              >
                Registrar Cliente
              </Button>
            )}
          </Box>
        </Box>

      </Paper>

      {/* Mensaje de éxito */}
      <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontWeight: 600, '& .MuiAlert-icon': { fontSize: 28 }, backgroundColor: theme.primary, color: 'white' }}>
          ¡Cliente registrado exitosamente!
        </Alert>
      </Snackbar>

    </Box>
  )
}

export default RegistrarCliente
