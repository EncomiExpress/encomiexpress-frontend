import { Menu, MenuItem, Tooltip } from '@mui/material'
import { RutaEstadoDot as SalidaEstadoDot } from '../../rutas/components/EstadoDot.jsx'
import { motivoSalidaVencida } from '../utils/salidaResolvers.js'

const ESTADOS_SALIDA = ['Programada', 'En Ruta', 'Completada', 'Cancelada']

const opcionesDisponibles = (estadoActual, salida) => ESTADOS_SALIDA.filter(op => {
    if (op === estadoActual) return false
    if (estadoActual === 'Programada') return op === 'En Ruta'
    if (estadoActual === 'Cancelada') return op === 'Programada'
    if (estadoActual === 'En Ruta' && op === 'Programada') return false
    // Con todas las sedes ya completas no queda ningún paquete "Por entregar" que
    // reasignar ni ningún tramo que truncar — Cancelada ya no representa nada
    // distinto de Completada en ese punto.
    if (estadoActual === 'En Ruta' && op === 'Cancelada' && salida?.sedesTotales > 0 && (salida?.sedesCompletadas ?? 0) >= salida.sedesTotales) return false
    return true
})

const MENSAJE_VENCIDA = {
    fecha: 'La fecha de salida ya pasó — edita la salida primero',
    hora: 'La hora de salida ya pasó — edita la salida primero',
}

const MenuCambioEstadoSalida = ({ estadoMenu, onClose, onSeleccionar }) => (
    <Menu
        anchorEl={estadoMenu.anchor}
        open={Boolean(estadoMenu.anchor)}
        onClose={onClose}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
    >
        {opcionesDisponibles(estadoMenu.estadoActual, estadoMenu.salida).map(op => {
            const motivo = op === 'Programada' ? motivoSalidaVencida(estadoMenu.salida) : null
            const item = (
                <MenuItem key={op} disabled={!!motivo} onClick={() => onSeleccionar(op)} sx={{ fontSize: '0.82rem', gap: 1 }}>
                    <SalidaEstadoDot estado={op} />
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

export default MenuCambioEstadoSalida
