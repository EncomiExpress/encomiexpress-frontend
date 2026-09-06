import { useState } from 'react'
import { Box, Typography, Chip, TextField, InputAdornment, IconButton, Tooltip, CircularProgress } from '@mui/material'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { formatearMoneda } from '../../../shared/utils/formatters.js'

// Control genérico (candado + edición inline) para un valor global de
// Configuracion -- reemplaza los antiguos TarifaPorKgControl.jsx (Destinos) y
// TarifaPorPaqueteControl.jsx (Ventas), casi idénticos entre sí. Cada tarifa
// (kg-hierro, kg-normal, por-paquete) instancia este mismo componente con su
// propio icono/etiqueta/tooltip y su propio useTarifaEditor().
const TarifaControl = ({ theme, tienePermiso, PERMISOS, editor, icono: Icono, etiqueta, tooltip, suffixIcon: SuffixIcon }) => {
    const {
        valor,
        editandoTarifa, tarifaInput, setTarifaInput, guardandoTarifa,
        handleAbrirEdicionTarifa, handleCancelarEdicionTarifa, handleGuardarTarifa,
    } = editor

    // El tooltip del candado se controla a mano: al hacer clic, el IconButton que lo
    // ancla se desmonta (cambia al modo edición) antes de que MUI reciba el mouseleave,
    // y el tooltip se quedaba "pegado" en pantalla. Se fuerza cerrado al abrir la edición.
    const [candadoTooltipOpen, setCandadoTooltipOpen] = useState(false)
    const [guardarTooltipOpen, setGuardarTooltipOpen] = useState(false)
    const [cancelarTooltipOpen, setCancelarTooltipOpen] = useState(false)
    const abrirEdicion = () => {
        setCandadoTooltipOpen(false)
        handleAbrirEdicionTarifa()
    }
    const guardar = () => {
        setGuardarTooltipOpen(false)
        setCancelarTooltipOpen(false)
        handleGuardarTarifa()
    }
    const cancelar = () => {
        setGuardarTooltipOpen(false)
        setCancelarTooltipOpen(false)
        handleCancelarEdicionTarifa()
    }

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            pl: 0.75, pr: 1.25, height: 40,
        }}>
            <Tooltip title={tooltip}>
                <Box sx={{
                    width: 26, height: 26, borderRadius: 1.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: theme.palette.primary.light,
                }}>
                    {Icono && <Icono sx={{ fontSize: 15, color: theme.palette.primary.darker }} />}
                </Box>
            </Tooltip>
            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                {etiqueta}
            </Typography>
            {editandoTarifa ? (
                <>
                    <TextField
                        size="small" autoFocus value={formatearMoneda(tarifaInput)} variant="standard"
                        onChange={e => setTarifaInput(e.target.value)}
                        slotProps={{ input: { disableUnderline: false, startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                        sx={{ width: 100 }}
                    />
                    <Tooltip title="Guardar"
                        open={guardarTooltipOpen && editandoTarifa}
                        onOpen={() => setGuardarTooltipOpen(true)}
                        onClose={() => setGuardarTooltipOpen(false)}>
                        <span>
                            <IconButton size="small" onClick={guardar} disabled={guardandoTarifa}
                                sx={{ color: theme.palette.primary.main, p: 0.5 }}>
                                {guardandoTarifa ? <CircularProgress size={14} /> : <CheckOutlinedIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Cancelar"
                        open={cancelarTooltipOpen && editandoTarifa}
                        onOpen={() => setCancelarTooltipOpen(true)}
                        onClose={() => setCancelarTooltipOpen(false)}>
                        <IconButton size="small" onClick={cancelar} disabled={guardandoTarifa}
                            sx={{ color: theme.palette.text.secondary, p: 0.5 }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </>
            ) : (
                <>
                    <Tooltip title={tooltip}>
                        <Chip
                            label={
                                SuffixIcon ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                        {`$${Number(valor).toLocaleString('es-CO')}`}
                                        <SuffixIcon sx={{ fontSize: 13 }} />
                                    </Box>
                                ) : `$${Number(valor).toLocaleString('es-CO')} / kg`
                            }
                            size="small"
                            sx={{
                                fontWeight: 600, backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.darker, fontSize: '0.75rem', height: 24,
                                '& .MuiChip-label': { display: 'flex', alignItems: 'center', px: 0.9 },
                            }}
                        />
                    </Tooltip>
                    {tienePermiso(PERMISOS.ACTUALIZAR_VENTA) ? (
                        <Tooltip title="Desbloquear para editar"
                            open={candadoTooltipOpen && !editandoTarifa}
                            onOpen={() => setCandadoTooltipOpen(true)}
                            onClose={() => setCandadoTooltipOpen(false)}>
                            <IconButton size="small" onClick={abrirEdicion}
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

export default TarifaControl
