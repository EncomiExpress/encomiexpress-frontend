import { Menu, MenuItem, Tooltip } from '@mui/material'
import { RutaEstadoDot } from './EstadoDot.jsx'
import { motivoSalidaVencida } from '../utils/rutaResolvers.js'

const ESTADOS_RUTA = ['Programada', 'En Ruta', 'Completada', 'Cancelada']

const opcionesDisponibles = (estadoActual, ruta) => ESTADOS_RUTA.filter(op => {
    if (op === estadoActual) return false
    if (estadoActual === 'Programada') return op === 'En Ruta'
    if (estadoActual === 'Cancelada') return op === 'Programada'
    if (estadoActual === 'En Ruta' && op === 'Programada') return false
    // Con todas las sedes ya completas no queda ningún paquete "Por entregar" que
    // reasignar ni ningún tramo que truncar — Cancelada ya no representa nada
    // distinto de Completada en ese punto. Solo queda ofrecer la salida manual
    // "Completada" (fallback si el auto-completado no disparó solo, ej. por el
    // anticipo todavía pendiente — ver intentarAutoCompletar en LOGICA.md).
    if (estadoActual === 'En Ruta' && op === 'Cancelada' && ruta?.sedesTotales > 0 && (ruta?.sedesCompletadas ?? 0) >= ruta.sedesTotales) return false
    return true
})

const MENSAJE_VENCIDA = {
    fecha: 'La fecha de salida ya pasó — edita la ruta primero',
    hora: 'La hora de salida ya pasó — edita la ruta primero',
}

const MenuCambioEstadoRuta = ({ estadoMenu, onClose, onSeleccionar }) => (
    <Menu
        anchorEl={estadoMenu.anchor}
        open={Boolean(estadoMenu.anchor)}
        onClose={onClose}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
    >
        {opcionesDisponibles(estadoMenu.estadoActual, estadoMenu.ruta).map(op => {
            const motivo = op === 'Programada' ? motivoSalidaVencida(estadoMenu.ruta) : null
            const item = (
                <MenuItem key={op} disabled={!!motivo} onClick={() => onSeleccionar(op)} sx={{ fontSize: '0.82rem', gap: 1 }}>
                    <RutaEstadoDot estado={op} />
                    {op}
                </MenuItem>
            )
            return motivo ? (
                <Tooltip key={op} title={MENSAJE_VENCIDA[motivo]} placement="right">
                    <span>{item}</span>
                </Tooltip>
            ) : item
        })}
    </Menu>
)

export default MenuCambioEstadoRuta
