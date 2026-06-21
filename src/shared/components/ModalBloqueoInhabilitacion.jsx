import { useTheme } from '@mui/material/styles'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Chip, Divider
} from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'

const ICONOS_TIPO = {
    'Vehículo': <DirectionsCarOutlinedIcon sx={{ fontSize: 16 }} />,
    'Ruta': <RouteOutlinedIcon sx={{ fontSize: 16 }} />,
    'Ruta En Curso': <RouteOutlinedIcon sx={{ fontSize: 16 }} />,
    'Encomienda': <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />,
    'Anticipo Pendiente': <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />,
    'Estado del anticipo': <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />,
    'Conductor': <PersonOutlinedIcon sx={{ fontSize: 16 }} />,
    'Conflicto de vehículo': <DirectionsCarOutlinedIcon sx={{ fontSize: 16 }} />,
    'Conflicto de conductor': <PersonOutlinedIcon sx={{ fontSize: 16 }} />,
}

const agruparPorTipo = (dependencias) => {
    const grupos = {}
    dependencias.forEach(dep => {
        if (!grupos[dep.tipo]) grupos[dep.tipo] = []
        grupos[dep.tipo].push(dep)
    })
    return grupos
}

const ModalBloqueoInhabilitacion = ({ open, onClose, entidad = 'registro', mensaje, dependencias = [] }) => {
    const theme = useTheme()

    const grupos = agruparPorTipo(dependencias)
    const tipos = Object.keys(grupos)

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                    }
                }
            }}
        >
            {/* Cabecera con color de advertencia */}
            <Box sx={{
                backgroundColor: theme.palette.error.main,
                px: 3,
                py: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}>
                <BlockOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
                <Typography fontWeight={700} fontSize="1.05rem" color="#fff">
                    No se puede inhabilitar este {entidad}
                </Typography>
            </Box>

            <DialogContent sx={{ px: 3, py: 2.5, backgroundColor: theme.palette.background.subtle }}>
                {/* Mensaje explicativo */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    mb: 2.5,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                }}>
                    <WarningAmberOutlinedIcon sx={{ color: theme.palette.warning.main, fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                    <Typography variant="body2" color={theme.palette.text.secondary} lineHeight={1.6}>
                        {mensaje || `Para inhabilitar este ${entidad} primero debes gestionar o inhabilitar los siguientes registros activos:`}
                    </Typography>
                </Box>

                {/* Lista de dependencias agrupadas por tipo */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {tipos.map((tipo) => (
                        <Box
                            key={tipo}
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.paper,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Encabezado del grupo */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 1.2,
                                backgroundColor: theme.palette.background.subtle,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                                <Box sx={{ color: theme.palette.primary.main }}>
                                    {ICONOS_TIPO[tipo] || <ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                                </Box>
                                <Typography variant="body2" fontWeight={700} color={theme.palette.text.primary}>
                                    {tipo}
                                </Typography>
                                <Chip
                                    label={grupos[tipo].length}
                                    size="small"
                                    sx={{
                                        ml: 'auto',
                                        height: 20,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        backgroundColor: theme.palette.primary.light,
                                        color: theme.palette.primary.main,
                                    }}
                                />
                            </Box>

                            {/* Items del grupo */}
                            {grupos[tipo].map((dep, idx) => (
                                <Box key={dep.id ?? idx}>
                                    {idx > 0 && <Divider />}
                                    <Box sx={{ px: 2, py: 1.2 }}>
                                        <Typography variant="body2" color={theme.palette.text.secondary} lineHeight={1.5}>
                                            {dep.descripcion}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                            boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}`,
                        },
                    }}
                >
                    Entendido
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalBloqueoInhabilitacion
