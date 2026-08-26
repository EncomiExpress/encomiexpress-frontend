import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Stepper, Step, StepLabel, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from '@mui/material'
import { SaveOutlined, ArrowBackOutlined, ArrowForwardOutlined, Close } from '@mui/icons-material'
import { useVehiculo } from './context/VehiculoContext.jsx'
import { usePropietario } from '../propietarios/context/PropietarioContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { limpiarDecimalInput, capitalizarPrimeraLetra } from '../../shared/utils/formatters.js'
import {
    stepsActualizar as steps, TIPOS_VEHICULO, limpiarPlacaInput, CAPACIDAD_MAX,
    validarCampo, validarPaso,
} from './utils/vehiculoValidation.js'
import { useDuplicadoVehiculo } from './hooks/useDuplicadoVehiculo.js'
import { stepperSx, backButtonSx, cancelButtonSx, primaryButtonSx } from './style/wizardStyles.js'
import PasoDatosVehiculo from './components/wizard/PasoDatosVehiculo.jsx'
import PasoPropietarioDocumentacion from './components/wizard/PasoPropietarioDocumentacion.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const VALIDATION_OPTS = {}

const ActualizarVehiculo = ({ open, onClose, transporte: transporteProp, onSuccess }) => {
  const { getVehiculoById, actualizarVehiculo } = useVehiculo()
  const { showToast } = useToast()
  const theme = useTheme()
  const { propietarios } = usePropietario()

  const [formData, setFormData] = useState({
    idPropietario: '', placa: '', tarjetaPropiedad: '', marca: '', modelo: '', color: '',
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

  const { avisoPlacaDuplicada, setAvisoPlacaDuplicada, verificarPlacaDuplicada } = useDuplicadoVehiculo({ formData, setErrores, excludeId: formData.idVehiculo })

  useEffect(() => {
    if (!open) { cargado.current = false; return }
    if (!transporteProp || cargado.current) return
    cargado.current = true
    setActiveStep(0)
    setSinCambios(false)
    setErrores({})
    setApiError('')
    const transporte = getVehiculoById(transporteProp.idVehiculo)
    if (transporte) {
      // Si el tipo guardado no está en la lista fija, es un tipo "personalizado"
      // que se escribió a mano — el select se muestra en "Otro" con ese valor
      // en el campo de texto.
      const esTipoFijo = TIPOS_VEHICULO.includes(transporte.tipo)
      const datos = {
        ...transporte,
        tipo: esTipoFijo ? transporte.tipo : 'Otro',
        tipoOtro: esTipoFijo ? '' : (transporte.tipo || ''),
      }
      setFormData(datos)
      setFormOriginal(datos)
    }
  }, [open, transporteProp, getVehiculoById])

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
    setSinCambios(false)
  }

  const handleNext = () => {
    const e = validarPaso(activeStep, formData, avisoPlacaDuplicada, VALIDATION_OPTS)
    if (Object.keys(e).length > 0) { setErrores(e); return }
    setErrores({})
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

  const cerrar = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    onClose()
  }

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
        tipo: formData.tipo === 'Otro' ? formData.tipoOtro.trim() : formData.tipo,
        capacidad: parseFloat(formData.capacidad),
        idPropietario: parseInt(formData.idPropietario)
      })
      showToast('¡Vehículo actualizado exitosamente!', 'success')
      setTimeout(() => { cerrar(); if (onSuccess) onSuccess() }, 1500)
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
          <PasoDatosVehiculo
            formData={formData} setFormData={setFormData} errores={errores} setErrores={setErrores}
            handleChange={handleChange} verificarPlacaDuplicada={verificarPlacaDuplicada} validationOpts={VALIDATION_OPTS}
          />
        )
      case 1:
        return (
          <PasoPropietarioDocumentacion
            theme={theme} formData={formData} errores={errores} setErrores={setErrores} handleChange={handleChange}
            propietarios={propietarios} validationOpts={VALIDATION_OPTS} minFecha={undefined}
          />
        )
      case 2:
        return (
          <PasoConfirmacion
            theme={theme} formData={formData} formOriginal={formOriginal}
            apiError={apiError} setApiError={setApiError}
            sinCambios={sinCambios} setSinCambios={setSinCambios}
            propietarios={propietarios}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth
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
        <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1.5 }}>
        <Stepper activeStep={activeStep} alternativeLabel
          sx={stepperSx(theme)}>
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
          sx={backButtonSx(theme)}>
          Anterior
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={cerrar} disableRipple
            sx={cancelButtonSx(theme)}>
            Cancelar
          </Button>
          <Button
            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
            variant="contained"
            disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
            endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlined /> : <SaveOutlined />)}
            disableRipple
            sx={primaryButtonSx(theme, { minWidth: 170 })}>
            {submitting
              ? <CircularProgress size={18} color="inherit" />
              : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarVehiculo
