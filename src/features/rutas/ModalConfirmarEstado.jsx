import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography
} from '@mui/material'

const ModalConfirmarEstado = ({ open, nuevoEstado, info, onConfirm, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
            Confirmar cambio de estado
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{ mb: info ? 1.5 : 0 }}>
                ¿Cambiar el estado a <strong>"{nuevoEstado}"</strong>?
            </Typography>
            {info && (
                <Typography variant="body2" color="text.secondary">
                    {info}
                </Typography>
            )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
                onClick={onClose}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', borderRadius: 2 }}
            >
                Cancelar
            </Button>
            <Button
                onClick={onConfirm}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none', borderRadius: 2 }}
            >
                Confirmar
            </Button>
        </DialogActions>
    </Dialog>
)

export default ModalConfirmarEstado
