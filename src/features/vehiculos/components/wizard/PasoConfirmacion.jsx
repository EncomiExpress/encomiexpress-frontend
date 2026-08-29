import { Box, Typography, Paper, Alert } from '@mui/material'
import { DirectionsCarOutlined, EventOutlined, EditOutlined } from '@mui/icons-material'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { formatearPlaca } from '../../validations/vehiculoValidation.js'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({ theme, formData, formOriginal, apiError, setApiError, sinCambios, setSinCambios, propietarios }) => {
    const getNombrePropietario = (id) => {
        const p = propietarios.find(p => p.idPropietario === id)
        return p ? `${p.nombre} ${p.apellido}` : '—'
    }

    const totalModificados = formOriginal ? [
        [formData.placa, formOriginal.placa],
        [formData.tarjetaPropiedad, formOriginal.tarjetaPropiedad],
        [formData.marca, formOriginal.marca],
        [formData.modelo, formOriginal.modelo],
        [formData.color, formOriginal.color],
        [formData.tipo, formOriginal.tipo],
        [formData.capacidad, formOriginal.capacidad],
        [formData.origen, formOriginal.origen],
        [formData.idPropietario, formOriginal.idPropietario],
        [formData.vencimientoSOAT, formOriginal.vencimientoSOAT],
        [formData.vencimientoRevisionTecnica, formOriginal.vencimientoRevisionTecnica],
        [formData.vencimientoSeguroTerceros, formOriginal.vencimientoSeguroTerceros],
    ].filter(([a, b]) => sonDistintos(a, b)).length : 0

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formOriginal && totalModificados > 0 && (
                <Alert severity="info" icon={<EditOutlined fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                    Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
                </Alert>
            )}
            {sinCambios && (
                <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                    No has realizado ningún cambio. Los datos ya están actualizados.
                </Alert>
            )}
            {apiError && (
                <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError('')}>{apiError}</Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <DirectionsCarOutlined sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">Datos del Vehículo</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del vehículo</Typography>
                    <ConfirmRow label="Placa" value={formatearPlaca(formData.placa)} previousValue={formOriginal ? formatearPlaca(formOriginal.placa) : undefined} />
                    <ConfirmRow label="Marca" value={formData.marca} previousValue={formOriginal?.marca} />
                    <ConfirmRow label="Modelo" value={formData.modelo} previousValue={formOriginal?.modelo} />
                    <ConfirmRow label="Color" value={formData.color} previousValue={formOriginal?.color} />
                    <ConfirmRow label="Tipo" value={formData.tipo === 'Otro' ? formData.tipoOtro : formData.tipo} previousValue={formOriginal ? (formOriginal.tipo === 'Otro' ? formOriginal.tipoOtro : formOriginal.tipo) : undefined} />
                    <ConfirmRow label="Capacidad" value={formData.capacidad ? `${formData.capacidad} kg` : ''} previousValue={formOriginal ? (formOriginal.capacidad ? `${formOriginal.capacidad} kg` : undefined) : undefined} />
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EventOutlined sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem">{formOriginal ? 'Documentación' : 'Propietario y Documentación'}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        {formOriginal ? 'Verifica la documentación' : 'Verifica propietario y fechas de vencimiento'}
                    </Typography>
                    <ConfirmRow label="Propietario" value={getNombrePropietario(formData.idPropietario)} previousValue={formOriginal ? getNombrePropietario(formOriginal.idPropietario) : undefined} />
                    <ConfirmRow label="Tarjeta propiedad" value={formData.tarjetaPropiedad || 'N/A'} previousValue={formOriginal ? (formOriginal.tarjetaPropiedad || 'N/A') : undefined} />
                    <ConfirmRow label="Origen" value={formData.origen} previousValue={formOriginal?.origen} />
                    <ConfirmRow label="SOAT" value={formData.vencimientoSOAT || '—'} previousValue={formOriginal ? formOriginal.vencimientoSOAT : undefined} />
                    <ConfirmRow label="Revisión Técnica" value={formData.vencimientoRevisionTecnica || '—'} previousValue={formOriginal ? formOriginal.vencimientoRevisionTecnica : undefined} />
                    <ConfirmRow label={formOriginal ? 'Seguro Terceros' : 'Seguro de Terceros'} value={formData.vencimientoSeguroTerceros || '—'} previousValue={formOriginal ? formOriginal.vencimientoSeguroTerceros : undefined} />
                </Paper>
            </Box>
        </Box>
    )
}

export default PasoConfirmacion
