import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useDestino } from './context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { limpiarMonedaInput } from '../../shared/utils/formatters.js'
import { filtrarDireccion } from '../../shared/validations/direccionValidation.js'
import {
    steps, TARIFA_MAX,
    validarCampo, validarMunicipioDuplicado, validarPaso,
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
        municipio: '',
        direccion: '',
        tarifaBase: '',
    })
    const validarMunicipioDup = (municipio) => validarMunicipioDuplicado(destinos, municipio)

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target
        if (name === 'municipio') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'direccion') {
            value = filtrarDireccion(value)
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
            if (name === 'municipio') return { ...prev, municipio: validarCampo('municipio', formActualizado) || validarMunicipioDup(value) }
            return { ...prev, [name]: validarCampo(name, formActualizado) }
        })
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
                municipio: form.municipio,
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
        setForm({ departamento: '', municipio: '', direccion: '', tarifaBase: '' })
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
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        validarMunicipioDup={validarMunicipioDup} destinos={destinos}
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
