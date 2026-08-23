import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { useTheme } from '@mui/material/styles'
import ConfirmToggleDialog from '../../shared/components/ConfirmToggleDialog.jsx'

const ModalInhabilitarUsuario = ({ open, data, onClose, onExited, onConfirm }) => {
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
            titulo={data.habilitadoActual ? '¿Inhabilitar usuario?' : '¿Habilitar usuario?'}
            subtitulo={data.habilitadoActual
                ? <><strong>{data.nombreCompleto}</strong> no podrá iniciar sesión en el sistema.</>
                : <><strong>{data.nombreCompleto}</strong> podrá iniciar sesión en el sistema.</>}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
        />
    )
}

export default ModalInhabilitarUsuario
