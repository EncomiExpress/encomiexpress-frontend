import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, TextField, InputAdornment, CircularProgress } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useAuth, ROLES } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import * as usuarioService from '../../shared/services/usuarioService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO, MENSAJE_EMAIL_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, maxLengthDocumento, docHelperText, validarNumeroDocumento } from '../../shared/utils/documento.js'

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

const steps = ['Datos Personales', 'Contacto y Credenciales', 'Confirmación']

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). numeroIdentificacion no
// vive aquí porque ya tiene su propia validación en shared/utils/documento.js.
// password/confirmarPassword son opcionales aquí: dejarlos vacíos significa
// "mantener la contraseña actual", a diferencia de RegistrarUsuario.jsx.
const validarCampo = (name, form) => {
    switch (name) {
        case 'nombre':
            if (!form.nombre.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (!form.apellido.trim()) return 'El apellido es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.apellido)) return 'El apellido solo puede contener letras'
            return ''
        case 'tipoIdentificacion':
            return form.tipoIdentificacion ? '' : 'Selecciona un tipo de documento'
        case 'telefono':
            if (!form.telefono.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefono)) return 'El teléfono debe tener exactamente 10 dígitos'
            return ''
        case 'email':
            return validarEmail(form.email)
        case 'idRol':
            return form.idRol ? '' : 'Selecciona un rol'
        case 'password':
            if (form.password && !PASSWORD_REGEX.test(form.password)) return PASSWORD_HELP
            return ''
        case 'confirmarPassword':
            if (form.password && form.password !== form.confirmarPassword) return 'Las contraseñas no coinciden'
            return ''
        default:
            return ''
    }
}

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
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')
    const [avisoEmailDuplicado, setAvisoEmailDuplicado] = useState('')
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
                const next = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
                const otro = name === 'nombre' ? 'apellido' : 'nombre'
                if (prev[otro] === MENSAJE_NOMBRE_DUPLICADO) next[otro] = validarCampo(otro, formActualizado)
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

    const verificarDocumentoDuplicado = async () => {
        if (!form.numeroIdentificacion.trim() || form.numeroIdentificacion.length < 3) {
            setAvisoDocDuplicado('')
            return
        }
        try {
            const res = await usuarioService.getUsuarios({ q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion, {
                excludeId: usuarioProp?.idUsuario,
                getId: (r) => r.idUsuario,
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
            const res = await usuarioService.getUsuarios({ q: valor, limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, valor, {
                getDoc: (r) => r.email,
                excludeId: usuarioProp?.idUsuario,
                getId: (r) => r.idUsuario,
            })
            setAvisoEmailDuplicado(duplicado ? MENSAJE_EMAIL_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, email: MENSAJE_EMAIL_DUPLICADO }))
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
            const res = await usuarioService.getUsuarios({ q: form.apellido.trim(), limit: 20 })
            if (!res?.success) return
            const duplicado = hayNombreDuplicado(res.data, form.nombre, form.apellido, {
                excludeId: usuarioProp?.idUsuario,
                getId: (r) => r.idUsuario,
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
            e.nombre = validarCampo('nombre', form) || avisoNombreDuplicado
            e.apellido = validarCampo('apellido', form) || avisoNombreDuplicado
            e.tipoIdentificacion = validarCampo('tipoIdentificacion', form)

            const errorDocumento = validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion)
            e.numeroIdentificacion = errorDocumento || avisoDocDuplicado
        }

        if (step === 1) {
            e.telefono = validarCampo('telefono', form)
            e.email = validarCampo('email', form) || avisoEmailDuplicado
            e.idRol = validarCampo('idRol', form)
            e.password = validarCampo('password', form)
            e.confirmarPassword = validarCampo('confirmarPassword', form)
        }

        Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
        return e
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(activeStep)
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

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, elevation: 0,
        overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <TextField fullWidth select label="Tipo de documento" name="tipoIdentificacion"
                            value={form.tipoIdentificacion} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacion: validarCampo('tipoIdentificacion', form) }))} required
                            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
                            slotProps={{
                                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                                select: { IconComponent: KeyboardArrowDownOutlinedIcon }
                            }}
                            sx={formFieldStyles}>
                            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                        </TextField>
                        <TextField fullWidth label="Número de documento" name="numeroIdentificacion"
                            value={form.numeroIdentificacion} onChange={handleChange} required
                            error={!!errores.numeroIdentificacion} helperText={errores.numeroIdentificacion || docHelperText(form.tipoIdentificacion)}
                            onBlur={() => {
                                verificarDocumentoDuplicado()
                                setErrores(prev => ({ ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
                            }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } }, htmlInput: { maxLength: maxLengthDocumento(form.tipoIdentificacion) } }}
                            sx={formFieldStyles} />
                        <TextField fullWidth label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
                            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form) })) }} required placeholder="Ej: Juan"
                            error={!!errores.nombre} helperText={errores.nombre}
                            slotProps={{
                                input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                                htmlInput: { maxLength: 50 }
                            }}
                            sx={formFieldStyles} />
                        <TextField fullWidth label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form) })) }} required placeholder="Ej: Gómez López"
                            error={!!errores.apellido} helperText={errores.apellido}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } }, htmlInput: { maxLength: 50 } }}
                            sx={formFieldStyles} />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <TextField fullWidth label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form) }))} required
                            error={!!errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } }, htmlInput: { maxLength: 10 } }}
                            sx={formFieldStyles} />
                        <TextField fullWidth label="Correo electrónico" name="email"
                            value={form.email} onChange={handleChange}
                            onBlur={() => {
                                verificarEmailDuplicado()
                                setErrores(prev => ({ ...prev, email: validarCampo('email', form) }))
                            }} required
                            placeholder="correo@dominio.com"
                            error={!!errores.email} helperText={errores.email}
                            slotProps={{
                                input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                                htmlInput: { maxLength: 100 }
                            }}
                            sx={formFieldStyles} />
                        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField fullWidth label="Nueva contraseña" name="password" type={showPassword ? 'text' : 'password'}
                                value={form.password} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, password: validarCampo('password', form) }))}
                                error={!!errores.password} helperText={errores.password || (form.password ? PASSWORD_HELP : 'Dejar vacío para mantener la actual')}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                                                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { pl: 1.5 }
                                    },
                                    htmlInput: { maxLength: 64 }
                                }}
                                sx={formFieldStyles} />
                            <TextField fullWidth label="Confirmar contraseña" name="confirmarPassword" type={showConfirmarPassword ? 'text' : 'password'}
                                value={form.confirmarPassword} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, confirmarPassword: validarCampo('confirmarPassword', form) }))}
                                error={!!errores.confirmarPassword} helperText={errores.confirmarPassword}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowConfirmarPassword(!showConfirmarPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                                                    {showConfirmarPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { pl: 1.5 }
                                    },
                                    htmlInput: { maxLength: 64 }
                                }}
                                sx={formFieldStyles} />
                        </Box>
                        <TextField fullWidth select label="Rol" name="idRol" value={form.idRol} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, idRol: validarCampo('idRol', form) }))} required
                            error={!!errores.idRol} helperText={errores.idRol || (
                                <>
                                    ¿Buscas registrar un conductor? Hazlo desde el módulo de{' '}
                                    <Box component="span" onClick={() => navigate('/transporte/conductores')}
                                        sx={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                                        Conductores
                                    </Box>
                                </>
                            )}
                            slotProps={{
                                input: { startAdornment: <InputAdornment position="start"><AssignmentIndOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                                select: { IconComponent: KeyboardArrowDownOutlinedIcon }
                            }}
                            sx={formFieldStyles}>
                            {rolesDisponibles.map((rol) => (
                                <MenuItem key={rol.idRol} value={rol.idRol} sx={{ p: 0, justifyContent: 'flex-start', my: 0.5 }}>
                                    <Box sx={{
                                        backgroundColor: 'transparent',
                                        color: theme.palette.primary.main,
                                        border: `1px solid ${theme.palette.divider}`,
                                        px: 1.5,
                                        py: 0.3,
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        display: 'inline-flex',
                                        ml: 1,
                                    }}>
                                        {rol.nombre}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                )
            case 2: {
                const cambios = getCamposCambiados()
                const totalModificados = Object.values(cambios).filter(Boolean).length
                const getNombreRol = (idRol) => rolesDisponibles.find(r => r.idRol === parseInt(idRol))?.nombre || '—'

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
                        {formOriginal && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Paper elevation={0} sx={cardSx}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                                    <ConfirmRow label="Tipo de documento" value={form.tipoIdentificacion} previousValue={formOriginal.tipoIdentificacion} />
                                    <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal.numeroIdentificacion} />
                                    <ConfirmRow label="Nombre" value={form.nombre} previousValue={formOriginal.nombre} />
                                    <ConfirmRow label="Apellido" value={form.apellido} previousValue={formOriginal.apellido} />
                                </Paper>
                                <Paper elevation={0} sx={cardSx}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <LockOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Contacto y Credenciales</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de acceso</Typography>
                                    <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal.telefono} />
                                    <ConfirmRow label="Correo" value={form.email} previousValue={formOriginal.email} />
                                    <ConfirmRow label="Rol" value={getNombreRol(form.idRol)} previousValue={getNombreRol(formOriginal.idRol)} />
                                    <ConfirmRow label="Contraseña" value={form.password ? '••••••••' : 'Sin cambiar'} previousValue="Sin cambiar" />
                                </Paper>
                            </Box>
                        )}
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
                    <Typography variant="h6" fontWeight={700}>
                        Editar Usuario
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        {formOriginal?.nombre && formOriginal?.apellido
                            ? `Modificando datos de ${formOriginal.nombre} ${formOriginal.apellido}`
                            : 'Modifica los campos que necesites.'
                        }
                    </Typography>
                </Box>
                <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
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

            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`,
            }}>
                <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                    startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={{
                        textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
                        color: theme.palette.text.primary, fontWeight: 500,
                        '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
                        '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
                    }}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleCancelar} disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
                        }}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarUsuario

