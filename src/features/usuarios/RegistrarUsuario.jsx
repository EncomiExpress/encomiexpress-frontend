import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Stepper, Step, StepLabel, Button, CircularProgress } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, validarNumeroDocumento } from '../../shared/utils/documento.js'
import { steps, validarCampo, validarPaso, PASSWORD_HELP } from './utils/usuarioValidation.js'
import { useDuplicadoUsuario } from './hooks/useDuplicadoUsuario.js'
import { stepperSx, backButtonSx, cancelButtonSx, primaryButtonSx } from './style/wizardStyles.js'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContactoRol from './components/wizard/PasoContactoRol.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const VALIDATION_OPTS = { requerirPassword: true }

const RegistrarUsuario = ({ open, onClose, onSuccess }) => {
    const { tienePermiso, registrarUsuario, getRolesBackend } = useAuth()
    const { showToast } = useToast()
    const theme = useTheme()
    const navigate = useNavigate()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [rolesDisponibles, setRolesDisponibles] = useState([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)

    useEffect(() => {
        const cargarRoles = async () => {
            const respuesta = await getRolesBackend({ habilitado: 'true' })
            if (respuesta.success) {
                const filtrados = (respuesta.data || []).filter(r => r.nombre?.toLowerCase() !== 'conductor')
                setRolesDisponibles(filtrados)
                const adminRol = filtrados.find(r => r.nombre?.toLowerCase() === 'admin')
                if (adminRol) setForm(prev => ({ ...prev, idRol: adminRol.idRol }))
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
        password: '',
        confirmarPassword: '',
        idRol: '',
    })

    const {
        avisoNombreDuplicado, avisoDocDuplicado, avisoEmailDuplicado,
        setAvisoNombreDuplicado, setAvisoDocDuplicado, setAvisoEmailDuplicado,
        verificarDocumentoDuplicado, verificarEmailDuplicado, verificarNombreDuplicado,
    } = useDuplicadoUsuario({ form, setErrores })

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
            return
        }
        if (name === 'numeroIdentificacion') {
            value = esDocAlfanumerico(form.tipoIdentificacion)
                ? value.replace(/[^a-zA-Z0-9]/g, '')
                : value.replace(/[^0-9]/g, '')
            setAvisoDocDuplicado('')
            setForm(prev => ({ ...prev, numeroIdentificacion: value }))
            // Si el campo ya estaba marcado con error, revalida en vivo con cada tecla
            // para que el error se quite apenas quede corregido (no solo al salir del campo).
            setErrores(prev => prev.numeroIdentificacion
                ? { ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, value) || '' }
                : prev)
            setApiError(null)
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
        setSubmitting(true)
        setApiError(null)
        try {
            const { password, confirmarPassword: _confirmarPassword, ...resto } = form
            const datosBackend = {
                ...resto,
                password,
            }

            const result = await registrarUsuario(datosBackend, false)

            if (result.success) {
                showToast('¡Usuario registrado exitosamente!', 'success')
                setTimeout(() => {
                    handleClose()
                    if (onSuccess) onSuccess()
                }, 1500)
            } else {
                setApiError(result.mensaje || 'Error al registrar usuario')
            }
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el usuario'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({
            nombre: '',
            apellido: '',
            tipoIdentificacion: '',
            numeroIdentificacion: '',
            telefono: '',
            email: '',
            password: '',
            confirmarPassword: '',
            idRol: '',
        })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        onClose()
    }

    const handleCancelar = () => handleClose()

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
                        passwordLabel="Contraseña" passwordRequired={true} passwordHelperText={PASSWORD_HELP}
                        rolesDisponibles={rolesDisponibles}
                    />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={null} rolesDisponibles={rolesDisponibles}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={false} setSinCambios={() => {}}
                        camposCambiados={{}}
                    />
                )
            default:
                return null
        }
    }

    if (!tienePermiso('registrar_usuario')) {
        return null
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Registrar Usuario
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Complete los datos del nuevo usuario paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>

                <Stepper activeStep={activeStep} alternativeLabel
                    sx={stepperSx(theme)}
                >
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Box sx={{ px: 4, py: 2 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>
            </DialogContent>

            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`,
            }}>
                <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                    startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={backButtonSx(theme)}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleCancelar} disableRipple
                        sx={cancelButtonSx(theme)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
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

export default RegistrarUsuario
