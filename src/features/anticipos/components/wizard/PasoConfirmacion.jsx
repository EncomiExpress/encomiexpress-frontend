import { Box, Typography, Paper, Alert } from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmRow from '../../../../shared/components/ConfirmRow.jsx'
import { formatMoney } from '../../utils/anticipoValidation.js'
import { cardSx } from '../../style/wizardStyles.js'

const PasoConfirmacion = ({
    theme, errorSubmit, totalModificados, sinCambios, setSinCambios, esEdicion,
    nombreRuta, previousNombreRuta, placa, nombreConductor, previousNombreConductor,
    valorAnticipo, previousValorAnticipo, fechaEntrega, previousFechaEntrega,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {esEdicion && totalModificados > 0 && (
            <Alert severity="info" icon={<EditOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
            </Alert>
        )}
        {sinCambios && (
            <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                No has realizado ningún cambio. Los datos ya están actualizados.
            </Alert>
        )}
        {errorSubmit && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{errorSubmit}</Alert>
        )}
        <Paper elevation={0} sx={cardSx(theme, { overflowHidden: true })}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>Datos del Anticipo</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica los datos antes de {esEdicion ? 'guardar' : 'registrar'}</Typography>
            <ConfirmRow label="Ruta" value={nombreRuta} previousValue={previousNombreRuta} />
            <ConfirmRow label="Vehículo" value={placa || '—'} />
            <ConfirmRow label="Conductor" value={nombreConductor} previousValue={previousNombreConductor} />
            <ConfirmRow label="Anticipo" value={formatMoney(valorAnticipo)} previousValue={previousValorAnticipo !== undefined ? formatMoney(previousValorAnticipo) : undefined} />
            <ConfirmRow label="F. Entrega" value={fechaEntrega} previousValue={previousFechaEntrega} />
        </Paper>
    </Box>
)

export default PasoConfirmacion
