import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useDestino } from './context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { limpiarMonedaInput } from '../../shared/utils/formatters.js'
import {
    steps, OTRA_CIUDAD, OTRO_DEPARTAMENTO, TARIFA_MAX,
    validarCampo, validarCiudadDuplicada, validarPaso,
} from './validations/destinoValidation.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoUbicacion from './components/wizard/PasoUbicacion.jsx'
import PasoTarifa from './components/wizard/PasoTarifa.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const RegistrarDestino = ({ open, onClose, onSuccess }) => {
    const { registrarDestino, destinos } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        departamento: '',
        ciudad: '',
        direccion: '',
        tarifaBase: '',
    })
    // true cuando el usuario eligió "Otra ciudad" en el select y está escribiendo el
    // nombre a mano en vez de elegir una de la lista conocida.
    const [ciudadOtra, setCiudadOtra] = useState(false)
    // true cuando eligió "Otro departamento" -- fuerza también ciudadOtra, porque no
    // hay ninguna lista de ciudades conocida para un departamento fuera de la lista.
    const [departamentoOtro, setDepartamentoOtro] = useState(false)

    const validarCiudadDup = (ciudad) => validarCiudadDuplicada(destinos, ciudad)

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target
        if (name === 'ciudad' || name === 'departamento') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
        }
        if (name === 'tarifaBase') {
            // Solo dígitos — los puntos de miles se muestran solos (formatearMoneda),
            // nunca se escriben a mano. Sin decimales: los valores de tarifa en pesos
            // colombianos no manejan centavos.
            value = limpiarMonedaInput(value)
            const num = parseFloat(value)
            if (!isNaN(num) && num > TARIFA_MAX) return
        }
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => {
            if (!prev[name]) return prev
            if (name === 'ciudad') return { ...prev, ciudad: validarCampo('ciudad', formActualizado) || validarCiudadDup(value) }
            return { ...prev, [name]: validarCampo(name, formActualizado) }
        })
        setApiError(null)
    }

    // Select de Ciudad: elegir un valor real de la lista fija la ciudad tal cual;
    // elegir el sentinel OTRA_CIUDAD abre el campo de texto libre en su lugar.
    const handleCiudadSelectChange = (e) => {
        const { value } = e.target
        if (value === OTRA_CIUDAD) {
            setCiudadOtra(true)
            setForm(prev => ({ ...prev, ciudad: '' }))
        } else {
            setCiudadOtra(false)
            const formActualizado = { ...form, ciudad: value }
            setForm(prev => ({ ...prev, ciudad: value }))
            setErrores(prev => prev.ciudad ? { ...prev, ciudad: validarCampo('ciudad', formActualizado) || validarCiudadDup(value) } : prev)
        }
        setApiError(null)
    }

    // Select de Departamento: elegir un valor real limpia la ciudad (depende del
    // departamento); elegir el sentinel OTRO_DEPARTAMENTO abre el campo de texto libre
    // para el departamento Y fuerza el de ciudad, porque no hay lista conocida para un
    // departamento que no está en la lista.
    const handleDepartamentoSelectChange = (e) => {
        const { value } = e.target
        if (value === OTRO_DEPARTAMENTO) {
            setDepartamentoOtro(true)
            setCiudadOtra(true)
            setForm(prev => ({ ...prev, departamento: '', ciudad: '' }))
        } else {
            setDepartamentoOtro(false)
            setCiudadOtra(false)
            const formActualizado = { ...form, departamento: value, ciudad: '' }
            setForm(prev => ({ ...prev, departamento: value, ciudad: '' }))
            setErrores(prev => ({ ...prev, departamento: prev.departamento ? validarCampo('departamento', formActualizado) : prev.departamento, ciudad: undefined }))
        }
        setApiError(null)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, destinos)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            await registrarDestino({
                departamento: form.departamento,
                ciudad: form.ciudad,
                direccion: form.direccion?.trim() || null,
                tarifaBase: Number(form.tarifaBase) || 0,
            })
            showToast('¡Destino registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el destino'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ departamento: '', ciudad: '', direccion: '', tarifaBase: '' })
        setCiudadOtra(false)
        setDepartamentoOtro(false)
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        onClose()
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoUbicacion
                        theme={theme} form={form} setForm={setForm} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        handleDepartamentoSelectChange={handleDepartamentoSelectChange} handleCiudadSelectChange={handleCiudadSelectChange}
                        validarCiudadDup={validarCiudadDup}
                        ciudadOtra={ciudadOtra} setCiudadOtra={setCiudadOtra}
                        departamentoOtro={departamentoOtro} setDepartamentoOtro={setDepartamentoOtro}
                    />
                )
            case 1:
                return (
                    <PasoTarifa form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={null}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={false} setSinCambios={() => {}}
                    />
                )
            default:
                return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Registrar Destino" subtitle="Complete los datos del nuevo destino paso a paso."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarDestino
