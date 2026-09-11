import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { usePropietario } from './context/PropietarioContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico } from '../../shared/utils/documento.js'
import {
    steps, validarCampo, validarDocumentoCompleto, validarPaso, formatearNit, EMPTY_FORM,
    TIPOS_DOC_PERMITIDOS,
} from './validations/propietarioValidation.js'
import { filtrarCorreo } from '../../shared/validations/emailValidation.js'
import { filtrarTelefono } from '../../shared/validations/telefonoValidation.js'
import { useDuplicadoPropietario } from './hooks/useDuplicadoPropietario.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContactoFlota from './components/wizard/PasoContactoFlota.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const RegistrarPropietario = ({ open, onClose, onSuccess }) => {
    const { registrarPropietario } = usePropietario()
    const { conductores } = useConductor()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)

    const {
        avisoNombreDuplicado, avisoDocDuplicado,
        setAvisoNombreDuplicado, setAvisoDocDuplicado,
        verificarDocumentoDuplicado, verificarNombreDuplicado,
    } = useDuplicadoPropietario({ form, setErrores })

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(EMPTY_FORM)
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        onClose()
    }

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'tipoIdentificacion') {
            setForm(prev => ({ ...prev, tipoIdentificacion: value, numeroIdentificacion: '' }))
            // Al cambiar entre NIT y persona natural, "apellido" aparece/desaparece del
            // formulario y "nombre" pasa a validarse distinto (razón social) — cualquier
            // error de nombre/apellido de antes del cambio queda obsoleto.
            setErrores(prev => ({ ...prev, tipoIdentificacion: '', numeroIdentificacion: '', nombre: '', apellido: '' }))
            setAvisoDocDuplicado('')
            setAvisoNombreDuplicado('')
            setApiError(null)
            return
        }
        if (name === 'nombre' || name === 'apellido') {
            // Razón social (NIT) es texto libre — no se filtra a solo-letras ni se
            // capitaliza, igual que en Cliente y en el destinatario de una Venta.
            if (!(name === 'nombre' && form.tipoIdentificacion === 'NIT')) value = capitalizarPalabras(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
            const formActualizado = { ...form, [name]: value }
            setForm(prev => ({ ...prev, [name]: value }))
            setAvisoNombreDuplicado('')
            setErrores(prev => {
                const next = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
                const otro = name === 'nombre' ? 'apellido' : 'nombre'
                if (prev[otro] === MENSAJE_NOMBRE_DUPLICADO) next[otro] = validarCampo(otro, formActualizado)
                return next
            })
            setApiError(null)
            return
        }
        if (name === 'numeroIdentificacion') {
            setAvisoDocDuplicado('')
            if (form.tipoIdentificacion === 'NIT') {
                value = formatearNit(value)
            } else if (esDocAlfanumerico(form.tipoIdentificacion)) {
                value = value.replace(/[^a-zA-Z0-9]/g, '')
            } else {
                value = value.replace(/[^0-9]/g, '')
            }
            setForm(prev => ({ ...prev, numeroIdentificacion: value }))
            setErrores(prev => prev.numeroIdentificacion
                ? { ...prev, numeroIdentificacion: validarDocumentoCompleto(form.tipoIdentificacion, value) || '' }
                : prev)
            setApiError(null)
            return
        }
        if (name === 'telefono') {
            value = filtrarTelefono(value, form.tipoIdentificacion)
        }
        if (name === 'email') {
            value = filtrarCorreo(value)
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    // Atajo "¿también es conductor?" (PasoDocumento.jsx) -- copia una sola vez los
    // datos del Conductor elegido hacia el formulario de Propietario. No queda ningún
    // vínculo entre las dos filas (Propietario no tiene FK a Conductor/Usuario, ver
    // LOGICA.md) -- de acá en adelante los campos son de edición libre, igual que si
    // se hubieran tecleado a mano.
    const handleAutocompletarDesdeConductor = (conductor) => {
        const tipoValido = TIPOS_DOC_PERMITIDOS.includes(conductor.tipoIdentificacion)
        setForm(prev => ({
            ...prev,
            ...(tipoValido ? { tipoIdentificacion: conductor.tipoIdentificacion } : {}),
            numeroIdentificacion: conductor.numeroIdentificacion || prev.numeroIdentificacion,
            nombre: conductor.nombre || prev.nombre,
            apellido: conductor.apellido || prev.apellido,
            telefono: conductor.telefono || prev.telefono,
            email: conductor.email || prev.email,
        }))
        setErrores({})
        setAvisoDocDuplicado('')
        setAvisoNombreDuplicado('')
        setApiError(null)
        if (!tipoValido) {
            showToast(
                `${conductor.nombre} tiene documento tipo ${conductor.tipoIdentificacion}, que no aplica para Propietario -- elige el tipo de documento manualmente.`,
                'warning'
            )
        }
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado })
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        // Se llama desde el último paso ("Confirmación", sin campos propios) — antes no
        // revalidaba nada. Revalida los pasos 0 y 1 y salta al primero con error.
        const erroresPaso0 = validarPaso(0, form, { avisoDocDuplicado, avisoNombreDuplicado })
        const erroresPaso1 = validarPaso(1, form, { avisoDocDuplicado, avisoNombreDuplicado })
        const erroresEncontrados = { ...erroresPaso0, ...erroresPaso1 }
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            setActiveStep(Object.keys(erroresPaso0).length > 0 ? 0 : 1)
            return
        }

        setSubmitting(true)
        setApiError(null)
        try {
            await registrarPropietario({
                ...form,
                apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido,
            })
            showToast('¡Propietario registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el propietario'))
        } finally {
            setSubmitting(false)
        }
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoDocumento
                        form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        verificarDocumentoDuplicado={verificarDocumentoDuplicado} verificarNombreDuplicado={verificarNombreDuplicado}
                        conductores={conductores} onSeleccionarConductor={handleAutocompletarDesdeConductor}
                    />
                )
            case 1:
                return (
                    <PasoContactoFlota form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} />
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
            title="Registrar Propietario" subtitle="Complete los datos del nuevo propietario paso a paso."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarPropietario
