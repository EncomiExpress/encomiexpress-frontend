import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useClientes } from './context/ClienteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico } from '../../shared/utils/documento.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { steps, validarCampo, validarDocumentoCompleto, validarPaso } from './validations/clienteValidation.js'
import { useDuplicadoCliente } from './hooks/useDuplicadoCliente.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContacto from './components/wizard/PasoContacto.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const RegistrarCliente = ({ open, onClose, onSuccess }) => {
    const { agregarCliente } = useClientes()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        direccion: '',
        habilitado: true
    })

    const {
        avisoNombreDuplicado, avisoDocDuplicado,
        setAvisoNombreDuplicado, setAvisoDocDuplicado,
        verificarDocumentoDuplicado, verificarNombreDuplicado,
    } = useDuplicadoCliente({ form, setErrores })

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({
            nombre: '',
            apellido: '',
            tipoIdentificacion: '',
            numeroIdentificacion: '',
            telefono: '',
            email: '',
            direccion: '',
            habilitado: true
        })
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
            if (!(name === 'nombre' && form.tipoIdentificacion === 'NIT')) value = capitalizarPalabras(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
            const formActualizado = { ...form, [name]: value }
            setForm(prev => ({ ...prev, [name]: value }))
            setAvisoNombreDuplicado('')
            setErrores(prev => {
                const next = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
                // El duplicado es por la combinación nombre+apellido: si el otro campo
                // estaba marcado por esa misma razón, se limpia también (el próximo blur
                // de cualquiera de los dos lo vuelve a verificar).
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
                value = value.replace(/[^0-9-]/g, '')
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
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'email') {
            value = value.replace(/[^a-zA-Z0-9@._%+-]/g, '')
        }
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado })
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            const creado = await agregarCliente({ ...form, apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido })
            showToast('¡Cliente registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess(creado)
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el cliente'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => handleClose()

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoDocumento
                        form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        verificarDocumentoDuplicado={verificarDocumentoDuplicado} verificarNombreDuplicado={verificarNombreDuplicado}
                    />
                )
            case 1:
                return (
                    <PasoContacto form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} />
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
            open={open} onClose={handleCancelar}
            title="Registrar Cliente" subtitle="Complete los datos del nuevo cliente paso a paso."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarCliente
