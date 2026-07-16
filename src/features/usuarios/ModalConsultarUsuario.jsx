import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, IconButton
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CloseIcon from '@mui/icons-material/Close'

const CampoFila = ({ label, value, esRol }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            {esRol ? (
                <Chip
                    label={value}
                    size="small"
                    variant="outlined"
                    sx={{
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 22,
                        borderRadius: 10,
                        borderColor: theme.palette.divider,
                    }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}
                    sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {String(value ?? '—')}
                </Typography>
            )}
        </Box>
    )
}

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
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="0.95rem">Detalles del Usuario</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Identificación y datos personales
                        </Typography>
                        <CampoFila label="Identificación" value={`${usuario.tipoIdentificacion} ${usuario.numeroIdentificacion}`} />
                        <CampoFila label="Nombre" value={usuario.nombre} />
                        <CampoFila label="Apellido" value={usuario.apellido} />
                    </Paper>

                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <BadgeOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="0.95rem">Contacto y Cuenta</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Datos de contacto y estado de la cuenta
                        </Typography>
                        <CampoFila label="Teléfono" value={usuario.telefono || '—'} />
                        <CampoFila label="Email" value={usuario.email} />
                        <CampoFila label="Rol" value={usuario.rol?.nombre} esRol />
                        <CampoFila label="Estado" value={usuario.habilitado ? 'Habilitado' : 'Inhabilitado'} />
                    </Paper>
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
