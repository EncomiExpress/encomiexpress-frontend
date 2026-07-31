import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, IconButton, CircularProgress
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import * as conductorService from '../../shared/services/conductorService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO, MENSAJE_EMAIL_DUPLICADO, MENSAJE_LICENCIA_DUPLICADA } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, maxLengthDocumento, docHelperText, validarNumeroDocumento } from '../../shared/utils/documento.js'
import { esSoloRelleno } from '../../shared/utils/formatters.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validarEmail = (email) => {
    const valor = (email || '').trim()
    if (!valor) return 'El correo es obligatorio'
    if (!valor.includes('@')) return 'El correo debe contener un @ (ej: usuario@dominio.com)'
    if (!valor.split('@')[1]?.includes('.')) return 'El dominio del correo debe contener un punto (ej: usuario@dominio.com)'
    if (!EMAIL_REGEX.test(valor)) return 'El correo no es válido'
    return ''
}
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,64}$/
const PASSWORD_HELP = '8-64 caracteres, con mayúsculas, minúsculas, números y un carácter especial'
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/

const steps = ['Datos Personales', 'Contacto y Credenciales', 'Licencia', 'Confirmación']

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). numeroIdentificacion no vive
// aquí porque ya tiene su propia validación en shared/utils/documento.js.
const validarCampo = (name, form) => {
    switch (name) {
        case 'tipoIdentificacion':
            return form.tipoIdentificacion ? '' : 'Selecciona un tipo de documento'
        case 'nombre':
            if (!form.nombre.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (!form.apellido?.trim()) return 'El apellido es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.apellido)) return 'El apellido solo puede contener letras'
            return ''
        case 'telefono':
            if (!form.telefono.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefono)) return 'El teléfono debe tener 10 dígitos'
            return ''
        case 'email':
            return validarEmail(form.email)
        case 'password':
            if (form.password && !PASSWORD_REGEX.test(form.password)) return PASSWORD_HELP
            return ''
        case 'confirmarPassword':
            if (form.password && form.password !== form.confirmarPassword) return 'Las contraseñas no coinciden'
            return ''
        case 'numeroLicencia':
            if (form.numeroLicencia && esSoloRelleno(form.numeroLicencia)) return 'El número de licencia no puede contener solo espacios o guiones'
            return ''
        default:
            return ''
    }
}

// Sin chequeo de "vencidas" — igual que el validarPaso original de este archivo
// (a diferencia de RegistrarConductor.jsx, que sí lo valida).
const validarCategorias = (categoriasLicencia) => {
    const completas = categoriasLicencia.filter(c => c.categoria && c.vencimiento)
    const incompletas = categoriasLicencia.some(c => (c.categoria && !c.vencimiento) || (!c.categoria && c.vencimiento))
    if (completas.length === 0) return 'Agrega al menos una categoría con su fecha de vencimiento'
    if (incompletas) return 'Completa la categoría y la fecha en cada fila, o quita la fila'
    return ''
}

const CATEGORIAS_LICENCIA = [
    { value: 'A1', label: 'A1 - Motocicleta hasta 125 c.c.' },
    { value: 'A2', label: 'A2 - Motocicleta de más de 125 c.c.' },
    { value: 'B1', label: 'B1 - Automóvil, camioneta o microbús (particular)' },
    { value: 'B2', label: 'B2 - Camión rígido, buseta o bus (particular)' },
    { value: 'B3', label: 'B3 - Vehículo articulado (particular)' },
    { value: 'C1', label: 'C1 - Automóvil, camioneta o microbús (servicio público)' },
    { value: 'C2', label: 'C2 - Camión rígido, buseta o bus (servicio público)' },
    { value: 'C3', label: 'C3 - Vehículo articulado (servicio público)' },
]

const getTipoLabel = (tipo) => {
    const tipos = { 'CC': 'Cédula', 'CE': 'Cédula Extranjería', 'TI': 'Tarjeta Identidad', 'PAS': 'Pasaporte', 'RC': 'Registro Civil' }
    return tipos[tipo] || tipo
}

const getLicenciaLabel = (lic) => CATEGORIAS_LICENCIA.find(c => c.value === lic)?.label || lic || '—'

const FORM_INICIAL = {
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    categoriasLicencia: [{ categoria: '', vencimiento: '' }],
    numeroLicencia: '',
}

const ActualizarConductor = ({ open, onClose, conductor: conductorProp, onSuccess }) => {
    const { getConductorById, actualizarConductor, fetchConductores } = useConductor()
    const { showToast } = useToast()
    const theme = useTheme()
    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, elevation: 0, overflow: 'hidden',
    }
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')
    const [avisoEmailDuplicado, setAvisoEmailDuplicado] = useState('')
    const [avisoLicenciaDuplicada, setAvisoLicenciaDuplicada] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmarPassword, setShowConfirmarPassword] = useState(false)
    const [form, setForm] = useState(FORM_INICIAL)
    const cargado = useRef(false)

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
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
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
            const siguiente = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
            // Si se corrige la contraseña, revalida también "confirmar contraseña" si ya estaba marcado con error
            if (name === 'password' && prev.confirmarPassword) {
                siguiente.confirmarPassword = validarCampo('confirmarPassword', formActualizado)
            }
            return siguiente
        })
        setApiError(null)
        setSinCambios(false)
    }

    const handleCategoriaChange = (index, campo, value) => {
        const categoriasLicencia = form.categoriasLicencia.map((c, i) => i === index ? { ...c, [campo]: value } : c)
        setForm(prev => ({ ...prev, categoriasLicencia }))
        setErrores(prev => ({ ...prev, categoriasLicencia: prev.categoriasLicencia ? validarCategorias(categoriasLicencia) : '' }))
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
        setErrores(prev => ({ ...prev, categoriasLicencia: prev.categoriasLicencia ? validarCategorias(categoriasLicencia) : '' }))
        setSinCambios(false)
    }

    const verificarDocumentoDuplicado = async () => {
        if (!form.numeroIdentificacion.trim() || form.numeroIdentificacion.length < 3) {
            setAvisoDocDuplicado('')
            return
        }
        try {
            const res = await conductorService.getConductores(undefined, { q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion, {
                getDoc: (r) => r.usuario?.numeroIdentificacion || r.numeroIdentificacion,
                excludeId: conductorProp?.idConductor,
                getId: (r) => r.idConductor,
            })
            setAvisoDocDuplicado(duplicado ? MENSAJE_DOC_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, numeroIdentificacion: MENSAJE_DOC_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarEmailDuplicado = async () => {
        const valor = form.email.trim()
        if (!valor || validarEmail(valor)) {
            setAvisoEmailDuplicado('')
            return
        }
        try {
            const res = await conductorService.getConductores(undefined, { q: valor, limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, valor, {
                getDoc: (r) => r.usuario?.email || r.email,
                excludeId: conductorProp?.idConductor,
                getId: (r) => r.idConductor,
            })
            setAvisoEmailDuplicado(duplicado ? MENSAJE_EMAIL_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, email: MENSAJE_EMAIL_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarLicenciaDuplicada = async () => {
        if (!form.numeroLicencia.trim()) {
            setAvisoLicenciaDuplicada('')
            return
        }
        const errorRelleno = validarCampo('numeroLicencia', form)
        if (errorRelleno) {
            setErrores(prev => ({ ...prev, numeroLicencia: errorRelleno }))
            return
        }
        try {
            const res = await conductorService.getConductores(undefined, { q: form.numeroLicencia.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroLicencia, {
                getDoc: (r) => r.numeroLicencia,
                excludeId: conductorProp?.idConductor,
                getId: (r) => r.idConductor,
            })
            setAvisoLicenciaDuplicada(duplicado ? MENSAJE_LICENCIA_DUPLICADA : '')
            if (duplicado) setErrores(prev => ({ ...prev, numeroLicencia: MENSAJE_LICENCIA_DUPLICADA }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarNombreDuplicado = async () => {
        if (!form.nombre.trim() || !form.apellido.trim()) {
            setAvisoNombreDuplicado('')
            return
        }
        try {
            const res = await conductorService.getConductores(undefined, { q: form.apellido.trim(), limit: 20 })
            if (!res?.success) return
            const duplicado = hayNombreDuplicado(res.data, form.nombre, form.apellido, {
                getNombre: (r) => r.usuario?.nombre,
                getApellido: (r) => r.usuario?.apellido,
                getId: (r) => r.idConductor,
                excludeId: conductorProp?.idConductor,
            })
            setAvisoNombreDuplicado(duplicado ? MENSAJE_NOMBRE_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, nombre: MENSAJE_NOMBRE_DUPLICADO, apellido: MENSAJE_NOMBRE_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo de edición
        }
    }

    const validarPaso = (step) => {
        const e = {}
        if (step === 0) {
            e.tipoIdentificacion = validarCampo('tipoIdentificacion', form)
            const errorDocumento = validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion)
            e.numeroIdentificacion = errorDocumento || avisoDocDuplicado
            e.nombre = validarCampo('nombre', form) || avisoNombreDuplicado
            e.apellido = validarCampo('apellido', form) || avisoNombreDuplicado
        }
        if (step === 1) {
            e.telefono = validarCampo('telefono', form)
            e.email = validarCampo('email', form) || avisoEmailDuplicado
            e.password = validarCampo('password', form)
            e.confirmarPassword = validarCampo('confirmarPassword', form)
        }
        if (step === 2) {
            const errorCategorias = validarCategorias(form.categoriasLicencia)
            if (errorCategorias) e.categoriasLicencia = errorCategorias
            e.numeroLicencia = validarCampo('numeroLicencia', form) || avisoLicenciaDuplicada
        }
        Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
        return e
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep)
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
        const erroresEncontrados = validarPaso(activeStep)
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <TextField fullWidth select label="Tipo de documento *" name="tipoIdentificacion"
                            value={form.tipoIdentificacion} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacion: validarCampo('tipoIdentificacion', form) }))}
                            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
                            slotProps={{
                                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                                select: { IconComponent: KeyboardArrowDownOutlinedIcon },
                            }}
                            sx={formFieldStyles}>
                            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                            <MenuItem value="RC">Registro Civil (RC)</MenuItem>
                        </TextField>
                        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
                            onChange={handleChange}
                            onBlur={() => {
                                verificarDocumentoDuplicado()
                                setErrores(prev => ({ ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
                            }}
                            required error={errores.numeroIdentificacion}
                            helperText={errores.numeroIdentificacion || docHelperText(form.tipoIdentificacion)} icon={BadgeOutlinedIcon}
                            inputProps={{ maxLength: maxLengthDocumento(form.tipoIdentificacion) }} />
                        <FormField label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
                            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form) })) }}
                            required error={errores.nombre} helperText={errores.nombre} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Juan" />
                        <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form) })) }}
                            required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form) }))}
                            required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                            icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} />
                        <FormField label="Correo electrónico" name="email" value={form.email}
                            onChange={handleChange}
                            onBlur={() => {
                                verificarEmailDuplicado()
                                setErrores(prev => ({ ...prev, email: validarCampo('email', form) }))
                            }}
                            required error={errores.email} helperText={errores.email}
                            icon={EmailOutlinedIcon} placeholder="correo@dominio.com"
                            inputProps={{ maxLength: 100 }} />
                        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField fullWidth label="Nueva contraseña" name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, password: validarCampo('password', form) }))}
                                error={!!errores.password} helperText={errores.password || (form.password ? PASSWORD_HELP : 'Dejar vacío para mantener la actual')}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small" tabIndex={-1}>
                                                    {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                    htmlInput: { maxLength: 64 }
                                }}
                                sx={formFieldStyles} />
                            <TextField fullWidth label="Confirmar contraseña" name="confirmarPassword"
                                type={showConfirmarPassword ? 'text' : 'password'}
                                value={form.confirmarPassword} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, confirmarPassword: validarCampo('confirmarPassword', form) }))}
                                error={!!errores.confirmarPassword} helperText={errores.confirmarPassword}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowConfirmarPassword(p => !p)} edge="end" size="small" tabIndex={-1}>
                                                    {showConfirmarPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                    htmlInput: { maxLength: 64 }
                                }}
                                sx={formFieldStyles} />
                        </Box>
                    </Box>
                )
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormField label="N° de Licencia" name="numeroLicencia" value={form.numeroLicencia}
                            onChange={handleChange} onBlur={verificarLicenciaDuplicada} icon={BadgeOutlinedIcon}
                            error={errores.numeroLicencia}
                            inputProps={{ maxLength: 20 }} placeholder="Ej: 123456789"
                            helperText={errores.numeroLicencia || 'Opcional'} />

                        <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                            Categorías de licencia
                        </Typography>
                        {errores.categoriasLicencia && (
                            <Typography variant="caption" color="error" sx={{ mt: -1.5 }}>{errores.categoriasLicencia}</Typography>
                        )}

                        {form.categoriasLicencia.map((cat, index) => {
                            const categoriasUsadas = form.categoriasLicencia
                                .filter((_, i) => i !== index)
                                .map(c => c.categoria)
                            return (
                                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1.5, alignItems: 'center' }}>
                                    <FormSelect label="Categoría" value={cat.categoria}
                                        onChange={(e) => handleCategoriaChange(index, 'categoria', e.target.value)}>
                                        {CATEGORIAS_LICENCIA.filter(c => !categoriasUsadas.includes(c.value)).map(c => (
                                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                                        ))}
                                    </FormSelect>
                                    <FormField label="Vencimiento" type="date" value={cat.vencimiento}
                                        onChange={(e) => handleCategoriaChange(index, 'vencimiento', e.target.value)}
                                        onBlur={() => setErrores(prev => ({ ...prev, categoriasLicencia: validarCategorias(form.categoriasLicencia) }))}
                                        icon={EventOutlinedIcon} InputLabelProps={{ shrink: true }} />
                                    <IconButton onClick={() => handleQuitarCategoria(index)}
                                        disabled={form.categoriasLicencia.length === 1}
                                        sx={{ visibility: form.categoriasLicencia.length === 1 ? 'hidden' : 'visible' }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )
                        })}

                        <Button
                            onClick={handleAgregarCategoria}
                            startIcon={<AddOutlinedIcon />}
                            disabled={form.categoriasLicencia.length >= CATEGORIAS_LICENCIA.length}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                        >
                            Agregar categoría
                        </Button>
                    </Box>
                )
            case 3: {
                const emailActual = form.email
                const emailOriginal = formOriginal?.email
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = [
                    [form.tipoIdentificacion, formOriginal?.tipoIdentificacion],
                    [form.numeroIdentificacion, formOriginal?.numeroIdentificacion],
                    [form.nombre, formOriginal?.nombre],
                    [form.apellido, formOriginal?.apellido],
                    [form.telefono, formOriginal?.telefono],
                    [emailActual, emailOriginal],
                    [form.password, ''],
                    [form.numeroLicencia, formOriginal?.numeroLicencia],
                    [JSON.stringify(form.categoriasLicencia), formOriginal ? JSON.stringify(formOriginal.categoriasLicencia) : undefined],
                ]
                const totalModificados = formOriginal ? camposComparados.filter(([a, b]) => sonDistintos(a, b)).length : 0

                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {totalModificados > 0 && (
                            <Alert severity="info" icon={<EditOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                                Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
                            </Alert>
                        )}
                        {sinCambios && (
                            <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                                No has realizado ningún cambio. Los datos ya están actualizados.
                            </Alert>
                        )}
                        {apiError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} previousValue={formOriginal ? getTipoLabel(formOriginal.tipoIdentificacion) : undefined} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal?.numeroIdentificacion} />
                                <ConfirmRow label="Nombre" value={form.nombre} previousValue={formOriginal?.nombre} />
                                <ConfirmRow label="Apellido" value={form.apellido} previousValue={formOriginal?.apellido} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <EmailOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Contacto y Credenciales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de contacto</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal?.telefono} />
                                <ConfirmRow label="Correo" value={emailActual} previousValue={emailOriginal} />
                                <ConfirmRow label="Contraseña" value={form.password ? '••••••••' : 'Sin cambiar'} previousValue="Sin cambiar" />
                            </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Licencia de Conducción</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de licencia</Typography>
                                <ConfirmRow label="N° de licencia" value={form.numeroLicencia || '—'} previousValue={formOriginal?.numeroLicencia || '—'} />
                                {form.categoriasLicencia.filter(c => c.categoria && c.vencimiento).map((cat, i) => {
                                    const original = formOriginal?.categoriasLicencia?.find(c => c.categoria === cat.categoria)
                                    return (
                                        <ConfirmRow key={i} label={getLicenciaLabel(cat.categoria)} value={cat.vencimiento}
                                            previousValue={original ? original.vencimiento : undefined} />
                                    )
                                })}
                            </Paper>
                        </Box>
                    </Box>
                )
            }
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
                    sx={{
                        mb: 3, mt: 2,
                        '& .MuiStepIcon-root': { color: theme.palette.divider },
                        '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
                        '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
                        '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
                        '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
                        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
                        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
                        '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
                        '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
                        '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
                    }}>
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
                    sx={{ textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider, color: theme.palette.text.primary, fontWeight: 500, '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle }, '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary } }}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleCancelar} disableRipple
                        sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary } }}>
                        Cancelar
                    </Button>
                    <Button onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained" disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
                        disableRipple
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170, backgroundColor: theme.palette.primary.main, boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` }, '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled } }}>
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

