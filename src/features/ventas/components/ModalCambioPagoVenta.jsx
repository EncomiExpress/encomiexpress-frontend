import { Box, Typography, Menu, MenuItem, Dialog, DialogContent, IconButton, Button, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'

const ModalCambioPagoVenta = ({
    theme,
    pagoMenuAnchor, onCloseMenu, onSeleccionarPagado,
    confirmPago, onCloseConfirm, confirmandoEstado, onConfirmar,
}) => (
    <>
        <Menu
            anchorEl={pagoMenuAnchor}
            open={Boolean(pagoMenuAnchor)}
            onClose={onCloseMenu}
            onClick={(e) => e.stopPropagation()}
            autoFocus={false}
            slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', mt: 0.5, minWidth: 130 } } }}
        >
            <MenuItem
                dense
                onClick={onSeleccionarPagado}
                sx={{ gap: 0.75, '&:hover': { backgroundColor: theme.palette.action.hover } }}
            >
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>Pagado</Typography>
            </MenuItem>
        </Menu>

        <Dialog
            open={confirmPago.open}
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
                    <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: '#05996920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PaidOutlinedIcon sx={{ fontSize: 35, color: '#059669' }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            Confirmar pago
                        </Typography>
                        <Typography fontWeight={700} fontSize="0.8rem" color={theme.palette.text.secondary}>
                            Estado irreversible.
                        </Typography>
                        <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                            ¿Marcar esta venta como{' '}
                            <Box component="span" sx={{ fontWeight: 700, color: '#059669' }}>Pagada</Box>?
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
                        backgroundColor: '#059669',
                        '&:hover': { backgroundColor: '#059669', filter: 'brightness(0.88)' },
                    }}
                >
                    {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                </Button>
            </Box>
        </Dialog>
    </>
)

export default ModalCambioPagoVenta
