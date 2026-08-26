import { Box, Typography, Menu, MenuItem, Dialog, DialogContent, IconButton, Button, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import VentaEstadoDot from './VentaEstadoDot.jsx'

const ModalCambioEstadoVenta = ({
    theme,
    estadoMenuAnchor, onCloseMenu, onSeleccionarCancelar,
    confirmCancelar, onCloseConfirm, confirmandoEstado, onConfirmar,
}) => (
    <>
        <Menu
            anchorEl={estadoMenuAnchor}
            open={Boolean(estadoMenuAnchor)}
            onClose={onCloseMenu}
            onClick={(e) => e.stopPropagation()}
            autoFocus={false}
            slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', mt: 0.5, minWidth: 150 } } }}
        >
            <MenuItem
                dense
                onClick={onSeleccionarCancelar}
                sx={{ gap: 0.75, '&:hover': { backgroundColor: theme.palette.action.hover } }}
            >
                <VentaEstadoDot estado="Cancelada" />
            </MenuItem>
        </Menu>

        <Dialog
            open={confirmCancelar.open}
            onClose={onCloseConfirm}
            maxWidth="xs"
            fullWidth
            onClick={(e) => e.stopPropagation()}
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
        >
            <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative' }}>
                <IconButton
                    onClick={onCloseConfirm}
                    sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
                >
                    <CloseIcon />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: '#3F3F4622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SwapHorizOutlinedIcon sx={{ fontSize: 35, color: '#3F3F46' }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            Cambiar estado
                        </Typography>
                        <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                            ¿Seguro que deseas cambiarlo a{' '}
                            <Box component="span" sx={{ fontWeight: 700, color: '#3F3F46' }}>Cancelada</Box>?
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                <Button
                    onClick={onCloseConfirm}
                    disableRipple
                    sx={{
                        textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500,
                        borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirmar}
                    disabled={confirmandoEstado}
                    variant="contained"
                    disableRipple
                    sx={{
                        textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                        px: 5, py: 0.76, fontSize: '0.875rem',
                        backgroundColor: '#3F3F46',
                        '&:hover': { backgroundColor: '#3F3F46', filter: 'brightness(0.88)' },
                    }}
                >
                    {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                </Button>
            </Box>
        </Dialog>
    </>
)

export default ModalCambioEstadoVenta
