import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { useTheme } from '@mui/material/styles'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import ConfirmToggleDialog from '../../shared/components/ConfirmToggleDialog.jsx'

const ModalInhabilitarRol = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const { usuario: usuarioActual } = useAuth()

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={onExited}
            onConfirm={onConfirm}
            icono={data.habilitadoActual
                ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={data.habilitadoActual ? '¿Inhabilitar rol?' : '¿Habilitar rol?'}
            subtitulo={data.habilitadoActual
                ? data.rolNombre === usuarioActual?.rol?.nombre
                    ? <>Se inhabilitarán <strong>todos los usuarios</strong> de este rol, excepto tu cuenta activa. No podrán iniciar sesión.</>
                    : <>Se inhabilitarán <strong>todos los usuarios</strong> de este rol. No podrán iniciar sesión.</>
                : <>Se habilitarán <strong>todos los usuarios</strong> de este rol. Volverán a tener acceso.</>}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
        />
    )
}

export default ModalInhabilitarRol
