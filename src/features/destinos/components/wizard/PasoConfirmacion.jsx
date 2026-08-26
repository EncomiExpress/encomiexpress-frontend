import { Box, Typography, Paper, Alert } from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({ theme, form, formOriginal, apiError, setApiError, sinCambios, setSinCambios }) => {
    const tarifaActual = form.tarifaBase ? `$${Number(form.tarifaBase).toLocaleString('es-CO')}` : '—'
    const tarifaOriginal = formOriginal ? (formOriginal.tarifaBase ? `$${Number(formOriginal.tarifaBase).toLocaleString('es-CO')}` : '—') : undefined

    const camposComparados = formOriginal ? [
        [form.departamento, formOriginal.departamento],
        [form.ciudad, formOriginal.ciudad],
        [form.direccion, formOriginal.direccion],
        [form.tarifaBase, formOriginal.tarifaBase],
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
            <Paper elevation={0} sx={cardSx(theme)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                    <Typography fontWeight={700} fontSize="0.95rem">Resumen del Destino</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    {formOriginal ? 'Verifica los cambios antes de guardar' : 'Verifica los datos antes de registrar'}
                </Typography>
                <ConfirmRow label="Departamento" value={form.departamento} previousValue={formOriginal?.departamento} />
                <ConfirmRow label="Ciudad" value={form.ciudad} previousValue={formOriginal?.ciudad} />
                <ConfirmRow label="Dirección" value={form.direccion || '—'} previousValue={formOriginal ? (formOriginal.direccion || '—') : undefined} />
                <ConfirmRow label="Tarifa Base" value={tarifaActual} previousValue={tarifaOriginal} />
            </Paper>
        </Box>
    )
}

export default PasoConfirmacion
