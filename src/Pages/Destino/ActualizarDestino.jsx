import { useState, useEffect } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import { useDestino } from '../../Context/DestinoContext'
import { FormField, FormSelect, formFieldStyles } from '../../Components/FormularioEstandarizado'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Información del Destino', 'Datos de Contacto', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}
            sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {value || '—'}
        </Typography>
    </Box>
)

const ActualizarDestino = ({ open, onClose, destino, onSuccess }) => {
    const { actualizarDestino } = useDestino()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        telefono: '',
        contacto: ''
    })

    useEffect(() => {
        if (destino && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            setForm({
                nombre: destino.nombre || '',
                direccion: destino.direccion || '',
                ciudad: destino.ciudad || '',
                departamento: destino.departamento || '',
                telefono: destino.telefono || '',
                contacto: destino.contacto || ''
            })
            setOriginalData(destino)
        }
    }, [destino, open])

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name === 'telefono') {
            const filtered = value.replace(/[^0-9]/g, '')
            setForm(prev => ({ ...prev, [name]: filtered }))
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}

        if (step === 0) {
            if (!form.nombre?.trim()) e.nombre = 'El nombre del destino es obligatorio'
            if (!form.direccion?.trim()) e.direccion = 'La dirección es obligatoria'
            if (!form.departamento) e.departamento = 'Selecciona un departamento'
            if (!form.ciudad?.trim()) e.ciudad = 'La ciudad es obligatoria'
        }

        if (step === 1) {
            if (!form.telefono?.trim()) e.telefono = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener 10 dígitos'
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

        if (originalData) {
            const hayCambios = Object.keys(form).some(key => {
                const original = originalData[key] !== undefined ? String(originalData[key]) : ''
                const actual = form[key] !== undefined ? String(form[key]) : ''
                return original !== actual
            })
            
            if (!hayCambios) {
                setSinCambios(true)
                return
            }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            actualizarDestino({
                idDestino: destino.idDestino,
                ...form,
            })
            setExito(true)
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(err.message || 'Error al actualizar el destino')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setForm({
            nombre: '',
            direccion: '',
            ciudad: '',
            departamento: '',
            telefono: '',
            contacto: ''
        })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setOriginalData(null)
        setSinCambios(false)
        onClose()
    }

    const handleCancelar = () => handleClose()

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: 'white', elevation: 0,
        overflow: 'hidden',
    }

    const departamentos = [
        'Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá',
        'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cundinamarca',
        'Chocó', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
        'Nariño', 'Norte de Santander', 'Quindío', 'Risaralda',
        'Santander', 'Sucre', 'Tolima', 'Valle del Cauca'
    ]

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombre del Destino" name="nombre" value={form.nombre} onChange={handleChange}
                            required error={errores.nombre} helperText={errores.nombre} icon={LocationOnOutlinedIcon}
                            inputProps={{ maxLength: 100 }} placeholder="Ej: Terminal de Medellín" />
                        <FormField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange}
                            required error={errores.direccion} helperText={errores.direccion} icon={BusinessOutlinedIcon}
                            inputProps={{ maxLength: 200 }} placeholder="Ej: Cra 50 #30-25" />
                        <FormSelect label="Departamento" name="departamento" value={form.departamento}
                            onChange={handleChange} required error={errores.departamento} helperText={errores.departamento}>
                            {departamentos.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                        </FormSelect>
                        <FormField label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange}
                            required error={errores.ciudad} helperText={errores.ciudad} icon={LocationOnOutlinedIcon}
                            inputProps={{ maxLength: 50 }} placeholder="Ej: Medellín" />
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                            required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                            icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} placeholder="Ej: 6041234567" />
                        <FormField label="Persona de Contacto" name="contacto" value={form.contacto} onChange={handleChange}
                            icon={PersonOutlinedIcon} inputProps={{ maxLength: 100 }} placeholder="Ej: Juan Pérez" />
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
                                    <LocationOnOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Información del Destino</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información del destino</Typography>
                                <ConfirmRow label="Nombre" value={form.nombre} />
                                <ConfirmRow label="Dirección" value={form.direccion} />
                                <ConfirmRow label="Departamento" value={form.departamento} />
                                <ConfirmRow label="Ciudad" value={form.ciudad} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Datos de Contacto</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica los datos de contacto</Typography>
                                <ConfirmRow label="Teléfono" value={form.telefono} />
                                <ConfirmRow label="Contacto" value={form.contacto || 'N/A'} />
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
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Editar Destino
                    </Typography>
                    <Typography variant="body2" color={COLORS.textMuted} sx={{ mt: 0.5, ml: 0.5 }}>
                        {originalData?.nombre ? `Modificando datos de ${originalData.nombre}` : 'Modifica los campos que necesites.'}
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: '#8A94A6' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>

                <Stepper activeStep={activeStep} alternativeLabel
                    sx={{ mb: 3, mt: 2,
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

                <Box sx={{ maxWidth: 700, mx: 'auto', mt: 3 }}>
                    {renderStepContent()}
                </Box>

                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 3, pt: 2, borderTop: `1px solid ${COLORS.border}`,
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
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                                '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
                            }}>
                            {activeStep < steps.length - 1 ? 'Siguiente' : submitting ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar cambios'}
                        </Button>
                    </Box>
                </Box>

            </DialogContent>

            <Snackbar open={exito} autoHideDuration={2500} onClose={() => setExito(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setExito(false)}>
                    ¡Destino actualizado exitosamente!
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default ActualizarDestino