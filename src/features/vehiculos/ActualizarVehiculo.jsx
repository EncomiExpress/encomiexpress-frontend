import theme from '../../shared/styles/theme.js'
import { useState, useEffect } from 'react'
import { Box, TextField, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import { DirectionsCar, Person, Business, Event, Speed, SaveOutlined, ArrowBackOutlined, ArrowForwardOutlined, Close } from '@mui/icons-material'
import { useTransporte } from '../../shared/contexts/TransporteContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { 
  FormField, FormSelect,
  FormAlert, FormHeader, FormButtonGroup 
} from '../../shared/components/FormularioEstandarizado.jsx'

const steps = ['Datos del Vehículo', 'Documentación y Estado', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
    <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}
      sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
      {value || '—'}
    </Typography>
  </Box>
)

const COLORS = theme.palette

const ActualizarVehiculo = ({ open, onClose, transporte: transporteProp, onSuccess }) => {
  const { getTransporteById, actualizarTransporte } = useTransporte()
  const { conductores } = useConductor()
  const { propietarios } = usePropietario()
  
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
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [formOriginal, setFormOriginal] = useState(null)
  const [sinCambios, setSinCambios] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && transporteProp) {
      setActiveStep(0)
      setSinCambios(false)
      setErrores({})
      setError('')
      const transporte = getTransporteById(transporteProp.idVehiculo)
      if (transporte) {
        setFormData(transporte)
        setFormOriginal(transporte)
      }
    }
  }, [open, transporteProp, getTransporteById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrores({})
    setError('')
    setSinCambios(false)
  }

  const validarPaso = (step) => {
    const e = {}
    if (step === 0) {
      if (!formData.placa?.trim()) e.placa = 'La placa es obligatoria'
      if (!formData.marca?.trim()) e.marca = 'La marca es obligatoria'
      if (!formData.modelo?.trim()) e.modelo = 'El modelo es obligatorio'
      if (!formData.color?.trim()) e.color = 'El color es obligatorio'
      if (!formData.tipo) e.tipo = 'El tipo de vehículo es obligatorio'
      if (!formData.capacidad) e.capacidad = 'La capacidad es obligatoria'
    }
    if (step === 1) {
      if (!formData.idConductor) e.idConductor = 'El conductor es obligatorio'
      if (!formData.idPropietario) e.idPropietario = 'El propietario es obligatorio'
    }
    return e
  }

  const handleNext = () => {
    const erroresEncontrados = validarPaso(activeStep)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    setErrores({})
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (formOriginal) {
      const hayCambios = Object.keys(formData).some(key => {
        const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
        const actual = formData[key] !== undefined ? String(formData[key]) : ''
        return original !== actual
      })
      
      if (!hayCambios) {
        setSinCambios(true)
        return
      }
    }

    setSinCambios(false)
    setSubmitting(true)
    
    try {
      await actualizarTransporte({
        idVehiculo: parseInt(transporteProp?.idVehiculo),
        ...formData,
        capacidad: parseFloat(formData.capacidad),
        idConductor: parseInt(formData.idConductor),
        idPropietario: parseInt(formData.idPropietario)
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError('Error al actualizar el vehículo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelar = () => {
    onClose()
  }

  const tiposVehiculo = [
    'Camioneta', 'Camión', 'Furgón', 'Semi Trayler', 'Trayler', 'Motocicleta', 'Otro'
  ]

  const estados = [
    'Activo', 'Inactivo', 'Mantenimiento', 'En Reparación'
  ]

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
              error={errores.placa}
              helperText={errores.placa}
            />
            <FormField
              label="Marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              placeholder="Ej: Toyota"
              icon={Business}
              error={errores.marca}
              helperText={errores.marca}
            />
            <FormField
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              placeholder="Ej: Hilux"
              icon={DirectionsCar}
              error={errores.modelo}
              helperText={errores.modelo}
            />
            <FormField
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              placeholder="Ej: Blanco"
              icon={DirectionsCar}
              error={errores.color}
              helperText={errores.color}
            />
            <FormSelect
              label="Tipo de Vehículo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              error={errores.tipo}
              helperText={errores.tipo}
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
              error={errores.capacidad}
              helperText={errores.capacidad}
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
              error={errores.idConductor}
              helperText={errores.idConductor}
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
              error={errores.idPropietario}
              helperText={errores.idPropietario}
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
              InputLabelProps={{ shrink: true }}
            />
            <FormField
              label="Vencimiento Revisión Técnica"
              name="vencimientoRevisionTecnica"
              type="date"
              value={formData.vencimientoRevisionTecnica}
              onChange={handleChange}
              icon={Event}
              InputLabelProps={{ shrink: true }}
            />
            <FormField
              label="Vencimiento Seguro de Terceros"
              name="vencimientoSeguroTerceros"
              type="date"
              value={formData.vencimientoSeguroTerceros}
              onChange={handleChange}
              icon={Event}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sinCambios && (
              <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                No has realizado ningún cambio. Los datos ya están actualizados.
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}>
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
                <ConfirmRow label="Capacidad" value={formData.capacidad ? `${formData.capacidad} kg` : ''} />
              </Paper>
              <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Event sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Documentación y Estado</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la documentación</Typography>
                <ConfirmRow label="Conductor" value={(() => { const c = conductores.find(c => c.idConductor === formData.idConductor); return c ? `${c.nombre} ${c.apellido}` : '—' })()} />
                <ConfirmRow label="Propietario" value={(() => { const p = propietarios.find(p => p.idPropietario === formData.idPropietario); return p ? `${p.nombre} ${p.apellido}` : '—' })()} />
                <ConfirmRow label="Estado" value={formData.estado} />
                <ConfirmRow label="SOAT" value={formData.vencimientoSOAT} />
                <ConfirmRow label="Revisión Técnica" value={formData.vencimientoRevisionTecnica} />
                <ConfirmRow label="Seguro Terceros" value={formData.vencimientoSeguroTerceros} />
              </Paper>
            </Box>
          </Box>
        )
      default:
        return null
    }
  }

  const cardSx = {
    flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'white', elevation: 0,
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Editar Vehículo
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {formOriginal?.marca && formOriginal?.modelo
              ? `Modificando datos de ${formOriginal.marca} ${formOriginal.modelo}`
              : 'Modifica los campos que necesites.'
            }
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1.5 }}>
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
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
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
            '&:hover': { borderColor: '#BDBDBD', backgroundColor: theme.palette.background.subtle },
            '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
          }}>
          Anterior
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={handleCancelar} disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}>
            Cancelar
          </Button>
          <Button
            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
            variant="contained"
            disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlined /> : <SaveOutlined />}
            disableRipple
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
              '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: '#9E9E9E' },
            }}>
            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setSuccess(false)}>
          ¡Vehículo actualizado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default ActualizarVehiculo