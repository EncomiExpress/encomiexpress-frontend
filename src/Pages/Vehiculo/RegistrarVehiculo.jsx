import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel, InputAdornment, Stepper, Step, StepLabel, Snackbar, Alert } from '@mui/material'
import { DirectionsCar, Person, Business, Event, Speed } from '@mui/icons-material'
import { useTransporte } from '../../Context/TransporteContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  theme, FormField, FormSelect, PasswordField, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const steps = ['Datos del Vehículo', 'Documentación y Estado']

const RegistrarTransporte = () => {
  const [formData, setFormData] = useState({
    idConductor: '',
    idPropietario: '',
    placa: '',
    marca: '',
    modelo: '',
    color: '',
    tipo: '',
    capacidad: '',
    estado: 'Activo',
    vencimientoSOAT: '',
    vencimientoRevisionTecnica: '',
    vencimientoSeguroTerceros: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeStep, setActiveStep] = useState(0)
   
  const { registrarTransporte } = useTransporte()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    }
  }, [usuario, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Validar campos requeridos
    if (!formData.placa || !formData.marca || !formData.modelo || !formData.color || 
        !formData.tipo || !formData.capacidad || !formData.idConductor || !formData.idPropietario) {
      setError('Todos los campos son requeridos')
      return
    }

    try {
      registrarTransporte({
        ...formData,
        capacidad: parseFloat(formData.capacidad),
        idConductor: parseInt(formData.idConductor),
        idPropietario: parseInt(formData.idPropietario)
      })
      setSuccess('Transporte registrado correctamente')
      
      // Limpiar el formulario
      setFormData({
        idConductor: '',
        idPropietario: '',
        placa: '',
        marca: '',
        modelo: '',
        color: '',
        tipo: '',
        capacidad: '',
        estado: 'Activo',
        vencimientoSOAT: '',
        vencimientoRevisionTecnica: '',
        vencimientoSeguroTerceros: ''
      })
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/vehiculos/listar')
      }, 2000)
    } catch (err) {
      setError('Error al registrar transporte')
    }
  }

  const handleNext = () => {
    // Validar campos del paso 1
    if (!formData.placa || !formData.marca || !formData.modelo || !formData.color || !formData.tipo || !formData.capacidad) {
      setError('Todos los campos del vehículo son requeridos')
      return
    }
    setError('')
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const tiposVehiculo = [
    'Camioneta',
    'Camión',
    'Furgón',
    'Semi Trayler',
    'Trayler',
    'Motocicleta',
    'Otro'
  ]

  const estados = [
    'Activo',
    'Inactivo',
    'Mantenimiento',
    'En Reparación'
  ]

  // Renderizar contenido del stepper
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FormFieldsContainer>
            <FormField
              label="Placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              required
              placeholder="Ej: ABC-123"
              icon={DirectionsCar}
            />
            <FormField
              label="Marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              placeholder="Ej: Toyota"
              icon={Business}
            />
            <FormField
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              placeholder="Ej: Hilux"
              icon={DirectionsCar}
            />
            <FormField
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              placeholder="Ej: Blanco"
              icon={DirectionsCar}
            />
            <FormSelect
              label="Tipo de Vehículo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              {tiposVehiculo.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </FormSelect>
            <FormField
              label="Capacidad (kg)"
              name="capacidad"
              type="number"
              value={formData.capacidad}
              onChange={handleChange}
              required
              placeholder="Ej: 1500"
              icon={Speed}
            />
          </FormFieldsContainer>
        )
      case 1:
        return (
          <FormFieldsContainer>
            <FormField
              label="ID Conductor"
              name="idConductor"
              type="number"
              value={formData.idConductor}
              onChange={handleChange}
              required
              placeholder="Ej: 4"
              icon={Person}
            />
            <FormField
              label="ID Propietario"
              name="idPropietario"
              type="number"
              value={formData.idPropietario}
              onChange={handleChange}
              required
              placeholder="Ej: 6"
              icon={Business}
            />
            <FormSelect
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              {estados.map((estado) => (
                <MenuItem key={estado} value={estado}>{estado}</MenuItem>
              ))}
            </FormSelect>
            <FormField
              label="Vencimiento SOAT"
              name="vencimientoSOAT"
              type="date"
              value={formData.vencimientoSOAT}
              onChange={handleChange}
              icon={Event}
            />
            <FormField
              label="Vencimiento Revisión Técnica"
              name="vencimientoRevisionTecnica"
              type="date"
              value={formData.vencimientoRevisionTecnica}
              onChange={handleChange}
              icon={Event}
            />
            <FormField
              label="Vencimiento Seguro de Terceros"
              name="vencimientoSeguroTerceros"
              type="date"
              value={formData.vencimientoSeguroTerceros}
              onChange={handleChange}
              icon={Event}
            />
          </FormFieldsContainer>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 700, mx: 'auto' }}>
        <FormHeader 
          icon={DirectionsCar} 
          title="Registrar Transporte" 
          subtitle="Ingresa los datos del vehículo"
        />

        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

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

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Botones de navegación */}
          <FormButtonGroup justify="space-between">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SecondaryButton 
                onClick={handleBack} 
                disabled={activeStep === 0}
                children="Anterior"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <PrimaryButton 
                  onClick={handleNext}
                  children="Siguiente"
                />
              ) : (
                <PrimaryButton 
                  type="submit"
                  children="Registrar"
                />
              )}
            </Box>
          </FormButtonGroup>
        </form>
      </Paper>

      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setSuccess('')}>
          ¡Vehículo registrado exitosamente!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RegistrarTransporte