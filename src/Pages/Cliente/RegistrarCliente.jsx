import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, Grid, MenuItem, Stepper, Step, StepLabel } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import HomeIcon from '@mui/icons-material/Home'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import { useClientes } from '../../Context/ClienteContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

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
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Datos Personales
            </Typography>
            
            <FormField
              label="Nombres"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              error={errores.nombre}
              helperText={errores.nombre}
              icon={PersonIcon}
            />

            <FormField
              label="Apellidos"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              error={errores.apellido}
              helperText={errores.apellido}
              icon={PersonIcon}
            />

            <FormSelect
              label="Tipo de documento"
              name="tipoIdentificacion"
              value={form.tipoIdentificacion}
              onChange={handleChange}
              required
              error={errores.tipoIdentificacion}
            >
              <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
              <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
              <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
              <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
              <MenuItem value="RC">Registro Civil (RC)</MenuItem>
              <MenuItem value="PAS">Pasaporte</MenuItem>
            </FormSelect>

            <FormField
              label="Número de documento"
              name="numeroIdentificacion"
              value={form.numeroIdentificacion}
              onChange={handleChange}
              required
              error={errores.numeroIdentificacion}
              helperText={errores.numeroIdentificacion}
              icon={BadgeIcon}
            />
          </FormFieldsContainer>
        )
      case 1:
        return (
          <FormFieldsContainer>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600, mb: 1 }}>
              Información de Contacto
            </Typography>

            <FormField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
              error={errores.telefono}
              helperText={errores.telefono || 'Número de 10 dígitos'}
              icon={PhoneIcon}
            />

            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              error={errores.email}
              helperText={errores.email}
              icon={EmailIcon}
            />

            <FormField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
              error={errores.direccion}
              helperText={errores.direccion || 'Ej: Calle 45 #20-10'}
              icon={HomeIcon}
            />

            <FormField
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              required
              error={errores.ciudad}
              helperText={errores.ciudad}
              icon={LocationCityIcon}
            />
          </FormFieldsContainer>
        )
      case 2:
        return (
          <FormFieldsContainer>
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
          </FormFieldsContainer>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          maxWidth: 900, 
          mx: 'auto',
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Título */}
        <FormHeader 
          icon={PersonAddIcon} 
          title="Registrar Cliente" 
          subtitle="Complete los datos del nuevo cliente"
        />

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontWeight: activeStep === index ? 600 : 400,
                    color: activeStep === index ? theme.primary : '#64748b'
                  } 
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderStepContent()}
        </Box>

        {/* Botones */}
        <FormButtonGroup justify="space-between">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton 
              onClick={handleBack} 
              disabled={activeStep === 0}
              children="Anterior"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton 
              onClick={handleCancelar}
              children="Cancelar"
            />
            {activeStep < steps.length - 1 ? (
              <PrimaryButton 
                onClick={handleNext}
                children="Siguiente"
              />
            ) : (
              <PrimaryButton 
                onClick={handleSubmit}
                children="Registrar"
              />
            )}
          </Box>
        </FormButtonGroup>
      </Paper>
    </Box>
  )
}

export default RegistrarCliente
