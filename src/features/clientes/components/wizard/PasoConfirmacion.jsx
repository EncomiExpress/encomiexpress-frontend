import { Box, Typography, Paper, Alert } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { cardSx } from '../../style/wizardStyles.js'

const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')

const PasoConfirmacion = ({ theme, form, formOriginal, apiError, setApiError, sinCambios, setSinCambios, destinos }) => {
    const esNit = form.tipoIdentificacion === 'NIT'

    // Respaldo si el municipio ya elegido fue inhabilitado desde que se registró
    // el cliente (mismo patrón que Rutas) — se usa el que ya trae `formOriginal`.
    const getDestinoLabel = (id) => {
        const d = destinos?.find(x => x.idDestino === parseInt(id))
        if (d) return `${d.ciudad}, ${d.departamento}`
        if (formOriginal?.destino && parseInt(id) === formOriginal.idDestino) return `${formOriginal.destino.ciudad}, ${formOriginal.destino.departamento}`
        return '—'
    }

    const camposComparados = formOriginal ? [
        [form.nombre, formOriginal.nombre],
        ...(esNit ? [] : [[form.apellido, formOriginal.apellido]]),
        [form.tipoIdentificacion, formOriginal.tipoIdentificacion],
        [form.numeroIdentificacion, formOriginal.numeroIdentificacion],
        [form.telefono, formOriginal.telefono],
        [form.email, formOriginal.email],
        [form.direccion, formOriginal.direccion],
        [form.idDestino, formOriginal.idDestino],
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
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información personal</Typography>
                    <ConfirmRow label="Tipo de documento" value={form.tipoIdentificacion} previousValue={formOriginal?.tipoIdentificacion} />
                    <ConfirmRow label="N° de documento" value={form.numeroIdentificacion} previousValue={formOriginal?.numeroIdentificacion} />
                    <ConfirmRow label={esNit ? 'Razón Social' : 'Nombre'} value={form.nombre} previousValue={formOriginal?.nombre} />
                    {!esNit && <ConfirmRow label="Apellido" value={form.apellido} previousValue={formOriginal?.apellido} />}
                </Paper>
                <Paper elevation={0} sx={cardSx(theme)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Información de Contacto</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos de contacto</Typography>
                    <ConfirmRow label="Teléfono" value={form.telefono} previousValue={formOriginal?.telefono} />
                    <ConfirmRow label="Correo" value={form.email} previousValue={formOriginal?.email} />
                    <ConfirmRow label="Dirección" value={form.direccion} previousValue={formOriginal?.direccion} />
                    <ConfirmRow label="Municipio" value={getDestinoLabel(form.idDestino)} previousValue={formOriginal ? getDestinoLabel(formOriginal.idDestino) : undefined} />
                </Paper>
            </Box>
        </Box>
    )
}

export default PasoConfirmacion
