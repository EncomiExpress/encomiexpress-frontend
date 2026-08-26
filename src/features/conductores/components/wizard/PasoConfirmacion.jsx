import { Box, Typography, Paper, Alert } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { getTipoLabel, getLicenciaLabel } from '../../utils/conductorValidation.js'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({ theme, form, formOriginal, apiError, setApiError, sinCambios, setSinCambios }) => {
    const totalModificados = formOriginal ? [
        [form.tipoIdentificacion, formOriginal.tipoIdentificacion],
        [form.numeroIdentificacion, formOriginal.numeroIdentificacion],
        [form.nombre, formOriginal.nombre],
        [form.apellido, formOriginal.apellido],
        [form.telefono, formOriginal.telefono],
        [form.email, formOriginal.email],
        [form.password, ''],
        [form.numeroLicencia, formOriginal.numeroLicencia],
        [JSON.stringify(form.categoriasLicencia), JSON.stringify(formOriginal.categoriasLicencia)],
    ].filter(([a, b]) => sonDistintos(a, b)).length : 0

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
                        <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                    <ConfirmRow label="Tipo de documento" value={getTipoLabel(form.tipoIdentificacion)} previousValue={formOriginal ? getTipoLabel(formOriginal.tipoIdentificacion) : undefined} />
                    <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal?.numeroIdentificacion} />
                    <ConfirmRow label="Nombre" value={form.nombre} previousValue={formOriginal?.nombre} />
                    <ConfirmRow label="Apellido" value={form.apellido} previousValue={formOriginal?.apellido} />
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {formOriginal
                            ? <EmailOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                            : <LockOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />}
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Contacto y Credenciales</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de {formOriginal ? 'contacto' : 'acceso'}</Typography>
                    <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal?.telefono} />
                    <ConfirmRow label="Correo" value={form.email} previousValue={formOriginal?.email} />
                    <ConfirmRow label="Contraseña" value={formOriginal ? (form.password ? '••••••••' : 'Sin cambiar') : '••••••••'} previousValue={formOriginal ? 'Sin cambiar' : undefined} />
                </Paper>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Licencia de Conducción</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de licencia</Typography>
                    <ConfirmRow label="N° de licencia" value={form.numeroLicencia || '—'} previousValue={formOriginal ? (formOriginal.numeroLicencia || '—') : undefined} />
                    {form.categoriasLicencia.filter(c => c.categoria && c.vencimiento).map((cat, i) => {
                        const original = formOriginal?.categoriasLicencia?.find(c => c.categoria === cat.categoria)
                        return (
                            <ConfirmRow key={i} label={getLicenciaLabel(cat.categoria)} value={cat.vencimiento}
                                previousValue={formOriginal ? (original ? original.vencimiento : undefined) : undefined} />
                        )
                    })}
                </Paper>
            </Box>
        </Box>
    )
}

export default PasoConfirmacion
