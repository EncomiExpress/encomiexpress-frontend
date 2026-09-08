import { Box, Dialog, IconButton, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import RutaDiagrama from './RutaDiagrama.jsx'

// Modal liviano para revisar el recorrido de una ruta antes de confirmarla —
// usado en los selectores de Ventas/Anticipos, donde dos rutas con el mismo
// origen/destino pueden verse idénticas en texto pero tener paradas distintas.
const ModalRutaDiagrama = ({ open, onClose, origen, paradas, destino, subtitulo }) => {
    const theme = useTheme()
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 0.5 }}>
                <Box>
                    <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>Recorrido de la ruta</Typography>
                    {subtitulo && <Typography variant="caption" color={theme.palette.text.secondary}>{subtitulo}</Typography>}
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Box sx={{ px: 1, pb: 3, pt: 2 }}>
                <RutaDiagrama origen={origen} paradas={paradas} destino={destino} />
            </Box>
        </Dialog>
    )
}

export default ModalRutaDiagrama
