import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Select, InputAdornment, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import * as conductorService from '../../shared/services/conductorService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO } from '../../shared/utils/duplicados.js'

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']
const hoyISO = () => new Date().toISOString().split('T')[0]
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,16}$/
const PASSWORD_HELP = '8-16 caracteres, con mayúsculas, minúsculas, números y un carácter especial (sin @)'

const steps = ['Datos Personales', 'Licencia de Conducción', 'Confirmación']

const RegistrarConductor = ({ open, onClose, onSuccess }) => {
    const { registrarConductor } = useConductor()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')

    const [form, setForm] = useState({
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        nombre: '',
        apellido: '',
        telefono: '',
        emailLocal: '',
        emailDominio: '@gmail.com',
        password: '',
        licenciaConduccion: '',
        numeroLicencia: '',
        fechaVencimientoLicencia: ''
    })

    const esDocAlfanumerico = (tipo) => ['CE', 'PAS'].includes(tipo)
    const getMaxLengthDoc = () => esDocAlfanumerico(form.tipoIdentificacion) ? 12 : 10
    const docHelperText = () => {
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
        if (name === 'nombre' || name === 'apellido') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'numeroIdentificacion') {
            setAvisoDocDuplicado('')
            value = esDocAlfanumerico(form.tipoIdentificacion)
                ? value.replace(/[^a-zA-Z0-9]/g, '')
                : value.replace(/[^0-9]/g, '')
        }
        if (name === 'telefono') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'emailLocal') {
            value = value.replace(/[^a-zA-Z0-9._-]/g, '')
        }
        if (name === 'password') {
            value = value.replace(/@/g, '')
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
            const res = await conductorService.getConductores(undefined, { q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion, {
                getDoc: (r) => r.usuario?.numeroIdentificacion || r.numeroIdentificacion,
            })
            setAvisoDocDuplicado(duplicado ? MENSAJE_DOC_DUPLICADO : '')
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
            })
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
            if (!form.tipoIdentificacion) e.tipoIdentificacion = 'Selecciona un tipo de documento'
            if (!form.numeroIdentificacion.trim()) {
                e.numeroIdentificacion = 'El número de documento es obligatorio'
            } else if (esDocAlfanumerico(form.tipoIdentificacion)) {
                if (!/^[a-zA-Z0-9]+$/.test(form.numeroIdentificacion))
                    e.numeroIdentificacion = 'Solo letras y números, sin caracteres especiales'
            } else if (!soloNumeros.test(form.numeroIdentificacion)) {
                e.numeroIdentificacion = 'Solo se permiten dígitos'
            } else if (form.numeroIdentificacion.length < 3 || form.numeroIdentificacion.length > 10) {
                e.numeroIdentificacion = 'Debe tener entre 3 y 10 dígitos'
            }
            if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
            else if (!soloLetras.test(form.nombre)) e.nombre = 'El nombre solo puede contener letras'
            if (!form.apellido?.trim()) e.apellido = 'El apellido es obligatorio'
        }

        if (step === 1) {
            if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener 10 dígitos'
            if (!form.emailLocal?.trim()) e.emailLocal = 'El correo es obligatorio'
            if (!form.password) e.password = 'La contraseña es obligatoria'
            else if (!PASSWORD_REGEX.test(form.password)) e.password = PASSWORD_HELP
            if (!form.licenciaConduccion) e.licenciaConduccion = 'Selecciona una categoría de licencia'
            if (!form.fechaVencimientoLicencia) e.fechaVencimientoLicencia = 'La fecha de vencimiento es obligatoria'
            else if (form.fechaVencimientoLicencia < hoyISO()) e.fechaVencimientoLicencia = 'La fecha de vencimiento no puede ser anterior a hoy'
        }

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

    const handleCancelar = () => handleClose()

    const handleClose = () => {
        setForm({
            nombre: '',
            apellido: '',
            tipoIdentificacion: '',
            numeroIdentificacion: '',
            telefono: '',
            emailLocal: '',
            emailDominio: '@gmail.com',
            password: '',
            licenciaConduccion: '',
            numeroLicencia: '',
            fechaVencimientoLicencia: '',
        })
        setShowPassword(false)
        setErrores({})
        setActiveStep(0)
        onClose()
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            const { emailLocal, emailDominio, ...resto } = form
            await registrarConductor({
                ...resto,
                email: emailLocal ? emailLocal + emailDominio : '',
                habilitado: true,
                estado: 'Disponible'
            })
            setExito(true)
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar el conductor')
        } finally {
            setSubmitting(false)
        }
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'white', elevation: 0,
        overflow: 'hidden',
    }

    const getTipoLabel = (tipo) => {
        const tipos = { 'CC': 'Cédula', 'CE': 'Cédula Extranjería', 'TI': 'Tarjeta Identidad', 'PAS': 'Pasaporte', 'RC': 'Registro Civil' }
        return tipos[tipo] || tipo
    }

    const getLicenciaLabel = (lic) => {
        const licencias = {
            'A1': 'A1 - Motocicleta hasta 125 c.c.',
            'A2': 'A2 - Motocicleta de más de 125 c.c.',
            'B1': 'B1 - Automóvil, camioneta o microbús (particular)',
            'B2': 'B2 - Camión rígido, buseta o bus (particular)',
            'B3': 'B3 - Vehículo articulado (particular)',
            'C1': 'C1 - Automóvil, camioneta o microbús (servicio público)',
            'C2': 'C2 - Camión rígido, buseta o bus (servicio público)',
            'C3': 'C3 - Vehículo articulado (servicio público)',
        }
        return licencias[lic] || lic
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
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                            <MenuItem value="RC">Registro Civil (RC)</MenuItem>
                        </TextField>
                        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
                            onChange={handleChange} onBlur={verificarDocumentoDuplicado} required error={errores.numeroIdentificacion}
                            helperText={errores.numeroIdentificacion || docHelperText()} icon={BadgeOutlinedIcon}
                            inputProps={{ maxLength: getMaxLengthDoc() }} />
                        <FormField label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
                            onBlur={verificarNombreDuplicado}
                            required error={errores.nombre} helperText={errores.nombre} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Juan" />
                        <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                            onBlur={verificarNombreDuplicado}
                            required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
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
                                            <Select name="emailDominio" value={form.emailDominio}
                                                onChange={handleChange} variant="standard" disableUnderline
                                                IconComponent={KeyboardArrowDownOutlinedIcon}
                                                sx={{
                                                    fontSize: '1rem', color: theme.palette.text.secondary,
                                                    '& .MuiSelect-select': { py: 0, pl: 0.5, pr: '22px !important' }
                                                }}>
                                                {DOMINIOS_EMAIL.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                            </Select>
                                        </InputAdornment>
                                    ),
                                },
                                htmlInput: { maxLength: 50 }
                            }}
                            sx={formFieldStyles} />
                        <TextField fullWidth label="Contraseña inicial" name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password} onChange={handleChange} required
                            error={!!errores.password} helperText={errores.password || PASSWORD_HELP}
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
                                htmlInput: { maxLength: 16 }
                            }}
                            sx={formFieldStyles} />
                        <FormSelect label="Licencia de Conducción" name="licenciaConduccion" value={form.licenciaConduccion}
                            onChange={handleChange} required error={errores.licenciaConduccion} helperText={errores.licenciaConduccion}>
                            <MenuItem value="A1">A1 - Motocicleta hasta 125 c.c.</MenuItem>
                            <MenuItem value="A2">A2 - Motocicleta de más de 125 c.c.</MenuItem>
                            <MenuItem value="B1">B1 - Automóvil, camioneta o microbús (particular)</MenuItem>
                            <MenuItem value="B2">B2 - Camión rígido, buseta o bus (particular)</MenuItem>
                            <MenuItem value="B3">B3 - Vehículo articulado (particular)</MenuItem>
                            <MenuItem value="C1">C1 - Automóvil, camioneta o microbús (servicio público)</MenuItem>
                            <MenuItem value="C2">C2 - Camión rígido, buseta o bus (servicio público)</MenuItem>
                            <MenuItem value="C3">C3 - Vehículo articulado (servicio público)</MenuItem>
                        </FormSelect>
                        <FormField label="N° de Licencia" name="numeroLicencia" value={form.numeroLicencia}
                            onChange={handleChange} icon={BadgeOutlinedIcon}
                            inputProps={{ maxLength: 20 }} placeholder="Ej: 123456789"
                            helperText="Opcional" />
                        <FormField label="Fecha Vencimiento Licencia" name="fechaVencimientoLicencia" type="date"
                            value={form.fechaVencimientoLicencia} onChange={handleChange}
                            inputProps={{ min: hoyISO() }}
                            required error={errores.fechaVencimientoLicencia} helperText={errores.fechaVencimientoLicencia}
                            icon={EventOutlinedIcon} InputLabelProps={{ shrink: true }} />
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
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} />
                                <ConfirmRow label="Nombre" value={form.nombre} />
                                <ConfirmRow label="Apellido" value={form.apellido} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Licencia de Conducción</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de licencia</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} />
                                <ConfirmRow label="Correo" value={form.emailLocal + form.emailDominio} />
                                <ConfirmRow label="Contraseña" value={'•'.repeat(form.password.length)} />
                                <ConfirmRow label="Categoría licencia" value={getLicenciaLabel(form.licenciaConduccion)} />
                                <ConfirmRow label="N° de licencia" value={form.numeroLicencia || '—'} />
                                <ConfirmRow label="Vencimiento" value={form.fechaVencimientoLicencia} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Registrar Conductor
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Complete los datos del nuevo conductor paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
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
                    }}
                >
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Box sx={{ px: 4, py: 2 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>
            </DialogContent>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Conductor registrado exitosamente!
                </Alert>
            </Snackbar>

            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: '#FAFAFA',
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
                        disabled={submitting}
                        endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                        }}>
                        {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Registrar'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarConductor

