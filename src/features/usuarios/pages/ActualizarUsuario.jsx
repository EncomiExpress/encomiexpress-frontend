import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Snackbar, Alert, TextField, Select, InputAdornment, CircularProgress } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth, ROLES } from '../../../shared/contexts/AuthContext'
import { formFieldStyles } from '../../../shared/components/FormularioEstandarizado'

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Datos Personales', 'Credenciales', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const ActualizarUsuario = ({ open, onClose, usuario: usuarioProp, onSuccess }) => {
    const { actualizarUsuario, getRolesBackend } = useAuth()
    const [exito, setExito] = useState(false)
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [rolesDisponibles, setRolesDisponibles] = useState([])

    useEffect(() => {
        const cargarRoles = async () => {
            const respuesta = await getRolesBackend()
            if (respuesta.success) {
                setRolesDisponibles(respuesta.data || [])
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
        emailLocal: '',
        emailDominio: '@gmail.com',
        idRol: '',
        password: '',
        confirmarPassword: '',
    })

     useEffect(() => {
         if (open && usuarioProp) {
             setActiveStep(0)
             setErrores({})
             setSinCambios(false)
             const usuario = usuarioProp
             const atIdx = usuario.email ? usuario.email.lastIndexOf('@') : -1
             const emailLocal = atIdx >= 0 ? usuario.email.slice(0, atIdx) : usuario.email || ''
             const rawDominio = atIdx >= 0 ? '@' + usuario.email.slice(atIdx + 1) : ''
             const emailDominio = DOMINIOS_EMAIL.includes(rawDominio) ? rawDominio : '@gmail.com'

             const rolId = Object.values(ROLES).find(r => r.nombre === usuario.rol?.nombre)?.id || ''
             console.log('ActualizarUsuario - usuario.rol:', usuario.rol, '| rolId encontrado:', rolId)

             const datosForm = {
                 ...usuario,
                 emailLocal,
                 emailDominio,
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
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'numeroIdentificacion' || name === 'telefono') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'emailLocal') {
            value = value.replace(/[^a-zA-Z0-9._-]/g, '')
        }

        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}
        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
        const soloNumeros = /^\d+$/

        if (step === 0) {
            if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
            else if (!soloLetras.test(form.nombre)) e.nombre = 'El nombre solo puede contener letras'

            if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
            else if (!soloLetras.test(form.apellido)) e.apellido = 'El apellido solo puede contener letras'

            if (!form.tipoIdentificacion) e.tipoIdentificacion = 'Selecciona un tipo de documento'

            if (!form.numeroIdentificacion.trim()) e.numeroIdentificacion = 'El número de documento es obligatorio'
            else if (!soloNumeros.test(form.numeroIdentificacion)) e.numeroIdentificacion = 'Solo se permiten números'
        }

        if (step === 1) {
            if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener exactamente 10 dígitos'

            if (!form.emailLocal.trim()) e.emailLocal = 'El correo es obligatorio'

            if (!form.idRol) e.idRol = 'Selecciona un rol'

            if (form.password && form.password.length < 6) {
                e.password = 'La contraseña debe tener al menos 6 caracteres'
            }
            if (form.password && form.password !== form.confirmarPassword) {
                e.confirmarPassword = 'Las contraseñas no coinciden'
            }
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
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }

        if (formOriginal) {
            const keysToCompare = ['nombre', 'apellido', 'tipoIdentificacion', 'numeroIdentificacion', 'telefono', 'idRol']
            if (form.emailLocal && form.emailDominio) {
                keysToCompare.push('email')
            }
            if (form.password) {
                keysToCompare.push('password')
            }

            const hayCambios = keysToCompare.some(key => {
                let original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
                let actual = form[key] !== undefined ? String(form[key]) : ''
                if (key === 'email') {
                    original = formOriginal.emailLocal + formOriginal.emailDominio
                    actual = form.emailLocal + form.emailDominio
                }
                return original !== actual
            })

            if (!hayCambios && !form.password) {
                setSinCambios(true)
                return
            }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            console.log('ActualizarUsuario - usuarioProp completo:', usuarioProp)
            console.log('ActualizarUsuario - idUsuario:', usuarioProp?.idUsuario)
            const datosBackend = {
                nombre: form.nombre,
                apellido: form.apellido,
                tipoIdentificacion: form.tipoIdentificacion,
                numeroIdentificacion: form.numeroIdentificacion,
                telefono: form.telefono,
                email: form.emailLocal + form.emailDominio,
                idRol: parseInt(form.idRol),
            }

            if (form.password) {
                datosBackend.password = form.password
            }

            await actualizarUsuario(usuarioProp.idUsuario, datosBackend)
            setExito(true)
            setTimeout(() => {
                onClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => onClose()

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: 'white', elevation: 0,
        overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <TextField fullWidth select label="Tipo de documento" name="tipoIdentificacion"
                            value={form.tipoIdentificacion} onChange={handleChange}
                            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
                            sx={formFieldStyles}>
                            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
                            <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                        </TextField>
                        <TextField fullWidth label="Número de documento" name="numeroIdentificacion"
                            value={form.numeroIdentificacion} onChange={handleChange}
                            error={!!errores.numeroIdentificacion} helperText={errores.numeroIdentificacion || 'Sin puntos ni comas'}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 }, htmlInput: { maxLength: 15 } } }}
                            sx={formFieldStyles} />
                        <TextField fullWidth label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
                            error={!!errores.nombre} helperText={errores.nombre || 'Solo letras'}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 }, htmlInput: { maxLength: 50 } } }}
                            sx={formFieldStyles} />
                        <TextField fullWidth label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                            error={!!errores.apellido} helperText={errores.apellido || 'Solo letras'}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 }, htmlInput: { maxLength: 50 } } }}
                            sx={formFieldStyles} />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <TextField fullWidth label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                            error={!!errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 }, htmlInput: { maxLength: 10 } } }}
                            sx={formFieldStyles} />
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
                                                    fontSize: '1rem', color: '#8A94A6',
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
<TextField fullWidth select label="Rol" name="idRol" value={form.idRol} onChange={handleChange}
                             error={!!errores.idRol} helperText={errores.idRol}
                             slotProps={{ input: { startAdornment: <InputAdornment position="start"><AssignmentIndOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
                             sx={formFieldStyles}>
                             {rolesDisponibles.map((rol) => (
                                 <MenuItem key={rol.idRol} value={rol.idRol} sx={{ p: 0, justifyContent: 'flex-start', my: 0.5 }}>
                                     <Box sx={{
                                         backgroundColor: '#B91C1C',
                                         color: 'white',
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
                        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <TextField fullWidth label="Nueva contraseña" name="password" type="password"
                                value={form.password} onChange={handleChange}
                                error={!!errores.password} helperText={errores.password || 'Dejar vacío para mantener la actual'}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } } }}
                                sx={formFieldStyles} />
                            <TextField fullWidth label="Confirmar contraseña" name="confirmarPassword" type="password"
                                value={form.confirmarPassword} onChange={handleChange}
                                error={!!errores.confirmarPassword} helperText={errores.confirmarPassword}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } } }}
                                sx={formFieldStyles} />
                        </Box>
                    </Box>
                )
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label="Tipo de documento" value={form.tipoIdentificacion} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} />
                                <ConfirmRow label="Nombre" value={form.nombre} />
                                <ConfirmRow label="Apellido" value={form.apellido} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <LockOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Credenciales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica los datos de acceso</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} />
<ConfirmRow label="Correo" value={form.emailLocal + form.emailDominio} />
                                 <ConfirmRow label="Rol" value={rolesDisponibles.find(r => r.idRol === parseInt(form.idRol))?.nombre || form.idRol} />
                                <ConfirmRow label="Contraseña" value={form.password ? '••••••••' : 'Sin cambiar'} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Editar Usuario
                    </Typography>
                    <Typography variant="body2" color={COLORS.textMuted}>
                        {formOriginal?.nombre && formOriginal?.apellido
                            ? `Modificando datos de ${formOriginal.nombre} ${formOriginal.apellido}`
                            : 'Modifica los campos que necesites.'
                        }
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#8A94A6' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>

                <Stepper activeStep={activeStep} alternativeLabel
                    sx={{
                        mb: 3, mt: 2,
                        '& .MuiStepIcon-root': { color: '#E0E0E0' },
                        '& .MuiStepIcon-root.Mui-active': { color: COLORS.primary },
                        '& .MuiStepIcon-root.Mui-completed': { color: COLORS.primary },
                        '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
                        '& .MuiStepConnector-line': { borderColor: COLORS.border },
                        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: COLORS.primary },
                        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: COLORS.primary },
                        '& .MuiStepLabel-label': { fontSize: '0.8rem', color: COLORS.textMuted, mt: 0.5 },
                        '& .MuiStepLabel-label.Mui-active': { color: COLORS.text, fontWeight: 600 },
                        '& .MuiStepLabel-label.Mui-completed': { color: COLORS.primary, fontWeight: 500 },
                    }}>
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                    {renderStepContent()}
                </Box>

                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    px: 4, py: 2.5, borderTop: `1px solid ${COLORS.border}`, backgroundColor: '#FAFAFA',
                }}>
                    <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                        startIcon={<ArrowBackOutlinedIcon />} disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, borderColor: COLORS.border,
                            color: COLORS.text, fontWeight: 500,
                            '&:hover': { borderColor: '#BDBDBD', backgroundColor: COLORS.hoverBg },
                            '&.Mui-disabled': { borderColor: COLORS.border, color: COLORS.textMuted },
                        }}>
                        Anterior
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Button onClick={handleCancelar} disableRipple
                            sx={{
                                textTransform: 'none', color: COLORS.textMuted, fontWeight: 500, borderRadius: 2,
                                '&:hover': { backgroundColor: COLORS.hoverBg, color: COLORS.text },
                            }}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                            variant="contained"
                            disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                            endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : (activeStep < steps.length - 1 ? undefined : <SaveOutlinedIcon />)}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                                '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
                            }}>
                            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Usuario actualizado exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default ActualizarUsuario