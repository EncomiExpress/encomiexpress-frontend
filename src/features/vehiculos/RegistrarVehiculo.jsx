import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { CheckOutlined } from '@mui/icons-material'
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
import WizardDialog from '../../shared/components/WizardDialog.jsx'
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
    <WizardDialog
      open={open} onClose={handleClose}
      title="Registrar Vehículo" subtitle="Ingresa los datos del nuevo vehículo"
      steps={steps} activeStep={activeStep}
      onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
      submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlined />}
    >
      {renderStepContent()}
    </WizardDialog>
  )
}

export default RegistrarVehiculo
