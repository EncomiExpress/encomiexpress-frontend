import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, TextField, Select, InputAdornment } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { useConductor } from '../../Context/ConductorContext'
import { FormField, FormSelect, formFieldStyles } from '../../Components/FormularioEstandarizado'

const DOMINIOS_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com', '@live.com']

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Datos Personales', 'Licencia de Conducción', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const RegistrarConductor = () => {
    const { registrarConductor } = useConductor()
    const navigate = useNavigate()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)

    const [form, setForm] = useState({
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        nombre: '',
        apellido: '',
        telefono: '',
        emailLocal: '',
        emailDominio: '@gmail.com',
        licenciaConduccion: '',
        fechaVencimientoLicencia: ''
    })

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
    }

    const validarPaso = (step) => {
        const e = {}
        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
        const soloNumeros = /^\d+$/

        if (step === 0) {
            if (!form.tipoIdentificacion) e.tipoIdentificacion = 'Selecciona un tipo de documento'
            if (!form.numeroIdentificacion.trim()) e.numeroIdentificacion = 'El número de documento es obligatorio'
            else if (!soloNumeros.test(form.numeroIdentificacion)) e.numeroIdentificacion = 'Solo se permiten números'
            if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
            else if (!soloLetras.test(form.nombre)) e.nombre = 'El nombre solo puede contener letras'
            if (!form.apellido?.trim()) e.apellido = 'El apellido es obligatorio'
        }

        if (step === 1) {
            if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener 10 dígitos'
            if (!form.emailLocal?.trim()) e.emailLocal = 'El correo es obligatorio'
            if (!form.licenciaConduccion) e.licenciaConduccion = 'Selecciona una categoría de licencia'
            if (!form.fechaVencimientoLicencia) e.fechaVencimientoLicencia = 'La fecha de vencimiento es obligatoria'
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
            registrarConductor({
                ...resto,
                email: emailLocal ? emailLocal + emailDominio : '',
                habilitado: true,
                estado: 'Activo'
            })
            setExito(true)
            setTimeout(() => navigate('/transporte/conductores'), 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar el conductor')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => navigate('/transporte/conductores')

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: 'white', elevation: 0,
        overflow: 'hidden',
    }

    const getTipoLabel = (tipo) => {
        const tipos = { 'CC': 'Cédula', 'NIT': 'NIT', 'CE': 'Cédula Extranjería', 'TI': 'Tarjeta Identidad', 'PAS': 'Pasaporte', 'RC': 'Registro Civil' }
        return tipos[tipo] || tipo
    }

    const getLicenciaLabel = (lic) => {
        const licencias = { 'A1': 'A1 - Motocicleta', 'A2': 'A2 - Motocicleta alta cilindrada', 'B1': 'B1 - Automóvil', 'B2': 'B2 - Camioneta', 'C1': 'C1 - Camión pequeño', 'C2': 'C2 - Camión grande', 'C3': 'C3 - Tractocamión', 'D1': 'D1 - Bus pequeño', 'D2': 'D2 - Bus grande', 'E': 'E - Remolque' }
        return licencias[lic] || lic
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormSelect label="Tipo de documento" name="tipoIdentificacion" value={form.tipoIdentificacion}
                            onChange={handleChange} required error={errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}>
                            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
                            <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="RC">Registro Civil (RC)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                        </FormSelect>
                        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
                            onChange={handleChange} required error={errores.numeroIdentificacion}
                            helperText={errores.numeroIdentificacion} icon={BadgeOutlinedIcon}
                            inputProps={{ maxLength: 15 }} />
                        <FormField label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
                            required error={errores.nombre} helperText={errores.nombre} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Juan" />
                        <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                            required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
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
                                                sx={{ fontSize: '1rem', color: '#8A94A6',
                                                    '& .MuiSelect-select': { py: 0, pl: 0.5, pr: '22px !important' } }}>
                                                {DOMINIOS_EMAIL.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                            </Select>
                                        </InputAdornment>
                                    ),
                                },
                                htmlInput: { maxLength: 50 }
                            }}
                            sx={formFieldStyles} />
                        <FormSelect label="Licencia de Conducción" name="licenciaConduccion" value={form.licenciaConduccion}
                            onChange={handleChange} required error={errores.licenciaConduccion} helperText={errores.licenciaConduccion}>
                            <MenuItem value="A1">A1 - Motocicleta</MenuItem>
                            <MenuItem value="A2">A2 - Motocicleta alta cilindrada</MenuItem>
                            <MenuItem value="B1">B1 - Automóvil</MenuItem>
                            <MenuItem value="B2">B2 - Camioneta</MenuItem>
                            <MenuItem value="C1">C1 - Camión pequeño</MenuItem>
                            <MenuItem value="C2">C2 - Camión grande</MenuItem>
                            <MenuItem value="C3">C3 - Tractocamión</MenuItem>
                            <MenuItem value="D1">D1 - Bus pequeño</MenuItem>
                            <MenuItem value="D2">D2 - Bus grande</MenuItem>
                            <MenuItem value="E">E - Remolque</MenuItem>
                        </FormSelect>
                        <FormField label="Fecha Vencimiento Licencia" name="fechaVencimientoLicencia" type="date"
                            value={form.fechaVencimientoLicencia} onChange={handleChange}
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
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Datos Personales</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información personal</Typography>
                                <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} />
                                <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} />
                                <ConfirmRow label="Nombre" value={form.nombre} />
                                <ConfirmRow label="Apellido" value={form.apellido} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Licencia de Conducción</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica los datos de licencia</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} />
                                <ConfirmRow label="Correo" value={form.emailLocal + form.emailDominio} />
                                <ConfirmRow label="Licencia" value={getLicenciaLabel(form.licenciaConduccion)} />
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
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} color={COLORS.text}>Registrar Conductor</Typography>
                <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                    Complete los datos del nuevo conductor paso a paso.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 4, pt: 3.5, pb: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
                    <Stepper activeStep={activeStep} alternativeLabel
                        sx={{
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
                        }}
                    >
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                </Box>

                <Box sx={{ px: 4, py: 3.5 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
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
                            disabled={submitting}
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                            }}>
                            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Conductor registrado exitosamente!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default RegistrarConductor