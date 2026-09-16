import { useTheme } from '@mui/material/styles'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'

// El backend (rutaService.toggleHabilitado) rechaza (400) inhabilitar una
// plantilla que todavía tiene alguna SalidaProgramada Programada/En Ruta — acá
// no se pre-chequea esa lista (eso vive del lado de /salidas, fuera del alcance
// de esta feature liviana); si el backend rechaza, el mensaje de error llega tal
// cual vía el toast de useRutaAcciones.js.
const ModalInhabilitarRuta = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={onExited}
            onConfirm={onConfirm}
            icono={data.habilitadoActual
                ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={data.habilitadoActual ? '¿Inhabilitar ruta?' : '¿Habilitar ruta?'}
            subtitulo={data.habilitadoActual
                ? <>La plantilla <strong>{data.etiqueta}</strong> quedará inhabilitada y no podrá elegirse para programar nuevas salidas. Si tiene alguna salida Programada o En Ruta, el sistema rechazará el cambio.</>
                : <>La plantilla <strong>{data.etiqueta}</strong> volverá a estar disponible para programar salidas.</>}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
        />
    )
}

export default ModalInhabilitarRuta
