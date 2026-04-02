import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Snackbar, Alert } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useClientes } from '../../Context/ClienteContext'
import { FormField, FormSelect } from '../../Components/FormularioEstandarizado'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Datos Personales', 'Información de Contacto']

const ActualizarCliente = () => {
    const { id } = useParams()
    const { clientes, loading, actualizarCliente } = useClientes()
    const navigate = useNavigate()
    const [exito, setExito] = useState(false)
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        direccion: '',
        habilitado: true
    })

    useEffect(() => {
        if (loading) return
        const cliente = clientes.find(c => c.idCliente === parseInt(id))
        if (cliente) {
            setForm(cliente)
        } else {
            navigate('/clientes/listar')
        }
    }, [id, clientes, loading, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
    }

    const validarPaso = (step) => {
        const e = {}
        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
        const soloNumeros = /^\d+$/
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

            if (!form.email.trim()) e.email = 'El correo es obligatorio'
            else if (!emailValido.test(form.email)) e.email = 'Ingresa un correo electrónico válido'

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
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setSubmitting(true)
        setApiError(null)
        try {
            await actualizarCliente(form)
            setExito(true)
            setTimeout(() => navigate('/clientes/listar'), 1500)
        } catch (err) {
            setApiError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => navigate('/clientes/listar')

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
                            required error={errores.nombre} helperText={errores.nombre} icon={PersonOutlinedIcon} />
                        <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                            required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon} />
                        <FormSelect label="Tipo de documento" name="tipoIdentificacion" value={form.tipoIdentificacion}
                            onChange={handleChange} required error={errores.tipoIdentificacion}>
                            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
                            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                            <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
                            <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
                            <MenuItem value="RC">Registro Civil (RC)</MenuItem>
                            <MenuItem value="PAS">Pasaporte</MenuItem>
                        </FormSelect>
                        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
                            onChange={handleChange} required error={errores.numeroIdentificacion}
                            helperText={errores.numeroIdentificacion} icon={BadgeOutlinedIcon} />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {apiError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                                required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                                icon={PhoneOutlinedIcon} />
                            <FormField label="Correo electrónico" name="email" type="email" value={form.email}
                                onChange={handleChange} required error={errores.email} helperText={errores.email}
                                icon={EmailOutlinedIcon} />
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormField label="Dirección" name="direccion" value={form.direccion}
                                    onChange={handleChange} required error={errores.direccion}
                                    helperText={errores.direccion || 'Ej: Calle 45 #20-10'} icon={HomeOutlinedIcon} />
                            </Box>
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
                <Typography variant="h5" fontWeight={700} color={COLORS.text}>Editar Cliente</Typography>
                <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                    {form.nombre && form.apellido
                        ? `Modificando datos de ${form.nombre} ${form.apellido}`
                        : 'Modifica los campos que necesites.'
                    }
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                {/* ── Stepper ── */}
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

                {/* ── Contenido ── */}
                <Box sx={{ px: 4, py: 3.5 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>

                {/* ── Botones ── */}
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
                            endIcon={activeStep < steps.length - 1 ? undefined : <SaveOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                            }}>
                            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" sx={{ fontWeight: 600 }}>
                    ¡Cliente actualizado exitosamente!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ActualizarCliente
