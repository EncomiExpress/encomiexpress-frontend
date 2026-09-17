import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Diagrama simple del recorrido de una ruta: origen y destino como puntos
// principales, conectados por una línea horizontal (rutas directas, sin paradas
// intermedias).
const ANCHO_PUNTO = 90

const RutaDiagrama = ({ origen, destino }) => {
    const theme = useTheme()
    const puntos = [
        { label: origen || 'Origen', principal: true },
        { label: destino || 'Destino', principal: true },
    ]
    const ancho = puntos.length * ANCHO_PUNTO

    return (
        <Box sx={{ overflowX: 'auto', py: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 'fit-content' }}>
                <Box sx={{ position: 'relative', width: ancho, px: 2 }}>
                    <Box sx={{
                        position: 'absolute', top: 15, left: ANCHO_PUNTO / 2, right: ANCHO_PUNTO / 2,
                        height: 2, backgroundColor: theme.palette.divider,
                    }} />
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                        {puntos.map((p, i) => (
                            <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                                <Box sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Box sx={{
                                        width: p.principal ? 14 : 9, height: p.principal ? 14 : 9, borderRadius: '50%',
                                        backgroundColor: p.principal ? theme.palette.primary.main : theme.palette.background.paper,
                                        border: `2px solid ${theme.palette.primary.main}`,
                                    }} />
                                </Box>
                                <Typography variant="caption" title={p.label} noWrap
                                    sx={{
                                        maxWidth: ANCHO_PUNTO - 8, textAlign: 'center',
                                        color: p.principal ? theme.palette.text.primary : theme.palette.text.secondary,
                                        fontWeight: p.principal ? 700 : 500,
                                    }}>
                                    {p.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default RutaDiagrama
