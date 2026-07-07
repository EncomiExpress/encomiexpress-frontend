import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import {
    Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel,
    Button, Alert, Snackbar, TextField, Select, InputAdornment,
    Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import * as propietarioService from '../../shared/services/propietarioService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO } from '../../shared/utils/duplicados.js'

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']
const DOMINIO_OTRO = '__otro__'

const steps = ['Datos Personales', 'Contacto y Vehículo', 'Confirmación']

const EMPTY_FORM = {
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    emailLocal: '',
    emailDominio: '@gmail.com',
    tarjetaPropiedad: '',
    tipoFlota: '',
}

const RegistrarPropietario = ({ open, onClose, onSuccess }) => {
    const { registrarPropietario } = usePropietario()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')
    const [form, setForm] = useState(EMPTY_FORM)

    const handleClose = () => {
        setForm(EMPTY_FORM)
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        onClose()
    }

    const esDocAlfanumerico = (tipo) => ['CE', 'PAS'].includes(tipo)
    const getMaxLengthDoc = () => {
        if (form.tipoIdentificacion === 'NIT') return 15
        if (esDocAlfanumerico(form.tipoIdentificacion)) return 12
        return 10
    }
    const docHelperText = () => {
        if (form.tipoIdentificacion === 'NIT') return 'Números con guión, hasta 15 caracteres'
        if (esDocAlfanumerico(form.tipoIdentificacion)) return 'Alfanumérico, hasta 12 caracteres'
        if (form.tipoIdentificacion) return 'Solo dígitos, entre 3 y 10'
        return ''
    }

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
        if (name === 'numeroIdentificacion') setAvisoDocDuplicado('')
        if (name === 'nombre' || name === 'apellido') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'numeroIdentificacion') {
            if (form.tipoIdentificacion === 'NIT') {
                value = value.replace(/[^0-9-]/g, '')
            } else if (esDocAlfanumerico(form.tipoIdentificacion)) {
                value = value.replace(/[^a-zA-Z0-9]/g, '')
            } else {
                value = value.replace(/[^0-9]/g, '')
            }
        }
        if (name === 'telefono') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'emailLocal') {
            value = value.replace(/[^a-zA-Z0-9._-]/g, '')
        }
        if (name === 'emailDominio') {
            if (value === DOMINIO_OTRO) value = '@'
            else if (!DOMINIOS_EMAIL.includes(value)) value = '@' + value.replace(/@/g, '').replace(/[^a-zA-Z0-9.-]/g, '')
        }

        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
    }

    const verificarDocumentoDuplicado = async () => {
        if (!form.numeroIdentificacion.trim() || form.numeroIdentificacion.length < 3) {
            setAvisoDocDuplicado('')
            return
        }
        try {
            const res = await propietarioService.getPropietarios(undefined, { q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion)
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
            const duplicado = hayNombreDuplicado(res.data, form.nombre, form.apellido)
            setAvisoNombreDuplicado(duplicado ? MENSAJE_NOMBRE_DUPLICADO : '')
        } catch {
            // Si falla la verificación no bloqueamos el flujo de registro
        }
    }

    const validarPaso = (step) => {
        const e = {}
        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
        const soloNumeros = /^\d+$/

        if (step === 0) {
            const esNIT = form.tipoIdentificacion === 'NIT'
            if (!form.tipoIdentificacion) e.tipoIdentificacion = 'Selecciona un tipo de documento'
            if (!form.numeroIdentificacion.trim()) {
                e.numeroIdentificacion = 'El número de documento es obligatorio'
            } else if (!esNIT && esDocAlfanumerico(form.tipoIdentificacion)) {
                if (!/^[a-zA-Z0-9]+$/.test(form.numeroIdentificacion))
                    e.numeroIdentificacion = 'Solo letras y números, sin caracteres especiales'
            } else if (!esNIT) {
                if (!soloNumeros.test(form.numeroIdentificacion)) {
                    e.numeroIdentificacion = 'Solo se permiten dígitos'
                } else if (form.numeroIdentificacion.length < 3 || form.numeroIdentificacion.length > 10) {
                    e.numeroIdentificacion = 'Debe tener entre 3 y 10 dígitos'
                }
            }
            if (!form.nombre.trim()) e.nombre = esNIT ? 'La razón social es obligatoria' : 'El nombre es obligatorio'
            else if (!esNIT && !soloLetras.test(form.nombre)) e.nombre = 'El nombre solo puede contener letras'
            if (!esNIT && !form.apellido?.trim()) e.apellido = 'El apellido es obligatorio'
        }

        if (step === 1) {
            if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener 10 dígitos'
            if (!form.emailLocal?.trim()) e.emailLocal = 'El correo es obligatorio'
            else if (!/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.emailDominio)) e.emailLocal = 'El dominio del correo no es válido (ej: @empresa.com)'
        }

        return e
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep)
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
            const { emailLocal, emailDominio, ...resto } = form
            await registrarPropietario({
                ...resto,
                apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido,
                email: emailLocal ? emailLocal + emailDominio : '',
            })
            setExito(true)
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar el propietario')
        } finally {
            setSubmitting(false)
        }
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
                            onChange={handleChange} onBlur={verificarDocumentoDuplicado} required error={errores.numeroIdentificacion}
                            helperText={errores.numeroIdentificacion || docHelperText()} icon={BadgeOutlinedIcon}
                            inputProps={{ maxLength: getMaxLengthDoc() }} />
                        <FormField
                            label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombres'}
                            name="nombre" value={form.nombre} onChange={handleChange}
                            onBlur={verificarNombreDuplicado}
                            required error={errores.nombre} helperText={errores.nombre}
                            icon={form.tipoIdentificacion === 'NIT' ? BusinessOutlinedIcon : PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }}
                            placeholder={form.tipoIdentificacion === 'NIT' ? 'Ej: Transportes XYZ S.A.S' : 'Ej: Carlos'} />
                        {form.tipoIdentificacion !== 'NIT' && (
                            <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                                onBlur={verificarNombreDuplicado}
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
                            required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                            icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} />
                        <TextField fullWidth label="Correo electrónico" name="emailLocal"
                            value={form.emailLocal} onChange={handleChange} required
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
                                                        onChange={handleChange} placeholder="@empresa.com" maxLength={40}
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
                                                    sx={{
                                                        fontSize: '1rem', color: theme.palette.text.secondary,
                                                        '& .MuiSelect-select': { py: 0, pl: 0.5, pr: '22px !important' }
                                                    }}>
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
                        <FormField label="Tarjeta de propiedad" name="tarjetaPropiedad" value={form.tarjetaPropiedad}
                            onChange={handleChange} icon={DirectionsCarOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: 123456789"
                            helperText="Opcional" />
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
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {apiError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <BusinessOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} />
                                <ConfirmRow label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombre'} value={form.nombre} />
                                {form.tipoIdentificacion !== 'NIT' && (
                                    <ConfirmRow label="Apellido" value={form.apellido || 'N/A'} />
                                )}
                            </Paper>
                            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PhoneOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Contacto y Vehículo</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de contacto y flota</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} />
                                <ConfirmRow label="Correo" value={form.emailLocal ? form.emailLocal + form.emailDominio : '—'} />
                                <ConfirmRow label="Tarjeta propiedad" value={form.tarjetaPropiedad || 'N/A'} />
                                <ConfirmRow label="Tipo de flota" value={form.tipoFlota || 'N/A'} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default:
                return null
        }
    }

    const btnSx = {
        textTransform: 'none', borderRadius: 2, fontWeight: 600,
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
                    <Typography variant="h6" fontWeight={700}>Registrar Propietario</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        Complete los datos del nuevo propietario paso a paso.
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
                        variant="contained" disabled={submitting}
                        endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                        disableRipple sx={btnSx}>
                        {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Registrar'}
                    </Button>
                </Box>
            </Box>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Propietario registrado exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default RegistrarPropietario

