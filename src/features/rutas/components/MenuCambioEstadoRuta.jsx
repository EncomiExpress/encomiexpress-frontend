import { Menu, MenuItem } from '@mui/material'
import { RutaEstadoDot } from './EstadoDot.jsx'

const ESTADOS_RUTA = ['Programada', 'En Ruta', 'Completada', 'Cancelada']

const opcionesDisponibles = (estadoActual) => ESTADOS_RUTA.filter(op => {
    if (op === estadoActual) return false
    if (estadoActual === 'Programada') return op === 'En Ruta'
    if (estadoActual === 'Cancelada') return op === 'Programada'
    if (estadoActual === 'En Ruta' && op === 'Programada') return false
    return true
})

const MenuCambioEstadoRuta = ({ estadoMenu, onClose, onSeleccionar }) => (
    <Menu
        anchorEl={estadoMenu.anchor}
        open={Boolean(estadoMenu.anchor)}
        onClose={onClose}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
    >
        {opcionesDisponibles(estadoMenu.estadoActual).map(op => (
            <MenuItem key={op} onClick={() => onSeleccionar(op)} sx={{ fontSize: '0.82rem', gap: 1 }}>
                <RutaEstadoDot estado={op} />
                {op}
            </MenuItem>
        ))}
    </Menu>
)

export default MenuCambioEstadoRuta
