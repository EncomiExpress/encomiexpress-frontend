import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useConductor } from './context/ConductorContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, validarNumeroDocumento } from '../../shared/utils/documento.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { hoyISO } from '../../shared/utils/horarioLaboral.js'
import {
    steps, validarCampo, validarCategorias, validarPaso, PASSWORD_HELP, formInicialConductor,
} from './validations/conductorValidation.js'
import { useDuplicadoConductor } from './hooks/useDuplicadoConductor.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContacto from './components/wizard/PasoContacto.jsx'
import PasoLicencia from './components/wizard/PasoLicencia.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const VALIDATION_OPTS = { requerirPassword: true, checkVencidas: true }

const RegistrarConductor = ({ open, onClose, onSuccess }) => {
    const { registrarConductor } = useConductor()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)

    const [form, setForm] = useState(formInicialConductor())

    const {
        avisoNombreDuplicado, avisoDocDuplicado, avisoEmailDuplicado, avisoLicenciaDuplicada,
        setAvisoNombreDuplicado, setAvisoDocDuplicado, setAvisoEmailDuplicado, setAvisoLicenciaDuplicada,
        verificarDocumentoDuplicado, verificarEmailDuplicado, verificarLicenciaDuplicada, verificarNombreDuplicado,
    } = useDuplicadoConductor({ form, setErrores })

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'tipoIdentificacion') {
            setForm(prev => ({ ...prev, tipoIdentificacion: value, numeroIdentificacion: '' }))
            setErrores(prev => ({ ...prev, tipoIdentificacion: '', numeroIdentificacion: '' }))
            setAvisoDocDuplicado('')
            setApiError(null)
            return
        }
        if (name === 'nombre' || name === 'apellido') {
            value = capitalizarPalabras(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
            const formActualizado = { ...form, [name]: value }
            setForm(prev => ({ ...prev, [name]: value }))
            setAvisoNombreDuplicado('')
            setErrores(prev => {
                const next = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado, VALIDATION_OPTS) : '' }
                const otro = name === 'nombre' ? 'apellido' : 'nombre'
                if (prev[otro] === MENSAJE_NOMBRE_DUPLICADO) next[otro] = validarCampo(otro, formActualizado, VALIDATION_OPTS)
                return next
            })
            setApiError(null)
            return
        }
        if (name === 'numeroIdentificacion') {
            setAvisoDocDuplicado('')
            value = esDocAlfanumerico(form.tipoIdentificacion)
                ? value.replace(/[^a-zA-Z0-9]/g, '')
                : value.replace(/[^0-9]/g, '')
            setForm(prev => ({ ...prev, numeroIdentificacion: value }))
            setErrores(prev => prev.numeroIdentificacion
                ? { ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, value) || '' }
                : prev)
            setApiError(null)
            return
        }
        if (name === 'telefono') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'email') {
            value = value.replace(/[^a-zA-Z0-9@._%+-]/g, '')
            setAvisoEmailDuplicado('')
        }
        if (name === 'numeroLicencia') {
            setAvisoLicenciaDuplicada('')
        }
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => {
            const siguiente = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado, VALIDATION_OPTS) : '' }
            // Si se corrige la contraseña, revalida también "confirmar contraseña" si ya estaba marcado con error
            if (name === 'password' && prev.confirmarPassword) {
                siguiente.confirmarPassword = validarCampo('confirmarPassword', formActualizado, VALIDATION_OPTS)
            }
            return siguiente
        })
        setApiError(null)
    }

    // El número de licencia casi siempre coincide con el documento en Colombia —
    // se sugiere al llegar al paso de licencia, pero se puede cambiar.
    useEffect(() => {
        if (activeStep === 2 && !form.numeroLicencia && form.numeroIdentificacion) {
            setForm(prev => ({ ...prev, numeroLicencia: prev.numeroIdentificacion }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep])

    const handleCategoriaChange = (index, campo, value) => {
        const categoriasLicencia = form.categoriasLicencia.map((c, i) => i === index ? { ...c, [campo]: value } : c)
        setForm(prev => ({ ...prev, categoriasLicencia }))
        setErrores(prev => ({ ...prev, categoriasLicencia: prev.categoriasLicencia ? validarCategorias(categoriasLicencia, VALIDATION_OPTS) : '' }))
        setApiError(null)
    }

    const handleAgregarCategoria = () => {
        setForm(prev => ({ ...prev, categoriasLicencia: [...prev.categoriasLicencia, { categoria: '', vencimiento: '' }] }))
    }

    const handleQuitarCategoria = (index) => {
        const categoriasLicencia = form.categoriasLicencia.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, categoriasLicencia }))
        setErrores(prev => ({ ...prev, categoriasLicencia: prev.categoriasLicencia ? validarCategorias(categoriasLicencia, VALIDATION_OPTS) : '' }))
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado, avisoLicenciaDuplicada }, VALIDATION_OPTS)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleCancelar = () => handleClose()

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(formInicialConductor())
        setShowPassword(false)
        setShowConfirmarPassword(false)
        setErrores({})
        setActiveStep(0)
        onClose()
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            const { confirmarPassword: _confirmarPassword, ...resto } = form
            await registrarConductor({
                ...resto,
                habilitado: true,
                estado: 'Disponible'
            })
            showToast('¡Conductor registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el conductor'))
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
                        validationOpts={VALIDATION_OPTS}
                    />
                )
            case 1:
                return (
                    <PasoContacto
                        form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        verificarEmailDuplicado={verificarEmailDuplicado} validationOpts={VALIDATION_OPTS}
                        showPassword={showPassword} setShowPassword={setShowPassword}
                        showConfirmarPassword={showConfirmarPassword} setShowConfirmarPassword={setShowConfirmarPassword}
                        passwordLabel="Contraseña inicial" passwordRequired={true} passwordHelperText={PASSWORD_HELP}
                    />
                )
            case 2:
                return (
                    <PasoLicencia
                        theme={theme} form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        handleCategoriaChange={handleCategoriaChange} handleAgregarCategoria={handleAgregarCategoria} handleQuitarCategoria={handleQuitarCategoria}
                        verificarLicenciaDuplicada={verificarLicenciaDuplicada} validationOpts={VALIDATION_OPTS}
                        numeroLicenciaHelperText="Se autocompleta con el documento — puedes cambiarlo"
                        minVencimiento={hoyISO()}
                    />
                )
            case 3:
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
            title="Registrar Conductor" subtitle="Complete los datos del nuevo conductor paso a paso."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarConductor
