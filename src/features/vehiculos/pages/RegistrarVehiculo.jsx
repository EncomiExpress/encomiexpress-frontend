import { useState } from 'react'
import { Box, TextField, Typography, MenuItem, Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, Snackbar, Alert, IconButton, Button } from '@mui/material'
import { DirectionsCar, Person, Business, Event, Speed, Close, ArrowBackOutlined, SaveOutlined } from '@mui/icons-material'
import { useTransporte } from '../../../shared/contexts/TransporteContext'
import { FormField, FormSelect, FormAlert, FormFieldsContainer } from '../../../shared/components/FormularioEstandarizado'

const steps = ['Datos del Vehículo', 'Documentación y Estado']

const COLORS = {
  primary: '#CC1818',
  border: '#E0E0E0',
  text: '#1a0e0c',
  textMuted: '#8A94A6',
}

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
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>Registrar Vehículo</Typography>
          </Box>
          <Typography variant="body2" color={COLORS.textMuted} sx={{ mt: 0.5, ml: 0.5 }}>
            Ingresa los datos del nuevo vehículo
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#8A94A6' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1.5 }}>
        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel
          sx={{
            mb: 3, mt: 2,
            '& .MuiStepIcon-root': { color: '#E0E0E0' },
            '& .MuiStepIcon-root.Mui-active': { color: COLORS.primary },
            '& .MuiStepIcon-root.Mui-completed': { color: COLORS.primary },
            '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
            '& .MuiStepConnector-line': { borderColor: COLORS.border },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: COLORS.primary },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: COLORS.primary },
            '& .MuiStepLabel-label': { fontSize: '0.8rem', color: COLORS.textMuted, mt: 0.5 },
            '& .MuiStepLabel-label.Mui-active': { color: COLORS.text, fontWeight: 600 },
            '& .MuiStepLabel-label.Mui-completed': { color: COLORS.primary, fontWeight: 500 },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            {renderStepContent()}

            <Box sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              mt: 3, pt: 2, borderTop: `1px solid ${COLORS.border}`,
            }}>
              <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                startIcon={<ArrowBackOutlined />} disableRipple
                sx={{
                  textTransform: 'none', borderRadius: 2, borderColor: COLORS.border,
                  color: COLORS.text, fontWeight: 500,
                  '&:hover': { borderColor: '#BDBDBD', backgroundColor: '#F9F9F9' },
                  '&.Mui-disabled': { borderColor: COLORS.border, color: COLORS.textMuted },
                }}>
                Anterior
              </Button>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button onClick={handleClose} disableRipple
                  sx={{
                    textTransform: 'none', color: COLORS.textMuted, fontWeight: 500, borderRadius: 2,
                    '&:hover': { backgroundColor: '#F9F9F9', color: COLORS.text },
                  }}>
                  Cancelar
                </Button>
                <Button
                  onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                  variant="contained"
                  endIcon={activeStep < steps.length - 1 ? undefined : <SaveOutlined />}
                  disableRipple
                  sx={{
                    textTransform: 'none', borderRadius: 2, fontWeight: 600,
                    backgroundColor: COLORS.primary,
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                    '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
                  }}>
                  {activeStep < steps.length - 1 ? 'Siguiente' : 'Registrar'}
                </Button>
              </Box>
            </Box>
          </Box>
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
