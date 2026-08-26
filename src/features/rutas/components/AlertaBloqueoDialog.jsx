import { Box, Typography, Paper, Dialog, DialogContent, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { getVehiculoEstadoDot, getConductorEstadoDot } from '../../../shared/utils/estadoColors.js'
import EstadoDot from './EstadoDot.jsx'
import RegistrosLinkTable from './RegistrosLinkTable.jsx'

const AlertaBloqueoDialog = ({ theme, alertaBloqueo, onClose }) => (
    <Dialog open={alertaBloqueo.open} onClose={onClose}
        maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
        <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
            <IconButton onClick={onClose}
                sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                <CloseIcon />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                <Box sx={{
                    width: 67, height: 67, borderRadius: '50%', backgroundColor: `${theme.palette.primary.main}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%' }}>
                    <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                        {alertaBloqueo.titulo}
                    </Typography>
                    {alertaBloqueo.tipo === 'ventas' ? (
                        <Box sx={{ width: '100%', mt: 0.5 }}>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ mb: 1.5, textAlign: 'center' }}>
                                {alertaBloqueo.entidades.length === 1 ? 'Esta venta no tiene' : 'Estas ventas no tienen'} fecha estimada de entrega asignada. Asígnales una fecha antes de continuar.
                            </Typography>
                            <RegistrosLinkTable
                                theme={theme}
                                items={alertaBloqueo.entidades.map(e => ({ id: e.id, label: e.guia || `#${e.id}` }))}
                                columnLabel="Guía"
                                basePath="/ventas/listar"
                            />
                        </Box>
                    ) : alertaBloqueo.entidades.map((e, i) => {
                        const dot = e.tipo === 'vehiculo' ? getVehiculoEstadoDot(e.estado) : getConductorEstadoDot(e.estado)
                        return (
                            <Box key={i} sx={{ width: '100%', mt: i > 0 ? 1.5 : 0.5, textAlign: 'left' }}>
                                <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ mb: 1, textAlign: 'center' }}>
                                    {e.tipo === 'vehiculo' ? <>El vehículo <strong>{e.etiqueta}</strong> </> : <><strong>{e.etiqueta}</strong> </>}
                                    {e.mensaje}
                                    {e.rutaConflicto && (
                                        <>
                                            {' '}
                                            <Box component="span"
                                                onClick={() => window.open(`/transporte/rutas?highlight=${e.rutaConflicto.idRuta}`, '_blank')}
                                                sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', fontWeight: 600, '&:hover': { opacity: 0.75 } }}>
                                                {e.rutaConflicto.label}
                                            </Box>
                                            {' '}
                                        </>
                                    )}
                                    {e.mensajeFin}
                                </Typography>
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <Box
                                        onClick={() => e.id && window.open(`${e.tipo === 'vehiculo' ? '/vehiculos/listar' : '/transporte/conductores'}?highlight=${e.id}`, '_blank')}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: e.id ? 'pointer' : 'default', '&:hover': e.id ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {e.tipo === 'vehiculo'
                                                ? <DirectionsCarOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                : <PersonOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                            }
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{e.etiqueta}</Typography>
                                        </Box>
                                        <EstadoDot {...dot} />
                                    </Box>
                                </Paper>
                            </Box>
                        )
                    })}
                </Box>
            </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
            <Button onClick={onClose} variant="contained" disableRipple
                sx={{
                    textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': { backgroundColor: theme.palette.primary.main, filter: 'brightness(0.88)' }
                }}>
                Entendido
            </Button>
        </Box>
    </Dialog>
)

export default AlertaBloqueoDialog
