import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Menu, MenuItem, Tooltip } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import VentaEstadoDot from './VentaEstadoDot.jsx'
import { motivoVentaCancelada, MENSAJE_VENTA_CANCELADA } from '../utils/ventaResolvers.js'

// Mismo look & feel que MenuCambioEstadoRuta.jsx. Cancelada en Ventas sigue siendo
// 100% automática (ver LOGICA.md, "Ventas — Cancelada e inhabilitar/habilitar") — no
// hay ningún endpoint para ponerla a mano — pero SÍ existe un camino manual acotado
// para volver a "Programada": únicamente cuando la ruta asociada ya volvió a servir
// sola (`motivo === 'rutaYaSirve'`, ej. se canceló y se reprogramó) y no hay ningún
// dato que reasignar. Ahí "Programada" queda clickeable y reactiva la venta sin abrir
// el wizard de Editar (ventaService.reactivarEncomienda). En cualquier otro motivo
// (ruta cancelada/inhabilitada/avanzó/sin ruta), "Programada" se queda deshabilitada
// — esos sí necesitan Editar para elegir una ruta nueva.
const EstadoVentaCancelada = ({ venta, onReactivar }) => {
    const theme = useTheme()
    const [anchor, setAnchor] = useState(null)
    const motivo = motivoVentaCancelada(venta)
    const mensaje = MENSAJE_VENTA_CANCELADA[motivo] || 'Edítala para reactivarla.'
    const puedeReactivar = motivo === 'rutaYaSirve'

    const cerrarYReactivar = () => {
        setAnchor(null)
        onReactivar?.(venta)
    }

    return (
        <>
            <Box
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
            >
                <VentaEstadoDot estado="Cancelada" />
                <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
            </Box>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
            >
                {puedeReactivar ? (
                    <Tooltip title={mensaje} placement="right">
                        <MenuItem onClick={cerrarYReactivar} sx={{ fontSize: '0.82rem', gap: 1 }}>
                            <VentaEstadoDot estado="Programada" />
                        </MenuItem>
                    </Tooltip>
                ) : (
                    <Tooltip title={mensaje} placement="right">
                        <span>
                            <MenuItem disabled sx={{ fontSize: '0.82rem', gap: 1 }}>
                                <VentaEstadoDot estado="Programada" />
                            </MenuItem>
                        </span>
                    </Tooltip>
                )}
            </Menu>
        </>
    )
}

export default EstadoVentaCancelada
