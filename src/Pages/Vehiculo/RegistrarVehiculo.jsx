import { useState } from 'react'
import { Box, TextField, Typography, Paper, MenuItem, Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, Snackbar, Alert, IconButton } from '@mui/material'
import { DirectionsCar, Person, Business, Event, Speed, Close } from '@mui/icons-material'
import { useTransporte } from '../../Context/TransporteContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const steps = ['Datos del Vehículo', 'Documentación y Estado']

const RegistrarVehiculo = ({ open, onClose, onSuccess }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
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
      
      setTimeout(() => {
        handleClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError('Error al registrar transporte')
    }
  }

  const handleClose = () => {
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
    setError('')
    setSuccess('')
    setActiveStep(0)
    onClose()
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DirectionsCar sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Registrar Vehículo</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#8A94A6' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
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
      </DialogContent>

      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setSuccess('')}>
          ¡Vehículo registrado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default RegistrarVehiculo
