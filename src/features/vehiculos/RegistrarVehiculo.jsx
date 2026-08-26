import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, IconButton, Button, CircularProgress, Typography } from '@mui/material'
import { Close, ArrowBackOutlined, ArrowForwardOutlined, CheckOutlined } from '@mui/icons-material'
import { useVehiculo } from './context/VehiculoContext.jsx'
import { usePropietario } from '../propietarios/context/PropietarioContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { limpiarDecimalInput, capitalizarPrimeraLetra } from '../../shared/utils/formatters.js'
import { hoyISO } from '../../shared/utils/horarioLaboral.js'
import {
    stepsRegistrar as steps, limpiarPlacaInput, CAPACIDAD_MAX,
    validarCampo, validarPaso,
} from './utils/vehiculoValidation.js'
import { useDuplicadoVehiculo } from './hooks/useDuplicadoVehiculo.js'
import { stepperSx, backButtonSx, cancelButtonSx, primaryButtonSx } from './style/wizardStyles.js'
import PasoDatosVehiculo from './components/wizard/PasoDatosVehiculo.jsx'
import PasoPropietarioDocumentacion from './components/wizard/PasoPropietarioDocumentacion.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const VALIDATION_OPTS = { checkFechaFutura: true, mensajeIdPropietario: 'Debes asignar un propietario' }

const RegistrarVehiculo = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    idPropietario: '',
    placa: '',
    tarjetaPropiedad: '',
    marca: '',
    modelo: '',
    color: '',
    tipo: '',
    tipoOtro: '',
    origen: 'Propio',
    capacidad: '',
    vencimientoSOAT: '',
    vencimientoRevisionTecnica: '',
    vencimientoSeguroTerceros: ''
  })
  const { showToast } = useToast()
  const [errores, setErrores] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const { registrarVehiculo } = useVehiculo()
  const theme = useTheme()
  const { propietarios } = usePropietario()

  const { avisoPlacaDuplicada, setAvisoPlacaDuplicada, verificarPlacaDuplicada } = useDuplicadoVehiculo({ formData, setErrores })

  const handleChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'placa') {
      setAvisoPlacaDuplicada('')
      value = limpiarPlacaInput(value)
    }
    if (name === 'marca') value = capitalizarPrimeraLetra(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
    if (name === 'modelo') value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s-]/g, '')
    if (name === 'color') value = capitalizarPrimeraLetra(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
    if (name === 'tipoOtro') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    if (name === 'tarjetaPropiedad') value = value.replace(/[^0-9]/g, '')
    if (name === 'capacidad') {
      value = limpiarDecimalInput(value)
      if (value !== '') {
        const num = parseFloat(value)
        if (!isNaN(num) && num > CAPACIDAD_MAX) return
      }
    }

    const formActualizado = { ...formData, [name]: value }
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrores(prev => {
      const siguiente = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado, VALIDATION_OPTS) : '' }
      // Si se corrige el tipo de vehículo, revalida también "tipoOtro" si ya estaba marcado con error
      if (name === 'tipo' && prev.tipoOtro) {
        siguiente.tipoOtro = validarCampo('tipoOtro', formActualizado, VALIDATION_OPTS)
      }
      return siguiente
    })
    setApiError('')
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setFormData({
      idPropietario: '', placa: '', tarjetaPropiedad: '', marca: '', modelo: '', color: '',
      tipo: '', tipoOtro: '', origen: 'Propio', capacidad: '',
      vencimientoSOAT: '', vencimientoRevisionTecnica: '', vencimientoSeguroTerceros: ''
    })
    setErrores({})
    setApiError('')
    setActiveStep(0)
    onClose()
  }

  const handleNext = () => {
    const e = validarPaso(activeStep, formData, avisoPlacaDuplicada, VALIDATION_OPTS)
    if (Object.keys(e).length > 0) { setErrores(e); return }
    setErrores({})
    setActiveStep((prev) => prev + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setApiError('')
    try {
      await registrarVehiculo({
        idPropietario: formData.idPropietario ? parseInt(formData.idPropietario, 10) : null,
        placa: formData.placa.trim(),
        tarjetaPropiedad: formData.tarjetaPropiedad?.trim() || null,
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        color: formData.color.trim(),
        tipo: formData.tipo === 'Otro' ? formData.tipoOtro.trim() : formData.tipo,
        capacidad: formData.capacidad ? parseFloat(formData.capacidad) : null,
        vencimientoSOAT: formData.vencimientoSOAT || null,
        vencimientoRevisionTecnica: formData.vencimientoRevisionTecnica || null,
        vencimientoSeguroTerceros: formData.vencimientoSeguroTerceros || null,
      })
      showToast('¡Vehículo registrado exitosamente!', 'success')
      setTimeout(() => { handleClose(); if (onSuccess) onSuccess() }, 1500)
    } catch (err) {
      setApiError(getErrorMessage(err, 'Error al registrar el vehículo'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PasoDatosVehiculo
            formData={formData} setFormData={setFormData} errores={errores} setErrores={setErrores}
            handleChange={handleChange} verificarPlacaDuplicada={verificarPlacaDuplicada} validationOpts={VALIDATION_OPTS}
          />
        )
      case 1:
        return (
          <PasoPropietarioDocumentacion
            theme={theme} formData={formData} errores={errores} setErrores={setErrores} handleChange={handleChange}
            propietarios={propietarios} validationOpts={VALIDATION_OPTS} minFecha={hoyISO()}
          />
        )
      case 2:
        return (
          <PasoConfirmacion
            theme={theme} formData={formData} formOriginal={null}
            apiError={apiError} setApiError={setApiError}
            sinCambios={false} setSinCambios={() => {}}
            propietarios={propietarios}
          />
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
          <Typography variant="h6" fontWeight={700}>Registrar Vehículo</Typography>
          <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5 }}>
            Ingresa los datos del nuevo vehículo
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1.5 }}>
        <Stepper activeStep={activeStep} alternativeLabel
          sx={stepperSx(theme)}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
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
          sx={backButtonSx(theme)}>
          Anterior
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={handleClose} disableRipple
            sx={cancelButtonSx(theme)}>
            Cancelar
          </Button>
          <Button
            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
            variant="contained" disabled={submitting}
            endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlined /> : <CheckOutlined />)}
            disableRipple
            sx={primaryButtonSx(theme, { minWidth: 160 })}>
            {submitting
              ? <CircularProgress size={18} color="inherit" />
              : (activeStep < steps.length - 1 ? 'Siguiente' : 'Registrar')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default RegistrarVehiculo
