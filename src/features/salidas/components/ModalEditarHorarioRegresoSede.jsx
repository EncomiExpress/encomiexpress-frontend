import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, IconButton, CircularProgress } from '@mui/material'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CalendarioDisponibilidad from '../../../shared/components/CalendarioDisponibilidad.jsx'
import SelectorHora from '../../../shared/components/SelectorHora.jsx'
import { hoyISO, getRangoHorario, sumarDias, MIN_DIAS_SALIDA_LLEGADA } from '../../../shared/utils/horarioLaboral.js'
import { validarCampo, maxISO } from '../validations/salidaValidation.js'
import { resolveDestino } from '../utils/salidaResolvers.js'

// Modal chico del operador_sede para editar SOLO la fecha/hora de su propio
// regreso ya creado (Programado o Cancelado) — convoy, destino y origen los
// hereda de la ida y no puede tocarlos. El backend (salidaProgramadaService.update)
// revalida ownership y rechaza cualquier otro campo que no sea uno de estos 4.
const ModalEditarHorarioRegresoSede = ({ open, salida, destinos = [], onClose, onConfirmar }) => {
    const theme = useTheme()
    const [form, setForm] = useState({ fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '' })
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)
    const [apiError, setApiError] = useState('')

    useEffect(() => {
        if (open && salida) {
            setForm({
                fechaSalida: salida.fechaSalida || '',
                horaSalida: (salida.horaSalida || '').slice(0, 5),
                fechaLlegadaEstimada: salida.fechaLlegadaEstimada || '',
                horaLlegadaEstimada: (salida.horaLlegadaEstimada || '').slice(0, 5),
            })
            setErrores({})
            setApiError('')
        }
    }, [open, salida])

    if (!salida) return null

    const destinoRegreso = resolveDestino(salida, destinos, { preferNombre: true })
    const pares = (salida.paresVehiculoConductor || []).map(p => ({ idVehiculo: p.idVehiculo, idConductor: p.idConductor }))

    const handleConfirmar = async () => {
        const e = {
            fechaSalida: validarCampo('fechaSalida', form),
            horaSalida: validarCampo('horaSalida', form),
            fechaLlegadaEstimada: validarCampo('fechaLlegadaEstimada', form),
            horaLlegadaEstimada: validarCampo('horaLlegadaEstimada', form),
        }
        setErrores(e)
        if (e.fechaSalida || e.horaSalida || e.fechaLlegadaEstimada || e.horaLlegadaEstimada) return

        setEnviando(true)
        setApiError('')
        try {
            await onConfirmar(salida, form)
        } catch (err) {
            setApiError(err.message || 'No se pudo actualizar el regreso')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Dialog open={open} onClose={enviando ? undefined : onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography fontWeight={700} fontSize="1.05rem">Editar fecha/hora del regreso</Typography>
                </Box>
                <IconButton size="small" onClick={onClose} disabled={enviando}
                    sx={{ color: theme.palette.neutral.main, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>
                    <CloseOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', borderRadius: 2, backgroundColor: theme.palette.background.subtle }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, flex: 1, minWidth: 200 }}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {salida.origen || 'Tu sede'} → {destinoRegreso}
                        </Typography>
                    </Box>
                    <Box sx={{ width: '1px', backgroundColor: theme.palette.divider, my: 1.5 }} />
                    <Box sx={{ p: 1.5, flex: 1, minWidth: 200 }}>
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 0.5 }}>
                            Convoy (no editable acá)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            {pares.length === 0 ? (
                                <Typography variant="body2" color={theme.palette.text.secondary}>Sin convoy asignado</Typography>
                            ) : (salida.paresVehiculoConductor || []).map((p, i) => (
                                <Typography key={p.idSalidaVehiculoConductor || i} variant="body2" fontWeight={600}>
                                    {p.vehiculo?.placa || 'Vehículo'} · {p.conductor?.usuario ? `${p.conductor.usuario.nombre} ${p.conductor.usuario.apellido}` : 'Conductor'}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 260 }}>
                    <CalendarioDisponibilidad
                        label="Fecha de Salida"
                        required
                        value={form.fechaSalida}
                        onChange={(iso) => {
                            const formActualizado = { ...form, fechaSalida: iso, fechaLlegadaEstimada: '' }
                            setForm(formActualizado)
                            setErrores(prev => ({
                                ...prev,
                                fechaSalida: '',
                                fechaLlegadaEstimada: '',
                                horaSalida: prev.horaSalida ? validarCampo('horaSalida', formActualizado) : '',
                            }))
                            setApiError('')
                        }}
                        pares={pares}
                        idSalidaExcluir={salida.idSalida}
                        esRegreso
                        minDate={hoyISO()}
                        maxDate={maxISO()}
                        error={errores.fechaSalida}
                    />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 260 }}>
                    <CalendarioDisponibilidad
                        modo="llegada"
                        fechaReferencia={form.fechaSalida}
                        label="Fecha Estimada de Llegada"
                        required
                        disabled={!form.fechaSalida}
                        value={form.fechaLlegadaEstimada}
                        onChange={(iso) => {
                            setForm(prev => ({ ...prev, fechaLlegadaEstimada: iso }))
                            setErrores(prev => ({ ...prev, fechaLlegadaEstimada: '' }))
                            setApiError('')
                        }}
                        pares={pares}
                        idSalidaExcluir={salida.idSalida}
                        esRegreso
                        minDate={form.fechaSalida ? sumarDias(form.fechaSalida, MIN_DIAS_SALIDA_LLEGADA) : hoyISO()}
                        maxDate={maxISO()}
                        error={errores.fechaLlegadaEstimada}
                        helperText={!form.fechaSalida ? 'Selecciona primero la fecha de salida' : undefined}
                    />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
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
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <SelectorHora label="Hora Estimada de Llegada"
                            value={form.horaLlegadaEstimada}
                            onChange={(v) => {
                                setForm(prev => ({ ...prev, horaLlegadaEstimada: v }))
                                setErrores(prev => ({ ...prev, horaLlegadaEstimada: '' }))
                                setApiError('')
                            }}
                            onBlur={() => setErrores(prev => ({ ...prev, horaLlegadaEstimada: validarCampo('horaLlegadaEstimada', form) }))}
                            rango={getRangoHorario(form.fechaLlegadaEstimada)}
                            error={errores.horaLlegadaEstimada}
                            helperText={form.fechaLlegadaEstimada ? 'Opcional' : 'Selecciona primero la fecha de llegada'} />
                    </Box>
                </Box>

                {apiError && (
                    <Typography variant="body2" color="error">{apiError}</Typography>
                )}
            </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} disabled={enviando}
                    sx={{ textTransform: 'none', color: theme.palette.neutral.main, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>Cancelar</Button>
                <Button onClick={handleConfirmar} disabled={enviando} variant="contained"
                    startIcon={enviando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
                    sx={{ textTransform: 'none', borderRadius: 2 }}>
                    {enviando ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalEditarHorarioRegresoSede
