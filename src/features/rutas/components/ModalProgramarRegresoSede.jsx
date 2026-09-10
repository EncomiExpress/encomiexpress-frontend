import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Chip, IconButton, CircularProgress } from '@mui/material'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CalendarioDisponibilidad from '../../../shared/components/CalendarioDisponibilidad.jsx'
import SelectorHora from '../../../shared/components/SelectorHora.jsx'
import { hoyISO, getRangoHorario } from '../../../shared/utils/horarioLaboral.js'
import { validarCampo, maxISO } from '../validations/rutaValidation.js'
import { resolveParadas, resolveDestino } from '../utils/rutaResolvers.js'

// Modal chico del operador_sede para disparar el regreso de una ida ya
// Completada (WS4, "Sedes remotas") — solo pide fecha/hora de salida; el resto
// (convoy, paradas invertidas, origen, destino) lo arma el backend a partir de
// la ida y se muestra acá solo como resumen de confirmación. A diferencia del
// wizard completo de Ruta (RegistrarRutaProgramacion con prefill), este modal
// no permite tocar nada más. Ver LOGICA.md, "Sedes remotas".
const ModalProgramarRegresoSede = ({ open, ruta, destinos = [], onClose, onConfirmar }) => {
    const theme = useTheme()
    const [form, setForm] = useState({ fechaSalida: '', horaSalida: '' })
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)
    const [apiError, setApiError] = useState('')

    useEffect(() => {
        if (open) {
            setForm({ fechaSalida: '', horaSalida: '' })
            setErrores({})
            setApiError('')
        }
    }, [open])

    if (!ruta) return null

    const origenRegreso = resolveDestino(ruta, destinos, { preferNombre: true })
    const paradasInvertidas = [...resolveParadas(ruta)].reverse()
    const pares = (ruta.paresVehiculoConductor || []).map(p => ({ idVehiculo: p.idVehiculo, idConductor: p.idConductor }))

    const handleConfirmar = async () => {
        const e = {
            fechaSalida: validarCampo('fechaSalida', form),
            horaSalida: validarCampo('horaSalida', form),
        }
        setErrores(e)
        if (e.fechaSalida || e.horaSalida) return

        setEnviando(true)
        setApiError('')
        try {
            await onConfirmar(ruta, form)
        } catch (err) {
            setApiError(err.message || 'No se pudo programar el regreso')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Dialog open={open} onClose={enviando ? undefined : onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SyncAltOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography fontWeight={700} fontSize="1.05rem">Programar regreso</Typography>
                </Box>
                <IconButton size="small" onClick={onClose} disabled={enviando}>
                    <CloseOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.background.subtle }}>
                    <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {origenRegreso} → Medellín
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 0.75 }}>
                        Convoy (mismo de la ida)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {pares.length === 0 ? (
                            <Typography variant="body2" color={theme.palette.text.secondary}>Sin convoy asignado</Typography>
                        ) : (ruta.paresVehiculoConductor || []).map((p, i) => (
                            <Typography key={p.idRutaVehiculoConductor || i} variant="body2">
                                {p.vehiculo?.placa || 'Vehículo'} · {p.conductor?.usuario ? `${p.conductor.usuario.nombre} ${p.conductor.usuario.apellido}` : 'Conductor'}
                            </Typography>
                        ))}
                    </Box>
                </Box>

                {paradasInvertidas.length > 0 && (
                    <Box>
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 0.75 }}>
                            Paradas (invertidas)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {paradasInvertidas.map((p) => (
                                <Chip key={p.idDestino} label={p.municipio} size="small" />
                            ))}
                        </Box>
                    </Box>
                )}

                <CalendarioDisponibilidad
                    label="Fecha de Salida"
                    required
                    value={form.fechaSalida}
                    onChange={(iso) => {
                        const formActualizado = { ...form, fechaSalida: iso }
                        setForm(formActualizado)
                        setErrores(prev => ({ ...prev, fechaSalida: '', horaSalida: prev.horaSalida ? validarCampo('horaSalida', formActualizado) : '' }))
                        setApiError('')
                    }}
                    pares={pares}
                    esRegreso
                    minDate={hoyISO()}
                    maxDate={maxISO()}
                    error={errores.fechaSalida}
                />
                <SelectorHora label="Hora de Salida" required
                    value={form.horaSalida}
                    onChange={(v) => {
                        const formActualizado = { ...form, horaSalida: v }
                        setForm(formActualizado)
                        setErrores(prev => ({ ...prev, horaSalida: validarCampo('horaSalida', formActualizado) }))
                        setApiError('')
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, horaSalida: validarCampo('horaSalida', form) }))}
                    rango={getRangoHorario(form.fechaSalida)}
                    error={errores.horaSalida}
                    helperText={form.fechaSalida ? 'Solo horario laboral' : 'Selecciona primero la fecha de salida'} />

                {apiError && (
                    <Typography variant="body2" color="error">{apiError}</Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} disabled={enviando} sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button onClick={handleConfirmar} disabled={enviando} variant="contained"
                    startIcon={enviando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
                    sx={{ textTransform: 'none', borderRadius: 2 }}>
                    {enviando ? 'Programando...' : 'Programar regreso'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalProgramarRegresoSede
