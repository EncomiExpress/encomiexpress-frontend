import { Box, Typography, Dialog, DialogContent, IconButton, Button, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'

const ModalConfirmarExcedente = ({ theme, confirmDev, onClose, confirmandoEstado, onConfirmar }) => (
    <Dialog
        open={confirmDev.open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
    >
        <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative' }}>
            <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.neutral.main, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>
                <CloseIcon />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: confirmDev.esFaltante ? theme.palette.error.dim : theme.palette.success.dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TaskAltOutlinedIcon sx={{ fontSize: 35, color: confirmDev.esFaltante ? theme.palette.error.main : theme.palette.success.main }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                        {confirmDev.esFaltante ? 'Confirmar reposición' : 'Confirmar devolución'}
                    </Typography>
                    <Typography fontWeight={700} fontSize="0.8rem" color={theme.palette.text.secondary}>
                        Estado irreversible.
                    </Typography>
                    <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                        {confirmDev.esFaltante ? '¿Ya le repusiste el faltante al conductor?' : '¿El conductor devolvió el excedente?'}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {confirmDev.esFaltante
                    ? <>El anticipo pasará a <strong>Completado</strong> y quedará registrada la fecha de hoy.</>
                    : <>El anticipo pasará a <strong>Completado</strong> y la fecha de entrega del excedente quedará registrada a la de hoy.</>}
            </Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
            <Button onClick={onClose} disableRipple sx={{
                textTransform: 'none', color: theme.palette.neutral.main, fontWeight: 500,
                borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { backgroundColor: theme.palette.neutral.dim, color: theme.palette.neutral.dark },
            }}>
                Cancelar
            </Button>
            <Button onClick={onConfirmar} disabled={confirmandoEstado} variant="contained" disableRipple sx={{
                textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                px: 5, py: 0.76, fontSize: '0.875rem',
                backgroundColor: confirmDev.esFaltante ? theme.palette.error.main : theme.palette.success.main,
                '&:hover': { backgroundColor: confirmDev.esFaltante ? theme.palette.error.dark : theme.palette.success.dark },
            }}>
                {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
            </Button>
        </Box>
    </Dialog>
)

export default ModalConfirmarExcedente
