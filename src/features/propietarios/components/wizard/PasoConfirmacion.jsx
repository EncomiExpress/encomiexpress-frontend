import { Box, Typography, Paper, Alert } from '@mui/material'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { getTipoLabel } from '../../validations/propietarioValidation.js'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({ theme, form, formOriginal, apiError, setApiError, sinCambios, setSinCambios }) => {
    const esNit = form.tipoIdentificacion === 'NIT'
    const emailActual = form.email || '—'
    const emailOriginal = formOriginal ? (formOriginal.email || '—') : undefined

    const camposComparados = formOriginal ? [
        [form.tipoIdentificacion, formOriginal.tipoIdentificacion],
        [form.numeroIdentificacion, formOriginal.numeroIdentificacion],
        [form.nombre, formOriginal.nombre],
        [form.apellido, formOriginal.apellido],
        [form.telefono, formOriginal.telefono],
        [emailActual, emailOriginal],
        [form.tipoFlota, formOriginal.tipoFlota],
    ] : []
    const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formOriginal && totalModificados > 0 && (
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
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <BusinessOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                    <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} previousValue={formOriginal ? getTipoLabel(formOriginal.tipoIdentificacion) : undefined} />
                    <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal?.numeroIdentificacion} />
                    <ConfirmRow label={esNit ? 'Razón Social' : 'Nombre'} value={form.nombre} previousValue={formOriginal?.nombre} />
                    {!esNit && (
                        <ConfirmRow label="Apellido" value={form.apellido || 'N/A'} previousValue={formOriginal ? (formOriginal.apellido || 'N/A') : undefined} />
                    )}
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">Contacto y Flota</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de contacto y flota</Typography>
                    <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal?.telefono} />
                    <ConfirmRow label="Correo" value={emailActual} previousValue={emailOriginal} />
                    <ConfirmRow label="Tipo de flota" value={form.tipoFlota || 'N/A'} previousValue={formOriginal ? (formOriginal.tipoFlota || 'N/A') : undefined} />
                </Paper>
            </Box>
        </Box>
    )
}

export default PasoConfirmacion
