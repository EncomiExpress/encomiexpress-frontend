import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, TextField, Select, InputAdornment,
    Dialog, DialogTitle, DialogContent, IconButton, CircularProgress
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import * as propietarioService from '../../shared/services/propietarioService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico, maxLengthDocumento, docHelperText as docHelperTextBase, validarNumeroDocumento } from '../../shared/utils/documento.js'

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']
const DOMINIO_OTRO = '__otro__'
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/

const steps = ['Datos Personales', 'Contacto y Flota', 'Confirmación']

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). numeroIdentificacion no vive
// aquí porque ya tiene su propia validación (validarDocumentoCompleto, más abajo).
const validarCampo = (name, form) => {
    const esNIT = form.tipoIdentificacion === 'NIT'
    switch (name) {
        case 'tipoIdentificacion':
            return form.tipoIdentificacion ? '' : 'Selecciona un tipo de documento'
        case 'nombre':
            if (!form.nombre.trim()) return esNIT ? 'La razón social es obligatoria' : 'El nombre es obligatorio'
            if (!esNIT && !SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (esNIT) return ''
            return form.apellido?.trim() ? '' : 'El apellido es obligatorio'
        case 'telefono':
            if (!form.telefono.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefono)) return 'El teléfono debe tener 10 dígitos'
            return ''
        case 'emailLocal':
            if (!form.emailLocal?.trim()) return 'El correo es obligatorio'
            if (!/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.emailDominio)) return 'El dominio del correo no es válido (ej: @empresa.com)'
            return ''
        default:
            return ''
    }
}

const EMPTY_FORM = {
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    emailLocal: '',
    emailDominio: '@gmail.com',
    tipoFlota: '',
}

const ActualizarPropietario = ({ open, onClose, propietario: propietarioProp, onSuccess }) => {
    const { propietarios, actualizarPropietario } = usePropietario()
    const { showToast } = useToast()
    const theme = useTheme()
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)
    const cargado = useRef(false)

    // Poblar formulario con datos reales de la BD al abrir
    useEffect(() => {
        if (!open) { cargado.current = false; return }
        if (!propietarioProp || cargado.current) return
        cargado.current = true
        setActiveStep(0)
        setErrores({})
        setApiError(null)
        setSinCambios(false)

        // Preferir datos frescos del context (ya sincronizados con la BD)
        const propietario = propietarios.find(p => p.idPropietario === propietarioProp.idPropietario) || propietarioProp

        const atIdx = propietario.email ? propietario.email.lastIndexOf('@') : -1
        const emailLocal = atIdx >= 0 ? propietario.email.slice(0, atIdx) : propietario.email || ''
        const rawDominio = atIdx >= 0 ? '@' + propietario.email.slice(atIdx + 1) : ''
        const emailDominio = rawDominio || '@gmail.com'

        const datosForm = {
            tipoIdentificacion: propietario.tipoIdentificacion || '',
            numeroIdentificacion: propietario.numeroIdentificacion || '',
            nombre: propietario.nombre || '',
            apellido: propietario.apellido || '',
            telefono: propietario.telefono || '',
            emailLocal,
            emailDominio,
            tipoFlota: propietario.tipoFlota || '',
        }
        setForm(datosForm)
        setFormOriginal(datosForm)
    }, [open, propietarioProp, propietarios])

    const getMaxLengthDoc = () => {
        if (form.tipoIdentificacion === 'NIT') return 15
        return maxLengthDocumento(form.tipoIdentificacion)
    }
    const docHelperText = () => {
        if (form.tipoIdentificacion === 'NIT') return 'Números con guión, hasta 15 caracteres'
        return docHelperTextBase(form.tipoIdentificacion) || ''
    }

    // NIT tiene su propio formato (dígitos + guión, hasta 15) — no encaja en las
    // reglas genéricas de documento.js, así que se valida aparte aquí.
    const validarDocumentoCompleto = (tipo, valor) => {
        const limpio = (valor || '').trim()
        if (!limpio) return 'El número de documento es obligatorio'
        if (tipo === 'NIT') {
            if (!/^[0-9-]+$/.test(limpio)) return 'Solo se permiten números y guión'
            if (limpio.length > 15) return 'Máximo 15 caracteres'
            return null
        }
        return validarNumeroDocumento(tipo, limpio)
    }

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
        if (name === 'nombre' || name === 'apellido') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
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
            setSinCambios(false)
            return
        }
        if (name === 'telefono') value = value.replace(/[^0-9]/g, '')
        if (name === 'emailLocal') value = value.replace(/[^a-zA-Z0-9._-]/g, '')
        if (name === 'emailDominio') {
            if (value === DOMINIO_OTRO) value = '@'
            else if (!DOMINIOS_EMAIL.includes(value)) value = '@' + value.replace(/@/g, '').replace(/[^a-zA-Z0-9.-]/g, '')
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => {
            const siguiente = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
            // Si se corrige el dominio del correo, revalida también "emailLocal" si ya estaba marcado con error
            if (name === 'emailDominio' && prev.emailLocal) {
                siguiente.emailLocal = validarCampo('emailLocal', formActualizado)
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
            const res = await propietarioService.getPropietarios(undefined, { q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion, {
                excludeId: propietarioProp?.idPropietario,
                getId: (r) => r.idPropietario,
            })
            setAvisoDocDuplicado(duplicado ? MENSAJE_DOC_DUPLICADO : '')
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarNombreDuplicado = async () => {
        if (form.tipoIdentificacion === 'NIT' || !form.nombre.trim() || !form.apellido.trim()) {
            setAvisoNombreDuplicado('')
            return
        }
        try {
            const res = await propietarioService.getPropietarios(undefined, { q: form.apellido.trim(), limit: 20 })
            if (!res?.success) return
            const duplicado = hayNombreDuplicado(res.data, form.nombre, form.apellido, {
                excludeId: propietarioProp?.idPropietario,
                getId: (r) => r.idPropietario,
            })
            setAvisoNombreDuplicado(duplicado ? MENSAJE_NOMBRE_DUPLICADO : '')
        } catch {
            // Si falla la verificación no bloqueamos el flujo de edición
        }
    }

    const validarPaso = (step) => {
        const e = {}

        if (step === 0) {
            e.tipoIdentificacion = validarCampo('tipoIdentificacion', form)
            const errorDocumento = validarDocumentoCompleto(form.tipoIdentificacion, form.numeroIdentificacion)
            if (errorDocumento) e.numeroIdentificacion = errorDocumento
            e.nombre = validarCampo('nombre', form)
            e.apellido = validarCampo('apellido', form)
        }

        if (step === 1) {
            e.telefono = validarCampo('telefono', form)
            e.emailLocal = validarCampo('emailLocal', form)
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

    const handleSubmit = async () => {
        if (formOriginal) {
            const hayCambios = Object.keys(form).some(key => {
                const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
                const actual = form[key] !== undefined ? String(form[key]) : ''
                return original !== actual
            })
            if (!hayCambios) { setSinCambios(true); return }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            const { emailLocal, emailDominio, ...resto } = form
            await actualizarPropietario({
                idPropietario: parseInt(propietarioProp.idPropietario),
                ...resto,
                apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido,
                email: emailLocal ? emailLocal + emailDominio : '',
            })
            showToast('¡Propietario actualizado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar el propietario'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(EMPTY_FORM)
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setFormOriginal(null)
        setSinCambios(false)
        onClose()
    }

    const getTipoLabel = (tipo) => {
        const tipos = { CC: 'Cédula', NIT: 'NIT', CE: 'Cédula Extranjería', TI: 'Tarjeta Identidad', PAS: 'Pasaporte', RC: 'Registro Civil' }
        return tipos[tipo] || tipo
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
                            <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                            <MenuItem value="RC">Registro Civil (RC)</MenuItem>
                        </TextField>
                        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
                            onChange={handleChange}
                            onBlur={() => {
                                verificarDocumentoDuplicado()
                                setErrores(prev => ({ ...prev, numeroIdentificacion: validarDocumentoCompleto(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
                            }}
                            required error={errores.numeroIdentificacion}
                            helperText={errores.numeroIdentificacion || docHelperText()} icon={BadgeOutlinedIcon}
                            inputProps={{ maxLength: getMaxLengthDoc() }} />
                        <FormField
                            label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombres'}
                            name="nombre" value={form.nombre} onChange={handleChange}
                            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form) })) }}
                            required error={errores.nombre} helperText={errores.nombre}
                            icon={form.tipoIdentificacion === 'NIT' ? BusinessOutlinedIcon : PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }}
                            placeholder={form.tipoIdentificacion === 'NIT' ? 'Ej: Transportes XYZ S.A.S' : 'Ej: Carlos'} />
                        {form.tipoIdentificacion !== 'NIT' && (
                            <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                                onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form) })) }}
                                required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
                                inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
                        )}
                        {avisoDocDuplicado && (
                            <Alert severity="warning" sx={{ gridColumn: '1 / -1' }}>{avisoDocDuplicado}</Alert>
                        )}
                        {avisoNombreDuplicado && (
                            <Alert severity="warning" sx={{ gridColumn: '1 / -1' }}>{avisoNombreDuplicado}</Alert>
                        )}
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form) }))}
                            required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                            icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} />
                        <TextField fullWidth label="Correo electrónico" name="emailLocal"
                            value={form.emailLocal} onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, emailLocal: validarCampo('emailLocal', form) }))} required
                            error={!!errores.emailLocal} helperText={errores.emailLocal}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlinedIcon sx={{ color: '#94a3b8' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {!DOMINIOS_EMAIL.includes(form.emailDominio) ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <Box component="input" name="emailDominio" value={form.emailDominio}
                                                        onChange={handleChange}
                                                        onBlur={() => errores.emailLocal && setErrores(prev => ({ ...prev, emailLocal: validarCampo('emailLocal', form) }))}
                                                        placeholder="@empresa.com" maxLength={40}
                                                        sx={{
                                                            border: 'none', outline: 'none', background: 'transparent',
                                                            fontSize: '1rem', fontFamily: 'inherit', color: theme.palette.text.secondary,
                                                            width: 110, p: 0,
                                                        }} />
                                                    <IconButton size="small" sx={{ p: 0.3 }}
                                                        onClick={() => handleChange({ target: { name: 'emailDominio', value: '@gmail.com' } })}>
                                                        <CloseIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Select name="emailDominio" value={form.emailDominio}
                                                    onChange={handleChange} variant="standard" disableUnderline
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{ fontSize: '1rem', color: theme.palette.text.secondary, '& .MuiSelect-select': { py: 0, pl: 0.5, pr: '22px !important' } }}>
                                                    {DOMINIOS_EMAIL.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                                    <MenuItem value={DOMINIO_OTRO}>Otro...</MenuItem>
                                                </Select>
                                            )}
                                        </InputAdornment>
                                    ),
                                },
                                htmlInput: { maxLength: 50 }
                            }}
                            sx={formFieldStyles} />
                        <FormSelect label="Tipo de flota" name="tipoFlota" value={form.tipoFlota}
                            onChange={handleChange} helperText="Opcional">
                            <MenuItem value="">Sin especificar</MenuItem>
                            <MenuItem value="Mensajería">Mensajería</MenuItem>
                            <MenuItem value="Carga Liviana">Carga Liviana</MenuItem>
                            <MenuItem value="Carga Pesada">Carga Pesada</MenuItem>
                            <MenuItem value="Mixta">Mixta</MenuItem>
                        </FormSelect>
                    </Box>
                )
            case 2: {
                const emailActual = form.emailLocal ? form.emailLocal + form.emailDominio : '—'
                const emailOriginal = formOriginal ? (formOriginal.emailLocal ? formOriginal.emailLocal + formOriginal.emailDominio : '—') : undefined
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = [
                    [form.tipoIdentificacion, formOriginal?.tipoIdentificacion],
                    [form.numeroIdentificacion, formOriginal?.numeroIdentificacion],
                    [form.nombre, formOriginal?.nombre],
                    [form.apellido, formOriginal?.apellido],
                    [form.telefono, formOriginal?.telefono],
                    [emailActual, emailOriginal],
                    [form.tipoFlota, formOriginal?.tipoFlota],
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
                            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <BusinessOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} previousValue={formOriginal ? getTipoLabel(formOriginal.tipoIdentificacion) : undefined} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal?.numeroIdentificacion} />
                                <ConfirmRow label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombre'} value={form.nombre} previousValue={formOriginal?.nombre} />
                                {form.tipoIdentificacion !== 'NIT' && (
                                    <ConfirmRow label="Apellido" value={form.apellido || 'N/A'} previousValue={formOriginal?.apellido || 'N/A'} />
                                )}
                            </Paper>
                            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PhoneOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Contacto y Flota</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de contacto y flota</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal?.telefono} />
                                <ConfirmRow label="Correo" value={emailActual} previousValue={emailOriginal} />
                                <ConfirmRow label="Tipo de flota" value={form.tipoFlota || 'N/A'} previousValue={formOriginal?.tipoFlota || 'N/A'} />
                            </Paper>
                        </Box>
                    </Box>
                )
            }
            default:
                return null
        }
    }

    const btnSx = {
        textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170,
        backgroundColor: theme.palette.primary.main,
        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
        '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
        '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Editar Propietario</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        {formOriginal?.nombre
                            ? `Modificando datos de ${formOriginal.nombre}${formOriginal.apellido ? ' ' + formOriginal.apellido : ''}`
                            : 'Modifica los campos que necesites.'}
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{
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
                    <Button onClick={handleClose} disableRipple
                        sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
                        disableRipple sx={btnSx}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarPropietario

