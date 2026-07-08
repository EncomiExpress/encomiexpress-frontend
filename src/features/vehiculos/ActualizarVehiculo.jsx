import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Dialog, DialogTitle, DialogContent, IconButton, TextField, Autocomplete } from '@mui/material'
import {
  DirectionsCarOutlined, BadgeOutlined, SellOutlined, InvertColorsOutlined,
  EventOutlined, SpeedOutlined, SaveOutlined, ArrowBackOutlined, ArrowForwardOutlined, Close, EditOutlined
} from '@mui/icons-material'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'

const steps = ['Datos del Vehículo', 'Documentación', 'Confirmación']

const TIPOS_VEHICULO = ['Camioneta', 'Camión', 'Furgón', 'Semi Trayler', 'Trayler', 'Motocicleta', 'Otro']
const hoyISO = () => new Date().toISOString().split('T')[0]
const CAPACIDAD_MAX = 999999

const ActualizarVehiculo = ({ open, onClose, transporte: transporteProp, onSuccess }) => {
  const { getVehiculoById, actualizarVehiculo } = useVehiculo()
  const { showToast } = useToast()
  const theme = useTheme()
  const { propietarios } = usePropietario()

  const [formData, setFormData] = useState({
    idPropietario: '', placa: '', marca: '', modelo: '', color: '',
    tipo: '', origen: 'Propio', capacidad: '',
    vencimientoSOAT: '', vencimientoRevisionTecnica: '', vencimientoSeguroTerceros: ''
  })
  const [errores, setErrores] = useState({})
  const [apiError, setApiError] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formOriginal, setFormOriginal] = useState(null)
  const [sinCambios, setSinCambios] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const cargado = useRef(false)

  useEffect(() => {
    if (!open) { cargado.current = false; return }
    if (!transporteProp || cargado.current) return
    cargado.current = true
    setActiveStep(0)
    setSinCambios(false)
    setErrores({})
    setApiError('')
    const transporte = getVehiculoById(transporteProp.idVehiculo)
    if (transporte) { setFormData(transporte); setFormOriginal(transporte) }
  }, [open, transporteProp, getVehiculoById])

  const handleChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'placa') value = value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (name === 'marca') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    if (name === 'modelo') value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s-]/g, '')
    if (name === 'color') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    if (name === 'capacidad') {
      value = value.replace(/[^0-9.]/g, '')
      if (value !== '') {
        const num = parseFloat(value)
        if (!isNaN(num) && num > CAPACIDAD_MAX) return
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
    setApiError('')
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
      else if (parseFloat(formData.capacidad) <= 0) e.capacidad = 'La capacidad debe ser mayor a 0'
      else if (parseFloat(formData.capacidad) > CAPACIDAD_MAX) e.capacidad = `La capacidad no puede ser mayor a ${CAPACIDAD_MAX.toLocaleString('es-CO')} kg`
    }
    if (step === 1) {
      if (!formData.idPropietario) e.idPropietario = 'El propietario es obligatorio'
      if (!formData.vencimientoSOAT) e.vencimientoSOAT = 'La fecha de vencimiento del SOAT es obligatoria'
      else if (formData.vencimientoSOAT < hoyISO()) e.vencimientoSOAT = 'La fecha de vencimiento no puede ser anterior a hoy'
      if (!formData.vencimientoRevisionTecnica) e.vencimientoRevisionTecnica = 'La fecha de vencimiento de la Revisión Técnica es obligatoria'
      else if (formData.vencimientoRevisionTecnica < hoyISO()) e.vencimientoRevisionTecnica = 'La fecha de vencimiento no puede ser anterior a hoy'
      if (!formData.vencimientoSeguroTerceros) e.vencimientoSeguroTerceros = 'La fecha de vencimiento del Seguro de Terceros es obligatoria'
      else if (formData.vencimientoSeguroTerceros < hoyISO()) e.vencimientoSeguroTerceros = 'La fecha de vencimiento no puede ser anterior a hoy'
    }
    return e
  }

  const handleNext = () => {
    const e = validarPaso(activeStep)
    if (Object.keys(e).length > 0) { setErrores(e); return }
    setErrores({})
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

  const handleSubmit = async () => {
    if (formOriginal) {
      const hayCambios = Object.keys(formData).some(key => {
        const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
        const actual = formData[key] !== undefined ? String(formData[key]) : ''
        return original !== actual
      })
      if (!hayCambios) { setSinCambios(true); return }
    }
    setSinCambios(false)
    setSubmitting(true)
    try {
      await actualizarVehiculo({
        idVehiculo: parseInt(transporteProp?.idVehiculo),
        ...formData,
        capacidad: parseFloat(formData.capacidad),
        idPropietario: parseInt(formData.idPropietario)
      })
      showToast('¡Vehículo actualizado exitosamente!', 'success')
      setTimeout(() => { onClose(); if (onSuccess) onSuccess() }, 1500)
    } catch (err) {
      setApiError(getErrorMessage(err, 'Error al actualizar el vehículo'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField label="Placa" name="placa" value={formData.placa} onChange={handleChange} required
              placeholder="Ej: ABC-1234" icon={BadgeOutlined}
              error={errores.placa} helperText={errores.placa}
              inputProps={{ maxLength: 8 }} />
            <FormField label="Marca" name="marca" value={formData.marca} onChange={handleChange} required
              placeholder="Ej: Toyota" icon={SellOutlined}
              error={errores.marca} helperText={errores.marca}
              inputProps={{ maxLength: 30 }} />
            <FormField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} required
              placeholder="Ej: Hilux" icon={DirectionsCarOutlined}
              error={errores.modelo} helperText={errores.modelo}
              inputProps={{ maxLength: 30 }} />
            <FormField label="Color" name="color" value={formData.color} onChange={handleChange} required
              placeholder="Ej: Blanco" icon={InvertColorsOutlined}
              error={errores.color} helperText={errores.color}
              inputProps={{ maxLength: 20 }} />
            <FormSelect label="Tipo de Vehículo" name="tipo" value={formData.tipo} onChange={handleChange} required
              error={errores.tipo} helperText={errores.tipo}>
              {TIPOS_VEHICULO.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </FormSelect>
            <FormField label="Capacidad (kg)" name="capacidad" value={formData.capacidad}
              onChange={handleChange} required placeholder="Ej: 1500" icon={SpeedOutlined}
              error={errores.capacidad} helperText={errores.capacidad}
              inputProps={{ maxLength: 6 }} />
          </Box>
        )
      case 1:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormSelect label="Origen" name="origen" value={formData.origen} onChange={handleChange} required>
              <MenuItem value="Propio">Propio</MenuItem>
              <MenuItem value="Tercerizado">Tercerizado</MenuItem>
            </FormSelect>
            <Autocomplete
              options={propietarios.filter(p => p.habilitado !== false)}
              getOptionLabel={(p) => `${p.nombre} ${p.apellido} — ${p.numeroIdentificacion}`}
              isOptionEqualToValue={(opt, val) => opt.idPropietario === val.idPropietario}
              value={propietarios.find(p => p.idPropietario === formData.idPropietario) || null}
              onChange={(_, val) => handleChange({ target: { name: 'idPropietario', value: val ? val.idPropietario : '' } })}
              filterOptions={(opts, { inputValue }) => {
                if (!inputValue.trim()) {
                  return [...opts].sort((a, b) => b.idPropietario - a.idPropietario).slice(0, 5)
                }
                const q = normalizarTexto(inputValue)
                return opts.filter(p =>
                  normalizarTexto(p.nombre).includes(q) ||
                  normalizarTexto(p.apellido).includes(q) ||
                  normalizarTexto(`${p.nombre} ${p.apellido}`).includes(q) ||
                  normalizarTexto(p.numeroIdentificacion || '').includes(q) ||
                  normalizarTexto(p.telefono || '').includes(q)
                )
              }}
              noOptionsText="No se encontraron propietarios"
              renderInput={(params) => (
                <TextField {...params} label="Propietario *"
                  error={!!errores.idPropietario} helperText={errores.idPropietario || 'Busca por documento, nombre, apellido o teléfono'}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }}
                  sx={formFieldStyles} />
              )}
            />
            <FormField label="Vencimiento SOAT" name="vencimientoSOAT" type="date"
              value={formData.vencimientoSOAT} onChange={handleChange} required icon={EventOutlined}
              inputProps={{ min: hoyISO() }}
              error={errores.vencimientoSOAT} helperText={errores.vencimientoSOAT} />
            <FormField label="Vencimiento Revisión Técnica" name="vencimientoRevisionTecnica" type="date"
              value={formData.vencimientoRevisionTecnica} onChange={handleChange} required icon={EventOutlined}
              inputProps={{ min: hoyISO() }}
              error={errores.vencimientoRevisionTecnica} helperText={errores.vencimientoRevisionTecnica} />
            <FormField label="Vencimiento Seguro de Terceros" name="vencimientoSeguroTerceros" type="date"
              value={formData.vencimientoSeguroTerceros} onChange={handleChange} required icon={EventOutlined}
              inputProps={{ min: hoyISO() }}
              error={errores.vencimientoSeguroTerceros} helperText={errores.vencimientoSeguroTerceros} />
          </Box>
        )
      case 2: {
        const getNombrePropietario = (id) => {
          const p = propietarios.find(p => p.idPropietario === id)
          return p ? `${p.nombre} ${p.apellido}` : '—'
        }
        const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
        const camposComparados = formOriginal ? [
          [formData.placa, formOriginal.placa],
          [formData.marca, formOriginal.marca],
          [formData.modelo, formOriginal.modelo],
          [formData.color, formOriginal.color],
          [formData.tipo, formOriginal.tipo],
          [formData.capacidad, formOriginal.capacidad],
          [formData.origen, formOriginal.origen],
          [formData.idPropietario, formOriginal.idPropietario],
          [formData.vencimientoSOAT, formOriginal.vencimientoSOAT],
          [formData.vencimientoRevisionTecnica, formOriginal.vencimientoRevisionTecnica],
          [formData.vencimientoSeguroTerceros, formOriginal.vencimientoSeguroTerceros],
        ] : []
        const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {totalModificados > 0 && (
              <Alert severity="info" icon={<EditOutlined fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
              </Alert>
            )}
            {sinCambios && (
              <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                No has realizado ningún cambio. Los datos ya están actualizados.
              </Alert>
            )}
            {apiError && (
              <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError('')}>{apiError}</Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <DirectionsCarOutlined sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem">Datos del Vehículo</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del vehículo</Typography>
                <ConfirmRow label="Placa" value={formData.placa} previousValue={formOriginal?.placa} />
                <ConfirmRow label="Marca" value={formData.marca} previousValue={formOriginal?.marca} />
                <ConfirmRow label="Modelo" value={formData.modelo} previousValue={formOriginal?.modelo} />
                <ConfirmRow label="Color" value={formData.color} previousValue={formOriginal?.color} />
                <ConfirmRow label="Tipo" value={formData.tipo} previousValue={formOriginal?.tipo} />
                <ConfirmRow label="Capacidad" value={formData.capacidad ? `${formData.capacidad} kg` : ''} previousValue={formOriginal?.capacidad ? `${formOriginal.capacidad} kg` : undefined} />
              </Paper>
              <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <EventOutlined sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem">Documentación</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la documentación</Typography>
                <ConfirmRow label="Origen" value={formData.origen} previousValue={formOriginal?.origen} />
                <ConfirmRow label="Propietario" value={getNombrePropietario(formData.idPropietario)} previousValue={formOriginal ? getNombrePropietario(formOriginal.idPropietario) : undefined} />
                <ConfirmRow label="SOAT" value={formData.vencimientoSOAT} previousValue={formOriginal?.vencimientoSOAT} />
                <ConfirmRow label="Revisión Técnica" value={formData.vencimientoRevisionTecnica} previousValue={formOriginal?.vencimientoRevisionTecnica} />
                <ConfirmRow label="Seguro Terceros" value={formData.vencimientoSeguroTerceros} previousValue={formOriginal?.vencimientoSeguroTerceros} />
              </Paper>
            </Box>
          </Box>
        )
      }
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Editar Vehículo</Typography>
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
          }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <Box sx={{ px: 4, py: 2 }}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            {renderStepContent()}
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
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
          <Button onClick={onClose} disableRipple
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
              boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
              '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
            }}>
            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarVehiculo
