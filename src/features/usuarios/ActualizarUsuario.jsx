import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useAuth, ROLES } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, validarNumeroDocumento } from '../../shared/utils/documento.js'
import { steps, validarCampo, validarPaso, PASSWORD_HELP } from './validations/usuarioValidation.js'
import { useDuplicadoUsuario } from './hooks/useDuplicadoUsuario.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContactoRol from './components/wizard/PasoContactoRol.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const VALIDATION_OPTS = {}

const ActualizarUsuario = ({ open, onClose, usuario: usuarioProp, onSuccess }) => {
    const { actualizarUsuario, getRolesBackend } = useAuth()
    const { showToast } = useToast()
    const theme = useTheme()
    const navigate = useNavigate()
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [rolesDisponibles, setRolesDisponibles] = useState([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)

    useEffect(() => {
        const cargarRoles = async () => {
            const respuesta = await getRolesBackend({ habilitado: 'true' })
            if (respuesta.success) {
                setRolesDisponibles((respuesta.data || []).filter(r => r.nombre?.toLowerCase() !== 'conductor'))
            }
        }
        cargarRoles()
    }, [getRolesBackend])

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        idRol: '',
        password: '',
        confirmarPassword: '',
    })

    const {
        avisoNombreDuplicado, avisoDocDuplicado, avisoEmailDuplicado,
        setAvisoNombreDuplicado, setAvisoDocDuplicado, setAvisoEmailDuplicado,
        verificarDocumentoDuplicado, verificarEmailDuplicado, verificarNombreDuplicado,
    } = useDuplicadoUsuario({ form, setErrores, excludeId: usuarioProp?.idUsuario })

    const getCamposCambiados = () => {
        if (!formOriginal) return {}
        const keysToCompare = ['nombre', 'apellido', 'tipoIdentificacion', 'numeroIdentificacion', 'telefono', 'idRol']
        const cambios = {}

        keysToCompare.forEach(key => {
            const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
            const actual = form[key] !== undefined ? String(form[key]) : ''
            cambios[key] = original !== actual
        })

        cambios.email = (formOriginal.email || '') !== (form.email || '')

        if (form.password) {
            cambios.password = true
        }

        return cambios
    }

    useEffect(() => {
        if (open && usuarioProp) {
            setActiveStep(0)
            setErrores({})
            setSinCambios(false)
            const usuario = usuarioProp
            const rolId = Object.values(ROLES).find(r => r.nombre === usuario.rol?.nombre)?.id || ''

            const datosForm = {
                ...usuario,
                email: usuario.email || '',
                idRol: rolId,
                password: '',
                confirmarPassword: '',
            }
            setForm(datosForm)
            setFormOriginal(datosForm)
        }
    }, [open, usuarioProp])

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

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
            setSinCambios(false)
            return
        }
        if (name === 'telefono') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'tipoIdentificacion') {
            setForm(prev => ({ ...prev, tipoIdentificacion: value, numeroIdentificacion: '' }))
            setErrores(prev => ({ ...prev, tipoIdentificacion: '', numeroIdentificacion: '' }))
            setAvisoDocDuplicado('')
            setApiError(null)
            setSinCambios(false)
            return
        }
        if (name === 'numeroIdentificacion') {
            value = esDocAlfanumerico(form.tipoIdentificacion)
                ? value.replace(/[^a-zA-Z0-9]/g, '')
                : value.replace(/[^0-9]/g, '')
            setAvisoDocDuplicado('')
            setForm(prev => ({ ...prev, numeroIdentificacion: value }))
            setErrores(prev => prev.numeroIdentificacion
                ? { ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, value) || '' }
                : prev)
            setApiError(null)
            setSinCambios(false)
            return
        }
        if (name === 'email') {
            value = value.replace(/[^a-zA-Z0-9@._%+-]/g, '')
            setAvisoEmailDuplicado('')
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
        setSinCambios(false)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado }, VALIDATION_OPTS)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado }, VALIDATION_OPTS)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }

        const cambios = getCamposCambiados()
        const hayCambios = Object.values(cambios).some(Boolean)

        if (!hayCambios) {
            setSinCambios(true)
            return
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            const datosBackend = {
                nombre: form.nombre,
                apellido: form.apellido,
                tipoIdentificacion: form.tipoIdentificacion,
                numeroIdentificacion: form.numeroIdentificacion,
                telefono: form.telefono,
                email: form.email,
                idRol: parseInt(form.idRol),
            }

            if (form.password) {
                datosBackend.password = form.password
            }

            await actualizarUsuario(usuarioProp.idUsuario, datosBackend)
            showToast('¡Usuario actualizado exitosamente!', 'success')
            setTimeout(() => {
                cerrar()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar el usuario'))
        } finally {
            setSubmitting(false)
        }
    }

    const cerrar = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        onClose()
    }

    const handleCancelar = () => cerrar()

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
                    <PasoContactoRol
                        theme={theme} navigate={navigate} form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        verificarEmailDuplicado={verificarEmailDuplicado} validationOpts={VALIDATION_OPTS}
                        showPassword={showPassword} setShowPassword={setShowPassword}
                        showConfirmarPassword={showConfirmarPassword} setShowConfirmarPassword={setShowConfirmarPassword}
                        passwordLabel="Nueva contraseña" passwordRequired={false}
                        passwordHelperText={form.password ? PASSWORD_HELP : 'Dejar vacío para mantener la actual'}
                        rolesDisponibles={rolesDisponibles}
                    />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={formOriginal} rolesDisponibles={rolesDisponibles}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={sinCambios} setSinCambios={setSinCambios}
                        camposCambiados={getCamposCambiados()}
                    />
                )
            default:
                return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleCancelar}
            title="Editar Usuario"
            subtitle={formOriginal?.nombre && formOriginal?.apellido
                ? `Modificando datos de ${formOriginal.nombre} ${formOriginal.apellido}`
                : 'Modifica los campos que necesites.'}
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitDisabled={sinCambios}
            submitLabel={sinCambios ? 'Sin cambios' : 'Guardar cambios'} submitIcon={<SaveOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default ActualizarUsuario
