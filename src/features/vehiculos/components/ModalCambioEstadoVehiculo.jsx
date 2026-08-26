import { alpha } from '@mui/material/styles'
import { Box, Typography, Menu, MenuItem, Dialog, DialogContent, IconButton, Button, CircularProgress } from '@mui/material'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import CloseIcon from '@mui/icons-material/Close'
import RutasMiniTabla from './RutasMiniTabla.jsx'

const ModalCambioEstadoVehiculo = ({
    theme,
    estadoMenu, onCloseMenu, onSeleccionarEstado,
    confirmMantenimiento, onCloseMantenimiento, onExitedMantenimiento,
    rutasMantenimiento, confirmandoEstado, onConfirmarMantenimiento,
}) => (
    <>
        <Menu
            anchorEl={estadoMenu.anchor}
            open={Boolean(estadoMenu.anchor)}
            onClose={onCloseMenu}
            slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
        >
            {['Disponible', 'Mantenimiento'].filter(op => estadoMenu.estadoActual !== op).map((op) => (
                <MenuItem key={op} onClick={() => onSeleccionarEstado(op)} sx={{ fontSize: '0.82rem', gap: 1 }}>
                    <Box sx={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        ...(op === 'Disponible'
                            ? { backgroundColor: 'transparent', border: '2px solid #10b981' }
                            : { backgroundColor: '#ea580c', border: '2px solid #ea580c' })
                    }} />
                    {op}
                </MenuItem>
            ))}
        </Menu>

        <Dialog
            open={confirmMantenimiento.open}
            onClose={onCloseMantenimiento}
            TransitionProps={{ onExited: onExitedMantenimiento }}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        >
            <DialogContent sx={{ p: 3, position: 'relative' }}>
                <IconButton onClick={onCloseMantenimiento} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2, textAlign: 'center' }}>
                    <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SwapHorizOutlinedIcon sx={{ fontSize: 35, color: theme.palette.warning.main }} />
                    </Box>
                    <Typography fontWeight={700} fontSize="1.35rem" color={theme.palette.text.primary}>
                        Cambiar a Mantenimiento
                    </Typography>
                    {rutasMantenimiento.loading ? (
                        <CircularProgress size={24} sx={{ mt: 1 }} />
                    ) : rutasMantenimiento.data.length > 0 ? (
                        <>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                Este vehículo tiene {rutasMantenimiento.data.length === 1 ? 'una ruta programada' : 'rutas programadas'}. {rutasMantenimiento.data.length === 1 ? 'No podrá ponerse en curso' : 'No podrán ponerse en curso'} mientras esté en mantenimiento.
                            </Typography>
                            <RutasMiniTabla rutas={rutasMantenimiento.data} theme={theme} />
                        </>
                    ) : (
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                            ¿Seguro que deseas cambiarlo a <Box component="span" fontWeight={700} color={theme.palette.warning.main}>Mantenimiento</Box>?
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                    <Button onClick={onCloseMantenimiento} disableRipple
                        sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`, '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary } }}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirmarMantenimiento}
                        disabled={confirmandoEstado}
                        variant="contained" disableRipple
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.warning.main, '&:hover': { backgroundColor: theme.palette.warning.dark } }}>
                        {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    </>
)

export default ModalCambioEstadoVehiculo
