import { alpha } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

// Chip de placa (3 letras + punto + 3 números) usado en Listar Vehículo, Consultar
// Vehículo y Listar Ruta — antes vivía duplicado igual en cada uno de esos archivos,
// se centraliza acá para reusarlo también en selectores de vehículo (ej. Registrar/
// Actualizar Ruta).
const PlacaDisplay = ({ placa, theme }) => {
    const letras = placa?.slice(0, 3) ?? ''
    const numeros = placa?.slice(3) ?? ''
    const c = theme.palette.primary.main
    return (
        <Box sx={{
            position: 'relative',
            width: 60,
            height: 25,
            backgroundColor: alpha(c, 0.07),
            border: `1.5px solid ${alpha(c, 0.28)}`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
                {letras}
            </Typography>
            <Box sx={{ width: 3, height: 3, backgroundColor: alpha(c, 0.5), borderRadius: '50%', mx: '2px', flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
                {numeros}
            </Typography>
        </Box>
    )
}

export default PlacaDisplay
