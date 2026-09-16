import { useTheme } from '@mui/material/styles'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'
import { motivoSalidaVencida } from '../utils/salidaResolvers.js'

// El backend (salidaProgramadaService.toggleHabilitado) rechaza (409) inhabilitar
// una salida "En Ruta" o con encomiendas activas -- ese mensaje llega tal cual vía
// el toast de useSalidaAcciones.js. Acá solo se anticipa el caso de REHABILITAR una
// Programada cuya fecha/hora ya venció -- el backend la deja Cancelada de una vez
// (seCancelaPorFechaVencida), y conviene avisarlo antes de confirmar.
const ModalInhabilitarSalida = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const seCancelariaPorFechaVencida = !data.habilitadoActual && data.estadoSalida === 'Programada'
        && motivoSalidaVencida({ fechaSalida: data.fechaSalida, horaSalida: data.horaSalida }) !== null

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={onExited}
            onConfirm={onConfirm}
            icono={data.habilitadoActual
                ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={data.habilitadoActual ? '¿Inhabilitar salida?' : '¿Habilitar salida?'}
            subtitulo={data.habilitadoActual
                ? <>La salida <strong>{data.origen} → {data.destino}</strong> quedará inhabilitada. Si está "En Ruta" o tiene encomiendas activas, el sistema rechazará el cambio.</>
                : seCancelariaPorFechaVencida
                    ? <>La salida <strong>{data.origen} → {data.destino}</strong> se habilitará, pero como su fecha/hora de salida ya pasó, quedará marcada como <strong>Cancelada</strong> en vez de Programada.</>
                    : <>La salida <strong>{data.origen} → {data.destino}</strong> volverá a estar activa en el sistema.</>}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
        />
    )
}

export default ModalInhabilitarSalida
