import { Box, Typography, Paper, Alert } from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { cardSx } from '../../style/wizardStyles.js'

const PasoConfirmacion = ({ theme, form, formOriginal, rolesDisponibles, apiError, setApiError, sinCambios, setSinCambios, camposCambiados }) => {
    const getNombreRol = (idRol) => rolesDisponibles.find(r => r.idRol === parseInt(idRol))?.nombre || '—'
    const totalModificados = formOriginal ? Object.values(camposCambiados || {}).filter(Boolean).length : 0

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
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                    <ConfirmRow label="Tipo de documento" value={form.tipoIdentificacion} previousValue={formOriginal?.tipoIdentificacion} />
                    <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal?.numeroIdentificacion} />
                    <ConfirmRow label="Nombre" value={form.nombre} previousValue={formOriginal?.nombre} />
                    <ConfirmRow label="Apellido" value={form.apellido} previousValue={formOriginal?.apellido} />
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LockOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Contacto y Credenciales</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de acceso</Typography>
                    <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal?.telefono} />
                    <ConfirmRow label="Correo" value={form.email} previousValue={formOriginal?.email} />
                    <ConfirmRow label="Rol" value={getNombreRol(form.idRol)} previousValue={formOriginal ? getNombreRol(formOriginal.idRol) : undefined} />
                    <ConfirmRow label="Contraseña" value={formOriginal ? (form.password ? '••••••••' : 'Sin cambiar') : '••••••••'} previousValue={formOriginal ? 'Sin cambiar' : undefined} />
                </Paper>
            </Box>
        </Box>
    )
}

export default PasoConfirmacion
