import { Box, Dialog, IconButton, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import RutaDiagrama from './RutaDiagrama.jsx'

// Modal liviano para revisar el recorrido de una ruta antes de confirmarla —
// usado en los selectores de Ventas/Anticipos, donde dos rutas con el mismo
// origen/destino pueden verse idénticas en texto pero tener paradas distintas.
//
// `recorridos` (opcional): array de `{ label, paradas }`, uno por PAR
// vehículo+conductor del convoy -- cuando trae 2 o más, se dibuja un diagrama
// por cada uno (con su propia etiqueta), en vez de mostrar solo el recorrido de
// un vehículo "representativo" con un aviso de que los demás pueden variar. Los
// llamadores que todavía pasan `paradas` a nivel plano (un solo recorrido, ej.
// Ventas/Anticipos eligiendo UN par concreto) siguen funcionando igual.
const ModalRutaDiagrama = ({ open, onClose, origen, paradas, destino, subtitulo, recorridos }) => {
    const theme = useTheme()
    const multiples = recorridos && recorridos.length > 1
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
            <Box sx={{ px: 1, pb: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: multiples ? 2.5 : 0 }}>
                {multiples ? recorridos.map((r, i) => (
                    <Box key={i}>
                        <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary} sx={{ px: 2, display: 'block', mb: 0.5 }}>
                            {r.label}
                        </Typography>
                        <RutaDiagrama origen={origen} paradas={r.paradas} destino={destino} />
                        {i < recorridos.length - 1 && <Box sx={{ borderBottom: `1px dashed ${theme.palette.divider}`, mt: 2.5 }} />}
                    </Box>
                )) : (
                    <RutaDiagrama origen={origen} paradas={recorridos?.[0]?.paradas ?? paradas} destino={destino} />
                )}
            </Box>
        </Dialog>
    )
}

export default ModalRutaDiagrama
