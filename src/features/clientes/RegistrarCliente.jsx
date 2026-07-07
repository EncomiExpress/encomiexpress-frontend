import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Select, InputAdornment, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import * as clienteService from '../../shared/services/clienteService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO } from '../../shared/utils/duplicados.js'

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']
const DOMINIO_OTRO = '__otro__'

const steps = ['Datos Personales', 'Información de Contacto', 'Confirmación']

const RegistrarCliente = ({ open, onClose, onSuccess }) => {
    const { agregarCliente } = useClientes()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        emailLocal: '',
        emailDominio: '@gmail.com',
        direccion: '',
        habilitado: true
    })

    const handleClose = () => {
        setForm({
            nombre: '',
            apellido: '',
            tipoIdentificacion: '',
            numeroIdentificacion: '',
            telefono: '',
            emailLocal: '',
            emailDominio: '@gmail.com',
            direccion: '',
            habilitado: true
        })
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
        if (name === 'nombre') {
            if (form.tipoIdentificacion !== 'NIT') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'apellido') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
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
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
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
            const res = await clienteService.getClientes(undefined, { q: form.numeroIdentificacion.trim(), limit: 10 })
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
            const res = await clienteService.getClientes(undefined, { q: form.apellido.trim(), limit: 20 })
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

            if (!esNIT && !form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
            else if (!esNIT && form.apellido.trim() && !soloLetras.test(form.apellido)) e.apellido = 'El apellido solo puede contener letras'
        }

        if (step === 1) {
            if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener exactamente 10 dígitos'

            if (!form.emailLocal.trim()) e.emailLocal = 'El correo es obligatorio'
            else if (!/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.emailDominio)) e.emailLocal = 'El dominio del correo no es válido (ej: @empresa.com)'

            if (!form.direccion.trim()) e.direccion = 'La dirección es obligatoria'
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

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            const { emailLocal, emailDominio, ...resto } = form
            await agregarCliente({ ...resto, email: emailLocal + emailDominio, apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido })
            setExito(true)
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => handleClose()

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'white', elevation: 0,
        overflow: 'hidden',
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
                            placeholder={form.tipoIdentificacion === 'NIT' ? 'Ej: Transportes XYZ S.A.S' : 'Ej: Juan'} />
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
                        <TextField fullWidth label="Email electrónico" name="emailLocal"
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
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormField label="Dirección" name="direccion" value={form.direccion}
                                onChange={handleChange} required error={errores.direccion}
                                helperText={errores.direccion || `${form.direccion.length}/200`} icon={HomeOutlinedIcon}
                                inputProps={{ maxLength: 200 }} />
                        </Box>
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
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombre'} value={form.nombre} />
                                {form.tipoIdentificacion !== 'NIT' && <ConfirmRow label="Apellido" value={form.apellido} />}
                                <ConfirmRow label="Tipo de documento" value={form.tipoIdentificacion} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Información de Contacto</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de contacto</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} />
                                <ConfirmRow label="Email" value={form.emailLocal + form.emailDominio} />
                                <ConfirmRow label="Dirección" value={form.direccion} />
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
            <DialogTitle sx={{ m: 0, p: 2, ob: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Registrar Cliente
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Complete los datos del nuevo cliente paso a paso.
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
                    }}>
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
                    ¡Cliente registrado exitosamente!
                </Alert>
            </Snackbar>

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

export default RegistrarCliente

