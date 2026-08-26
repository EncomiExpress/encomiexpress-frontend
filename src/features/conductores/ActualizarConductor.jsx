import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import {
    Box, Typography, Stepper, Step, StepLabel,
    Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useConductor } from './context/ConductorContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, validarNumeroDocumento } from '../../shared/utils/documento.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import {
    steps, validarCampo, validarCategorias, validarPaso, PASSWORD_HELP, formInicialConductor,
} from './utils/conductorValidation.js'
import { useDuplicadoConductor } from './hooks/useDuplicadoConductor.js'
import { stepperSx, backButtonSx, cancelButtonSx, primaryButtonSx } from './style/wizardStyles.js'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContacto from './components/wizard/PasoContacto.jsx'
import PasoLicencia from './components/wizard/PasoLicencia.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const VALIDATION_OPTS = { validarFormatoApellido: true }

const ActualizarConductor = ({ open, onClose, conductor: conductorProp, onSuccess }) => {
    const { getConductorById, actualizarConductor, fetchConductores } = useConductor()
    const { showToast } = useToast()
    const theme = useTheme()
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)
    const [form, setForm] = useState(formInicialConductor())
    const cargado = useRef(false)

    const {
        avisoNombreDuplicado, avisoDocDuplicado, avisoEmailDuplicado, avisoLicenciaDuplicada,
        setAvisoNombreDuplicado, setAvisoDocDuplicado, setAvisoEmailDuplicado, setAvisoLicenciaDuplicada,
        verificarDocumentoDuplicado, verificarEmailDuplicado, verificarLicenciaDuplicada, verificarNombreDuplicado,
    } = useDuplicadoConductor({
        form, setErrores,
        excludeConductorId: conductorProp?.idConductor,
        excludeUsuarioId: conductorProp?.usuario?.idUsuario,
    })

    useEffect(() => {
        if (!open) { cargado.current = false; return }
        if (!conductorProp || cargado.current) return
        cargado.current = true
        setActiveStep(0)
        setErrores({})
        setSinCambios(false)
        setApiError(null)

        // Buscar en el store local (datos ya aplanados por fetchConductores)
        const conductor = getConductorById(conductorProp.idConductor) || conductorProp

        const datosForm = {
            tipoIdentificacion: conductor.tipoIdentificacion || '',
            numeroIdentificacion: conductor.numeroIdentificacion || '',
            nombre: conductor.nombre || '',
            apellido: conductor.apellido || '',
            telefono: conductor.telefono || '',
            email: conductor.email || '',
            password: '',
            confirmarPassword: '',
            categoriasLicencia: conductor.categoriasLicencia?.length
                ? conductor.categoriasLicencia
                : [{ categoria: '', vencimiento: '' }],
            numeroLicencia: conductor.numeroLicencia || '',
        }
        setForm(datosForm)
        setFormOriginal(datosForm)
    }, [open, conductorProp, getConductorById])

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'tipoIdentificacion') {
            setForm(prev => ({ ...prev, tipoIdentificacion: value, numeroIdentificacion: '' }))
            setErrores(prev => ({ ...prev, tipoIdentificacion: '', numeroIdentificacion: '' }))
            setAvisoDocDuplicado('')
            setApiError(null)
            setSinCambios(false)
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
            setSinCambios(false)
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
            setSinCambios(false)
            return
        }
        if (name === 'telefono') value = value.replace(/[^0-9]/g, '')
        if (name === 'email') {
            value = value.replace(/[^a-zA-Z0-9@._%+-]/g, '')
            setAvisoEmailDuplicado('')
        }
        if (name === 'numeroLicencia') setAvisoLicenciaDuplicada('')
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

    const handleCategoriaChange = (index, campo, value) => {
        const categoriasLicencia = form.categoriasLicencia.map((c, i) => i === index ? { ...c, [campo]: value } : c)
        setForm(prev => ({ ...prev, categoriasLicencia }))
        setErrores(prev => ({ ...prev, categoriasLicencia: prev.categoriasLicencia ? validarCategorias(categoriasLicencia, VALIDATION_OPTS) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const handleAgregarCategoria = () => {
        setForm(prev => ({ ...prev, categoriasLicencia: [...prev.categoriasLicencia, { categoria: '', vencimiento: '' }] }))
        setSinCambios(false)
    }

    const handleQuitarCategoria = (index) => {
        const categoriasLicencia = form.categoriasLicencia.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, categoriasLicencia }))
        setErrores(prev => ({ ...prev, categoriasLicencia: prev.categoriasLicencia ? validarCategorias(categoriasLicencia, VALIDATION_OPTS) : '' }))
        setSinCambios(false)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado, avisoLicenciaDuplicada }, VALIDATION_OPTS)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const cerrar = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        onClose()
    }

    const handleCancelar = () => cerrar()

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado, avisoLicenciaDuplicada }, VALIDATION_OPTS)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }

        // Detectar si realmente hubo cambios
        if (formOriginal) {
            const hayCambiosSimples = Object.keys(form).some(key =>
                key !== 'categoriasLicencia' && String(formOriginal[key] ?? '') !== String(form[key] ?? '')
            )
            const hayCambiosLicencia = JSON.stringify(formOriginal.categoriasLicencia) !== JSON.stringify(form.categoriasLicencia)
            if (!hayCambiosSimples && !hayCambiosLicencia) { setSinCambios(true); return }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)

        try {
            const { categoriasLicencia, numeroLicencia, confirmarPassword: _confirmarPassword, password, ...resto } = form

            await actualizarConductor(
                parseInt(conductorProp?.idConductor),
                {
                    ...resto,
                    categoriasLicencia,
                    numeroLicencia: numeroLicencia || null,
                    ...(password ? { password } : {}),
                }
            )

            await fetchConductores()
            showToast('¡Conductor actualizado exitosamente!', 'success')
            setTimeout(() => {
                cerrar()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar el conductor'))
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
                        passwordLabel="Nueva contraseña" passwordRequired={false}
                        passwordHelperText={form.password ? PASSWORD_HELP : 'Dejar vacío para mantener la actual'}
                    />
                )
            case 2:
                return (
                    <PasoLicencia
                        theme={theme} form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        handleCategoriaChange={handleCategoriaChange} handleAgregarCategoria={handleAgregarCategoria} handleQuitarCategoria={handleQuitarCategoria}
                        verificarLicenciaDuplicada={verificarLicenciaDuplicada} validationOpts={VALIDATION_OPTS}
                        numeroLicenciaHelperText="Opcional"
                        minVencimiento={undefined}
                    />
                )
            case 3:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={formOriginal}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={sinCambios} setSinCambios={setSinCambios}
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
                    <Typography variant="h6" fontWeight={700}>Editar Conductor</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        {formOriginal?.nombre && formOriginal?.apellido
                            ? `Modificando datos de ${formOriginal.nombre} ${formOriginal.apellido}`
                            : 'Modifica los campos que necesites.'}
                    </Typography>
                </Box>
                <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}><CloseIcon /></IconButton>
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
                <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined" startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={backButtonSx(theme)}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleCancelar} disableRipple
                        sx={cancelButtonSx(theme)}>
                        Cancelar
                    </Button>
                    <Button onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained" disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
                        disableRipple
                        sx={primaryButtonSx(theme, { minWidth: 170, disabledStyle: true })}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarConductor
