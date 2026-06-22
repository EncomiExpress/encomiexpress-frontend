import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'

const CampoFila = ({ label, value, esRol }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{label}</Typography>
            {esRol ? (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 22,
                        borderRadius: 10,
                        border: 'none',
                    }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                    {String(value ?? '—')}
                </Typography>
            )}
        </Box>
    )
}

const ModalConsultarUsuario = ({ usuario, onClose }) => {
    const theme = useTheme()
    if (!usuario) return null
    const estado = usuario.habilitado ? 'Habilitado' : 'Inhabilitado'

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: theme.palette.background.subtle } } }}>

            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Perfil</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                    Información del perfil del usuario
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar sx={{
                        backgroundColor: usuario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: usuario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700
                    }}>
                        {usuario.iniciales && usuario.iniciales !== 'U' ? usuario.iniciales : (usuario.nombre?.[0] || '') + (usuario.apellido?.[0] || '') || 'U'}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                            {usuario.nombre} {usuario.apellido}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                            {usuario.email}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Usuario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Identificación y datos personales
                    </Typography>
                    <CampoFila label="Identificación" value={`${usuario.tipoIdentificacion} ${usuario.numeroIdentificacion}`} />
                    <CampoFila label="Nombre" value={usuario.nombre} />
                    <CampoFila label="Apellido" value={usuario.apellido} />
                </Paper>

                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Información de Contacto</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Datos de contacto y estado de la cuenta
                    </Typography>
                    <CampoFila label="Teléfono" value={usuario.telefono || '—'} />
                    <CampoFila label="Email" value={usuario.email} />
                    <CampoFila label="Rol" value={usuario.rol?.nombre} esRol />
                    <CampoFila label="Estado" value={estado} />
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarUsuario
