import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Snackbar } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import { useVentas } from '../../Context/VentaContext'
import { FormField, FormSelect } from '../../Components/FormularioEstandarizado'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const steps = ['Remitente', 'Destinatario', 'Paquete', 'Envío', 'Pago', 'Confirmación']

const ConfirmRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color={COLORS.text}>{value || '—'}</Typography>
    </Box>
)

const RegistrarVenta = () => {
    const { agregarVenta } = useVentas()
    const navigate = useNavigate()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [exito, setExito] = useState(false)

    // Datos quemados para selects
    const clientesMock = [
        { id: 1, nombre: 'Santiago Suárez Durán', identificacion: '1038648135', telefono: '3101234567', email: 'santiago@email.com', direccion: 'Calle 45 #20-10', ciudad: 'Bogotá' },
        { id: 2, nombre: 'Sebastian Valencia Pérez', identificacion: '1013343818', telefono: '3202345678', email: 'sebastian@email.com', direccion: 'Carrera 30 #15-22', ciudad: 'Medellín' },
        { id: 3, nombre: 'Valeria Paz Arana', identificacion: '1106634727', telefono: '3103456789', email: 'valeria@email.com', direccion: 'Avenida 50 #25-30', ciudad: 'Cali' },
        { id: 4, nombre: 'Carlos Gómez López', identificacion: '900123456', telefono: '3004567890', email: 'carlos@email.com', direccion: 'Calle 10 #5-15', ciudad: 'Barranquilla' },
        { id: 5, nombre: 'María Torres Ruiz', identificacion: '987654321', telefono: '3105678901', email: 'maria@email.com', direccion: 'Carrera 20 #8-40', ciudad: 'Bucaramanga' },
    ]

    const rutasMock = [
        { idRuta: 1, destino: 'Medellín', tarifa: 25000 },
        { idRuta: 2, destino: 'Bogotá', tarifa: 20000 },
        { idRuta: 3, destino: 'Cali', tarifa: 30000 },
        { idRuta: 4, destino: 'Barranquilla', tarifa: 35000 },
        { idRuta: 5, destino: 'Bucaramanga', tarifa: 28000 },
    ]

    const [form, setForm] = useState({
        idCliente: '',
        numeroIdentificacion: '',
        nombreRemitente: '',
        apellidoRemitente: '',
        telefonoRemitente: '',
        emailRemitente: '',
        direccionRemitente: '',
        ciudadRemitente: '',
        nombreDestinatario: '',
        telefonoDestinatario: '',
        direccionDestinatario: '',
        descripcionContenido: '',
        peso: '',
        alto: '',
        ancho: '',
        profundidad: '',
        valorDeclarado: '',
        idRuta: '',
        destino: '',
        fechaEstimadaEntrega: '',
        observaciones: '',
        metodoPago: '',
        valorServicio: '',
        impuestos: '',
        total: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name === 'idCliente') {
            const cliente = clientesMock.find(c => c.id === parseInt(value))
            if (cliente) {
                setForm(prev => ({
                    ...prev,
                    idCliente: value,
                    numeroIdentificacion: cliente.identificacion,
                    nombreRemitente: cliente.nombre.split(' ')[0],
                    apellidoRemitente: cliente.nombre.split(' ').slice(1).join(' '),
                    telefonoRemitente: cliente.telefono,
                    emailRemitente: cliente.email,
                    direccionRemitente: cliente.direccion,
                    ciudadRemitente: cliente.ciudad,
                }))
            }
            return
        }

        if (name === 'idRuta') {
            const ruta = rutasMock.find(r => r.idRuta === parseInt(value))
            if (ruta) {
                const impuestos = Math.round(ruta.tarifa * 0.10)
                setForm(prev => ({
                    ...prev,
                    idRuta: value,
                    destino: ruta.destino,
                    valorServicio: ruta.tarifa,
                    impuestos,
                    total: ruta.tarifa + impuestos,
                }))
            }
            return
        }

        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: '' }))
        setApiError(null)
    }

    const validarPaso = (step) => {
        const e = {}
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (step === 0) {
            if (!form.idCliente) e.idCliente = 'Selecciona un cliente'
            if (!form.nombreRemitente.trim()) e.nombreRemitente = 'El nombre es obligatorio'
            if (!form.apellidoRemitente.trim()) e.apellidoRemitente = 'El apellido es obligatorio'
            if (!form.telefonoRemitente.trim()) e.telefonoRemitente = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefonoRemitente)) e.telefonoRemitente = 'Debe tener 10 dígitos'
            if (!form.emailRemitente.trim()) e.emailRemitente = 'El correo es obligatorio'
            else if (!emailValido.test(form.emailRemitente)) e.emailRemitente = 'Correo inválido'
            if (!form.direccionRemitente.trim()) e.direccionRemitente = 'La dirección es obligatoria'
            if (!form.ciudadRemitente.trim()) e.ciudadRemitente = 'La ciudad es obligatoria'
        }

        if (step === 1) {
            if (!form.nombreDestinatario.trim()) e.nombreDestinatario = 'El nombre es obligatorio'
            if (!form.telefonoDestinatario.trim()) e.telefonoDestinatario = 'El teléfono es obligatorio'
            else if (!/^\d{10}$/.test(form.telefonoDestinatario)) e.telefonoDestinatario = 'Debe tener 10 dígitos'
            if (!form.direccionDestinatario.trim()) e.direccionDestinatario = 'La dirección es obligatoria'
        }

        if (step === 2) {
            if (!form.descripcionContenido.trim()) e.descripcionContenido = 'La descripción es obligatoria'
            if (!form.peso) e.peso = 'El peso es obligatorio'
            if (!form.alto) e.alto = 'El alto es obligatorio'
            if (!form.ancho) e.ancho = 'El ancho es obligatorio'
            if (!form.profundidad) e.profundidad = 'La profundidad es obligatoria'
        }

        if (step === 3) {
            if (!form.idRuta) e.idRuta = 'Selecciona un destino'
            if (!form.fechaEstimadaEntrega) e.fechaEstimadaEntrega = 'La fecha es obligatoria'
        }

        if (step === 4) {
            if (!form.metodoPago) e.metodoPago = 'Selecciona un método de pago'
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
            const ventaData = {
                cliente: {
                    idCliente: parseInt(form.idCliente),
                    tipoIdentificacion: 'CC',
                    numeroIdentificacion: form.numeroIdentificacion,
                    nombre: form.nombreRemitente,
                    apellido: form.apellidoRemitente,
                    telefono: form.telefonoRemitente,
                    email: form.emailRemitente,
                    direccion: form.direccionRemitente,
                    ciudad: form.ciudadRemitente,
                },
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario,
                    direccionDestinatario: form.direccionDestinatario,
                },
                paquete: {
                    descripcionContenido: form.descripcionContenido,
                    peso: parseFloat(form.peso),
                    alto: parseFloat(form.alto),
                    ancho: parseFloat(form.ancho),
                    profundidad: parseFloat(form.profundidad),
                    valorDeclarado: form.valorDeclarado ? parseFloat(form.valorDeclarado) : 0,
                },
                ruta: { idRuta: parseInt(form.idRuta), destino: form.destino },
                fechaEstimadaEntrega: form.fechaEstimadaEntrega,
                observaciones: form.observaciones,
                metodoPago: form.metodoPago,
                valorServicio: parseFloat(form.valorServicio),
                impuestos: parseFloat(form.impuestos),
                total: parseFloat(form.total),
                estadoPago: form.metodoPago === 'contraentrega' ? 'pendiente' : 'pagado',
            }
            agregarVenta(ventaData)
            setExito(true)
            setTimeout(() => navigate('/ventas/listar'), 1500)
        } catch (err) {
            setApiError(err.message || 'Error al registrar la venta.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelar = () => navigate('/ventas/listar')

    const cardSx = {
        flex: 1, borderRadius: 2, p: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: 'white',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormSelect label="Cliente" name="idCliente" value={form.idCliente}
                            onChange={handleChange} required error={errores.idCliente}>
                            <MenuItem value="">Seleccione un cliente</MenuItem>
                            {clientesMock.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.nombre} — {c.identificacion}</MenuItem>
                            ))}
                        </FormSelect>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Nombres" name="nombreRemitente" value={form.nombreRemitente}
                                onChange={handleChange} required error={errores.nombreRemitente}
                                helperText={errores.nombreRemitente} icon={PersonOutlinedIcon} />
                            <FormField label="Apellidos" name="apellidoRemitente" value={form.apellidoRemitente}
                                onChange={handleChange} required error={errores.apellidoRemitente}
                                helperText={errores.apellidoRemitente} icon={PersonOutlinedIcon} />
                            <FormField label="Número de identificación" name="numeroIdentificacion" value={form.numeroIdentificacion}
                                onChange={handleChange} required error={errores.numeroIdentificacion}
                                helperText={errores.numeroIdentificacion} icon={BadgeOutlinedIcon} />
                            <FormField label="Teléfono" name="telefonoRemitente" value={form.telefonoRemitente}
                                onChange={handleChange} required error={errores.telefonoRemitente}
                                helperText={errores.telefonoRemitente || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon} />
                            <FormField label="Correo electrónico" name="emailRemitente" type="email" value={form.emailRemitente}
                                onChange={handleChange} required error={errores.emailRemitente}
                                helperText={errores.emailRemitente} icon={EmailOutlinedIcon} />
                            <FormField label="Ciudad" name="ciudadRemitente" value={form.ciudadRemitente}
                                onChange={handleChange} required error={errores.ciudadRemitente}
                                helperText={errores.ciudadRemitente} icon={PlaceOutlinedIcon} />
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormField label="Dirección" name="direccionRemitente" value={form.direccionRemitente}
                                    onChange={handleChange} required error={errores.direccionRemitente}
                                    helperText={errores.direccionRemitente} icon={HomeOutlinedIcon} />
                            </Box>
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                            onChange={handleChange} required error={errores.nombreDestinatario}
                            helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon} />
                        <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                            onChange={handleChange} required error={errores.telefonoDestinatario}
                            helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon} />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                                onChange={handleChange} required error={errores.direccionDestinatario}
                                helperText={errores.direccionDestinatario} icon={HomeOutlinedIcon} multiline rows={2} />
                        </Box>
                    </Box>
                )
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormField label="Descripción del contenido" name="descripcionContenido" value={form.descripcionContenido}
                            onChange={handleChange} required error={errores.descripcionContenido}
                            helperText={errores.descripcionContenido} multiline rows={2} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                            <FormField label="Peso (kg)" name="peso" type="number" value={form.peso}
                                onChange={handleChange} required error={errores.peso}
                                helperText={errores.peso} placeholder="0.0" />
                            <FormField label="Alto (cm)" name="alto" type="number" value={form.alto}
                                onChange={handleChange} required error={errores.alto}
                                helperText={errores.alto} placeholder="0" />
                            <FormField label="Ancho (cm)" name="ancho" type="number" value={form.ancho}
                                onChange={handleChange} required error={errores.ancho}
                                helperText={errores.ancho} placeholder="0" />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Profundidad (cm)" name="profundidad" type="number" value={form.profundidad}
                                onChange={handleChange} required error={errores.profundidad}
                                helperText={errores.profundidad} placeholder="0" />
                            <FormField label="Valor declarado ($)" name="valorDeclarado" type="number" value={form.valorDeclarado}
                                onChange={handleChange} helperText="Opcional" placeholder="0" />
                        </Box>
                    </Box>
                )
            case 3:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormSelect label="Destino" name="idRuta" value={form.idRuta}
                                onChange={handleChange} required error={errores.idRuta}>
                                <MenuItem value="">Seleccione un destino</MenuItem>
                                {rutasMock.map(r => (
                                    <MenuItem key={r.idRuta} value={r.idRuta}>
                                        {r.destino} — ${r.tarifa.toLocaleString()}
                                    </MenuItem>
                                ))}
                            </FormSelect>
                            <FormField label="Fecha estimada de entrega" name="fechaEstimadaEntrega" type="date"
                                value={form.fechaEstimadaEntrega} onChange={handleChange} required
                                error={errores.fechaEstimadaEntrega} helperText={errores.fechaEstimadaEntrega} />
                        </Box>
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange} multiline rows={2}
                            placeholder="Observaciones adicionales sobre el envío" />
                    </Box>
                )
            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <FormSelect label="Método de pago" name="metodoPago" value={form.metodoPago}
                            onChange={handleChange} required error={errores.metodoPago}>
                            <MenuItem value="">Seleccione método de pago</MenuItem>
                            <MenuItem value="contraentrega">Contraentrega</MenuItem>
                            <MenuItem value="efectivo">Efectivo</MenuItem>
                            <MenuItem value="transferencia">Transferencia</MenuItem>
                            <MenuItem value="Nequi">Nequi</MenuItem>
                        </FormSelect>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                            <FormField label="Valor del servicio ($)" name="valorServicio" type="number"
                                value={form.valorServicio} onChange={handleChange} disabled />
                            <FormField label="Impuestos (10%)" name="impuestos" type="number"
                                value={form.impuestos} onChange={handleChange} disabled />
                            <FormField label="Total a pagar ($)" name="total" type="number"
                                value={form.total} onChange={handleChange} disabled />
                        </Box>
                    </Box>
                )
            case 5:
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
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Datos del Remitente</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información del remitente</Typography>
                                <ConfirmRow label="Nombre" value={`${form.nombreRemitente} ${form.apellidoRemitente}`} />
                                <ConfirmRow label="Identificación" value={form.numeroIdentificacion} />
                                <ConfirmRow label="Teléfono" value={form.telefonoRemitente} />
                                <ConfirmRow label="Ciudad" value={form.ciudadRemitente} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Datos del Destinatario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica la información del destinatario</Typography>
                                <ConfirmRow label="Nombre" value={form.nombreDestinatario} />
                                <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} />
                                <ConfirmRow label="Dirección" value={form.direccionDestinatario} />
                            </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Características del Paquete</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Verifica los datos del paquete</Typography>
                                <ConfirmRow label="Contenido" value={form.descripcionContenido} />
                                <ConfirmRow label="Peso" value={form.peso ? `${form.peso} kg` : null} />
                                <ConfirmRow label="Dimensiones" value={form.alto ? `${form.alto}×${form.ancho}×${form.profundidad} cm` : null} />
                                <ConfirmRow label="Valor declarado" value={form.valorDeclarado ? `$${parseFloat(form.valorDeclarado).toLocaleString()}` : '$0'} />
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PaymentOutlinedIcon sx={{ fontSize: 20, color: COLORS.text }} />
                                    <Typography fontWeight={700} fontSize="0.95rem" color={COLORS.text}>Envío y Pago</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>Destino, fechas y valores</Typography>
                                <ConfirmRow label="Destino" value={form.destino} />
                                <ConfirmRow label="Fecha entrega" value={form.fechaEstimadaEntrega} />
                                <ConfirmRow label="Método de pago" value={form.metodoPago} />
                                <ConfirmRow label="Total" value={form.total ? `$${parseFloat(form.total).toLocaleString()}` : null} />
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
                <Typography variant="h5" fontWeight={700} color={COLORS.text}>Registrar Venta</Typography>
                <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                    Complete los datos de la nueva encomienda paso a paso.
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
                    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
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
                            endIcon={activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />}
                            disableRipple
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                backgroundColor: COLORS.primary,
                                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                            }}>
                            {activeStep < steps.length - 1
                                ? 'Siguiente'
                                : submitting ? 'Registrando...' : 'Registrar'
                            }
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" sx={{ fontWeight: 600 }}>
                    ¡Venta registrada exitosamente!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default RegistrarVenta
