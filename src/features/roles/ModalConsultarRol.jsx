import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, IconButton
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import CloseIcon from '@mui/icons-material/Close'

const ModalConsultarRol = ({ rol, onClose }) => {
    const theme = useTheme()
    if (!rol) return null

    const avatarStyle = theme.palette.avatarDefault || theme.palette.roles.default
    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={onClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: avatarStyle.bg, color: avatarStyle.color, width: 36, height: 36 }}>
                    <AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={theme.palette.secondary.main}>
                        Rol #{rol.idRol || rol.id}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary}>
                        Información del rol de usuario
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <SecurityOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Datos del Rol</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Información principal del rol
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                width: 50, height: 50, borderRadius: 2,
                                backgroundColor: avatarStyle.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 24, color: avatarStyle.color }} />
                            </Box>
                            <Box>
                                <Typography fontWeight={700} color={theme.palette.text.primary}>
                                    {rol.nombre}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.2}>
                                    {rol.descripcion || 'Sin descripción'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <SecurityOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Permisos</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Permisos asociados al rol
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9, borderTop: `1px solid ${theme.palette.divider}`, mt: 1, pt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Total permisos</Typography>
                            <Chip
                                label={`${rol.permisos?.length || 0} permisos`}
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
                        </Box>

                        {rol.permisos && rol.permisos.length > 0 && (
                            <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600} display="block" mb={1}>
                                    Lista de permisos
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {rol.permisos.slice(0, 10).map((permiso, idx) => (
                                        <Chip
                                            key={idx}
                                            label={permiso.replace(/_/g, ' ')}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#F3F4F6',
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderRadius: 8,
                                                border: 'none',
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    ))}
                                    {rol.permisos.length > 10 && (
                                        <Chip
                                            label={`+${rol.permisos.length - 10} más`}
                                            size="small"
                                            sx={{
                                                backgroundColor: theme.palette.primary.light,
                                                color: theme.palette.primary.main,
                                                fontWeight: 600,
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderRadius: 8,
                                                border: 'none',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalConsultarRol
