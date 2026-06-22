import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Paper, TextField, Typography, MenuItem, Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, Snackbar, Alert, IconButton, Button } from '@mui/material'
import { DirectionsCar, Person, Business, Event, Speed, Close, ArrowBackOutlined, ArrowForwardOutlined, CheckOutlined } from '@mui/icons-material'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { FormField, FormSelect, FormAlert } from '../../shared/components/FormularioEstandarizado.jsx'

const steps = ['Datos del Vehículo', 'Documentación y Estado', 'Confirmación']

const ConfirmRow = ({ label, value }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}
        sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
        {value || '—'}
      </Typography>
    </Box>
  )
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
  const [submitting, setSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
   
  const { registrarVehiculo } = useVehiculo()
  const theme = useTheme()
  const { conductores } = useConductor()
  const { propietarios } = usePropietario()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
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

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        idConductor: formData.idConductor ? parseInt(formData.idConductor, 10) : null,
        idPropietario: formData.idPropietario ? parseInt(formData.idPropietario, 10) : null,
        placa: formData.placa.trim(),
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        color: formData.color.trim(),
        tipo: formData.tipo,
        capacidad: formData.capacidad ? parseFloat(formData.capacidad) : null,
        estado: formData.estado,
        vencimientoSOAT: formData.vencimientoSOAT || null,
        vencimientoRevisionTecnica: formData.vencimientoRevisionTecnica || null,
        vencimientoSeguroTerceros: formData.vencimientoSeguroTerceros || null,
      }
      await registrarVehiculo(payload)
      setSuccess('Transporte registrado correctamente')
      setTimeout(() => {
        handleClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError('Error al registrar transporte')
    } finally {
      setSubmitting(false)
    }
   }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.placa || !formData.marca || !formData.modelo || !formData.color || !formData.tipo || !formData.capacidad) {
        setError('Todos los campos del vehículo son requeridos')
        return
      }
    }
    if (activeStep === 1) {
      if (!formData.idConductor || !formData.idPropietario) {
        setError('Debes asignar un conductor y un propietario')
        return
      }
    }
    setError('')
    setActiveStep((prev) => prev + 1)
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
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
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
          </Box>
        )
      case 1:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormSelect
              label="Conductor"
              name="idConductor"
              value={formData.idConductor}
              onChange={handleChange}
              required
            >
              {conductores
                .filter(c => c.habilitado !== false)
                .map((c) => (
                  <MenuItem key={c.idConductor} value={c.idConductor}>
                    {c.nombre} {c.apellido}
                  </MenuItem>
                ))}
            </FormSelect>
            <FormSelect
              label="Propietario"
              name="idPropietario"
              value={formData.idPropietario}
              onChange={handleChange}
              required
            >
              {propietarios
                .filter(p => p.habilitado !== false)
                .map((p) => (
                  <MenuItem key={p.idPropietario} value={p.idPropietario}>
                    {p.nombre} {p.apellido}
                  </MenuItem>
                ))}
            </FormSelect>
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
          </Box>
        )
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{
                flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: 'white', overflow: 'hidden',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <DirectionsCar sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos del Vehículo</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del vehículo</Typography>
                <ConfirmRow label="Placa" value={formData.placa} />
                <ConfirmRow label="Marca" value={formData.marca} />
                <ConfirmRow label="Modelo" value={formData.modelo} />
                <ConfirmRow label="Color" value={formData.color} />
                <ConfirmRow label="Tipo" value={formData.tipo} />
                <ConfirmRow label="Capacidad" value={`${formData.capacidad} kg`} />
                <ConfirmRow label="Estado" value={formData.estado} />
              </Paper>
              <Paper elevation={0} sx={{
                flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: 'white', overflow: 'hidden',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Person sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Asignación y Estado</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica conductor, propietario y fechas</Typography>
                <ConfirmRow label="Conductor" value={(() => { const c = conductores.find(c => c.idConductor === formData.idConductor); return c ? `${c.nombre} ${c.apellido}` : '—' })()} />
                <ConfirmRow label="Propietario" value={(() => { const p = propietarios.find(p => p.idPropietario === formData.idPropietario); return p ? `${p.nombre} ${p.apellido}` : '—' })()} />
                <ConfirmRow label="SOAT" value={formData.vencimientoSOAT || '—'} />
                <ConfirmRow label="Revisión Técnica" value={formData.vencimientoRevisionTecnica || '—'} />
                <ConfirmRow label="Seguro de Terceros" value={formData.vencimientoSeguroTerceros || '—'} />
              </Paper>
            </Box>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>Registrar Vehículo</Typography>
          </Box>
          <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
            Ingresa los datos del nuevo vehículo
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
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
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ px: 4, py: 2 }}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
              {renderStepContent()}
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
          startIcon={<ArrowBackOutlined />} disableRipple
          sx={{
            textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
            color: theme.palette.text.primary, fontWeight: 500,
            '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
            '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
          }}>
          Anterior
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={handleClose} disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}>
            Cancelar
          </Button>
          <Button
            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
            variant="contained"
            disabled={submitting}
            endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlined /> : <CheckOutlined />)}
            disableRipple
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
            }}>
            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Registrar'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setSuccess('')}>
          ¡Vehículo registrado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default RegistrarVehiculo

