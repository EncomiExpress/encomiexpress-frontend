import { Box, Typography, Chip, TextField, InputAdornment, IconButton, Tooltip, CircularProgress } from '@mui/material'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { formatearMoneda, limpiarMonedaInput } from '../../../shared/utils/formatters.js'

const TarifaPorKgControl = ({ theme, tienePermiso, PERMISOS, editor }) => {
    const {
        tarifaPorKg,
        editandoTarifa, tarifaInput, setTarifaInput, guardandoTarifa,
        handleAbrirEdicionTarifa, handleCancelarEdicionTarifa, handleGuardarTarifa,
    } = editor

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            pl: 0.75, pr: 1.25, height: 40,
        }}>
            <Tooltip title="Valor global usado en Ventas: tarifa del destino + peso × esta tarifa">
                <Box sx={{
                    width: 26, height: 26, borderRadius: 1.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: theme.palette.primary.light,
                }}>
                    <ScaleOutlinedIcon sx={{ fontSize: 15, color: theme.palette.primary.darker }} />
                </Box>
            </Tooltip>
            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Tarifa por kg
            </Typography>
            {editandoTarifa ? (
                <>
                    <TextField
                        size="small" autoFocus value={formatearMoneda(tarifaInput)} variant="standard"
                        onChange={e => setTarifaInput(limpiarMonedaInput(e.target.value))}
                        slotProps={{ input: { disableUnderline: false, startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                        sx={{ width: 100 }}
                    />
                    <Tooltip title="Guardar">
                        <span>
                            <IconButton size="small" onClick={handleGuardarTarifa} disabled={guardandoTarifa}
                                sx={{ color: theme.palette.primary.main, p: 0.5 }}>
                                {guardandoTarifa ? <CircularProgress size={14} /> : <CheckOutlinedIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Cancelar">
                        <IconButton size="small" onClick={handleCancelarEdicionTarifa} disabled={guardandoTarifa}
                            sx={{ color: theme.palette.text.secondary, p: 0.5 }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </>
            ) : (
                <>
                    <Tooltip title="Valor global usado en Ventas: tarifa del destino + peso × esta tarifa">
                        <Chip
                            label={`$${Number(tarifaPorKg).toLocaleString('es-CO')} / kg`}
                            size="small"
                            sx={{
                                fontWeight: 600, backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.darker, fontSize: '0.75rem', height: 24,
                            }}
                        />
                    </Tooltip>
                    {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) ? (
                        <Tooltip title="Desbloquear para editar">
                            <IconButton size="small" onClick={handleAbrirEdicionTarifa}
                                sx={{ color: theme.palette.text.secondary, p: 0.5, '&:hover': { backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker } }}>
                                <LockOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <LockOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.disabled }} />
                    )}
                </>
            )}
        </Box>
    )
}

export default TarifaPorKgControl
