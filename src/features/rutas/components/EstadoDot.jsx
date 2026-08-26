import { Box, Typography } from '@mui/material'
import { getEstadoColorRuta } from '../../../shared/utils/estadoColors.js'

// Punto de estado específico de rutas (Cancelada="−", Completada="✓", Programada=círculo
// hueco, cualquier otro=círculo relleno) -- consolida las 4 implementaciones casi
// idénticas que había repetidas entre ListarRutaProgramacion.jsx (renderEstadoDot) y
// ModalConsultarRutaProgramacion.jsx (renderEstadoRuta).
export const RutaEstadoDot = ({ estado }) => {
    const color = getEstadoColorRuta(estado).color
    if (estado === 'Cancelada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color, lineHeight: 1 }}>−</Box>
    if (estado === 'Completada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color, lineHeight: 1 }}>✓</Box>
    if (estado === 'Programada')
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: `2px solid ${color}` }} />
    return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: color, border: `2px solid ${color}` }} />
}

// Renderiza el "punto de estado" (círculo relleno/hueco o símbolo ✓/−) + etiqueta, tal
// como lo devuelven getVentaEstadoDot/getAnticipoEstadoDot ({type, char, color, fill,
// label}). vehiculoDot/conductorDot (ModalConfirmarEstado) no traen type/char -- caen en
// la rama de círculo por defecto, igual que el EstadoDot local que tenían antes.
const EstadoDot = ({ type, char, color, fill, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {type === 'symbol'
            ? (
                <Box component="span" sx={{
                    width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: char === '✓' ? '0.8rem' : '0.85rem', color, lineHeight: 1, flexShrink: 0,
                }}>
                    {char}
                </Box>
            ) : (
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: fill ? color : 'transparent', border: `2px solid ${color}` }} />
            )}
        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{label}</Typography>
    </Box>
)

export default EstadoDot
