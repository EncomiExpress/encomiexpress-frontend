import { useTheme } from '@mui/material/styles'
import { Box, Typography, Dialog, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import CampoFila from '../../../shared/components/CampoFila.jsx'
import FichaCard from '../../../shared/components/FichaCard.jsx'
import NacionSVG from '../../../shared/components/NacionSVG.jsx'
import { getRutaLabel } from '../utils/rutaResolvers.js'

const ModalConsultarRuta = ({ ruta, onClose }) => {
    const theme = useTheme()
    if (!ruta) return null

    const dotEstado = ruta.habilitado !== false
        ? { backgroundColor: 'transparent', border: `2px solid ${theme.palette.status?.activeText}` }
        : { backgroundColor: theme.palette.text.disabled, border: `2px solid ${theme.palette.text.disabled}` }

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>
            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.neutral.main, zIndex: 1, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2.5, pb: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 30, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <NacionSVG color={theme.palette.primary.main} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {getRutaLabel(ruta)}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Plantilla de corredor</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                <FichaCard icon={RouteOutlinedIcon} title="Datos de la plantilla" subtitle="Destino y observaciones asociados a este corredor">
                    <CampoFila label="Ruta" value={getRutaLabel(ruta)} />
                    <CampoFila label="Destino" value={ruta.destino ? `${ruta.destino.municipio}, ${ruta.destino.departamento}` : '—'} />
                    <CampoFila label="Observaciones" value={ruta.observaciones || 'Sin observaciones'} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, ...dotEstado }} />
                            <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                {ruta.habilitado !== false ? 'Habilitada' : 'Inhabilitada'}
                            </Typography>
                        </Box>
                    </Box>
                </FichaCard>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                <Button onClick={onClose} variant="contained"
                    sx={{
                        backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark }
                    }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarRuta
