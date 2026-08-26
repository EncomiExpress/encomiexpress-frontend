import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Button, Dialog, Avatar, IconButton
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CampoFila from '../../../shared/components/CampoFila.jsx'
import FichaCard from '../../../shared/components/FichaCard.jsx'

const ModalConsultarUsuario = ({ usuario, onClose }) => {
    const theme = useTheme()
    if (!usuario) return null

    const iniciales = usuario.iniciales && usuario.iniciales !== 'U'
        ? usuario.iniciales
        : (usuario.nombre?.[0] || '') + (usuario.apellido?.[0] || '') || 'U'

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, pb: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{
                        backgroundColor: usuario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: usuario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                    }}>
                        {iniciales}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {usuario.nombre} {usuario.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>
                            {usuario.rol?.nombre || 'Usuario'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FichaCard icon={AssignmentIndOutlinedIcon} title="Detalles del Usuario" subtitle="Identificación y datos personales">
                        <CampoFila label="Identificación" value={`${usuario.tipoIdentificacion} ${usuario.numeroIdentificacion}`} />
                        <CampoFila label="Nombre" value={usuario.nombre} />
                        <CampoFila label="Apellido" value={usuario.apellido} />
                    </FichaCard>

                    <FichaCard icon={BadgeOutlinedIcon} title="Contacto y Cuenta" subtitle="Datos de contacto y estado de la cuenta">
                        <CampoFila label="Teléfono" value={usuario.telefono || '—'} />
                        <CampoFila label="Email" value={usuario.email} />
                        <CampoFila label="Rol" value={usuario.rol?.nombre} esChip chipVariant="outlined-pill" />
                        <CampoFila label="Estado" value={usuario.habilitado ? 'Habilitado' : 'Inhabilitado'} />
                    </FichaCard>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarUsuario
