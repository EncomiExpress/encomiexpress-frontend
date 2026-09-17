import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import {
    Box, Typography, Dialog, DialogTitle, DialogContent, IconButton, Button, CircularProgress,
    TextField, Autocomplete,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import { formFieldStyles } from '../../../shared/utils/formStyles.js'
import { vehiculoDocumentosVigentes, conductorLicenciaVigente } from '../../../shared/utils/vigenciaDocumentos.js'
import { getErrorMessage } from '../../../shared/utils/errorMessage.js'
import { useSalidaProgramacion } from '../context/SalidaProgramacionContext.jsx'
import { useVehiculo } from '../../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { MAX_PARES } from '../validations/salidaValidation.js'

// Acción rápida de la lista de Salidas: agrega UN vehículo+conductor al convoy de
// una salida YA EXISTENTE, sin abrir el wizard completo de edición -- útil cuando
// la salida ya está armada y solo falta sumar un repartidor más (ej. llegaron más
// paquetes de los que cabían en el vehículo original). Reusa PUT /salidas/:id
// mandando el par nuevo agregado a los que ya existen (el endpoint espera la lista
// COMPLETA de pares, no un "agregar" -- ver update() en salidaProgramadaService.js).
const ModalAsignarRepartidor = ({ open, salida, onClose, onSuccess }) => {
    const theme = useTheme()
    const { actualizarSalidaProgramada } = useSalidaProgramacion()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { showToast } = useToast()

    const [idVehiculo, setIdVehiculo] = useState('')
    const [idConductor, setIdConductor] = useState('')
    const [vehiculoInput, setVehiculoInput] = useState('')
    const [conductorInput, setConductorInput] = useState('')
    const [error, setError] = useState('')
    const [apiError, setApiError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        setIdVehiculo(''); setIdConductor('')
        setVehiculoInput(''); setConductorInput('')
        setError(''); setApiError(null)
    }, [open])

    if (!salida) return null

    const paresActuales = salida.paresVehiculoConductor || []
    const yaAlTope = paresActuales.filter(p => p.habilitado !== false).length >= MAX_PARES

    // Mismo criterio de "quién se puede asignar" que el wizard completo
    // (PasoConvoy/ActualizarSalidaProgramada): documentos vigentes, y ningún
    // conductor/vehículo ya usado en OTRO par de esta misma salida. Un regreso
    // nunca llega hasta acá (el botón que abre este modal no se muestra para
    // regresos, hereda el convoy de la ida).
    const idsVehiculoUsados = new Set(paresActuales.filter(p => p.habilitado !== false).map(p => p.idVehiculo))
    const idsConductorUsados = new Set(paresActuales.filter(p => p.habilitado !== false).map(p => p.idConductor))
    const vehiculos = getVehiculosHabilitados().filter(v => vehiculoDocumentosVigentes(v) && !idsVehiculoUsados.has(v.idVehiculo)
        && (v.idDestinoActual === null || v.idDestinoActual === undefined))
    const conductores = getConductoresHabilitados().filter(c => conductorLicenciaVigente(c.categoriasLicencia) && !idsConductorUsados.has(c.idConductor)
        && (c.idDestinoActual === null || c.idDestinoActual === undefined))

    const handleSubmit = async () => {
        if (!idVehiculo || !idConductor) {
            setError('Elige un vehículo y un conductor')
            return
        }
        setError('')
        setApiError(null)
        setSubmitting(true)
        try {
            const paresParaEnviar = [
                ...paresActuales.filter(p => p.habilitado !== false).map(p => ({
                    idSalidaVehiculoConductor: p.idSalidaVehiculoConductor,
                    idVehiculo: p.idVehiculo,
                    idConductor: p.idConductor,
                })),
                {
                    idVehiculo: parseInt(idVehiculo),
                    idConductor: parseInt(idConductor),
                },
            ]
            const { message } = await actualizarSalidaProgramada({ idSalida: salida.idSalida, pares: paresParaEnviar })
            showToast(message || 'Repartidor asignado correctamente', 'success')
            onSuccess?.()
            onClose?.()
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al asignar el repartidor'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Asignar Conductor</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5 }}>
                        Suma un vehículo y conductor más al convoy de esta salida.
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {apiError && (
                        <Typography variant="body2" color="error">{apiError}</Typography>
                    )}
                    {yaAlTope ? (
                        <Typography variant="body2" color="error">
                            Esta salida ya tiene el máximo de {MAX_PARES} vehículos permitidos.
                        </Typography>
                    ) : (
                        <>
                        <Autocomplete
                            options={vehiculos}
                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                            getOptionLabel={(v) => `${v.placa} — ${v.marca} ${v.modelo}`}
                            isOptionEqualToValue={(opt, val) => opt.idVehiculo === val.idVehiculo}
                            value={vehiculos.find(v => v.idVehiculo === parseInt(idVehiculo)) || null}
                            inputValue={vehiculoInput}
                            onInputChange={(_, val, reason) => setVehiculoInput(reason === 'input' ? val.replace(/[^a-zA-Z0-9\s\-_]/g, '') : val)}
                            onChange={(_, val) => { setIdVehiculo(val ? val.idVehiculo : ''); setError('') }}
                            renderOption={(props, v) => {
                                const { key, ...rest } = props
                                return (
                                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <PlacaDisplay placa={v.placa} theme={theme} />
                                        <Typography variant="body2" noWrap>{v.marca} {v.modelo}</Typography>
                                    </Box>
                                )
                            }}
                            noOptionsText="No hay vehículos disponibles"
                            renderInput={(params) => (
                                <TextField {...params} label="Vehículo *" error={!!error && !idVehiculo}
                                    slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles} />
                            )}
                        />
                        <Autocomplete
                            options={conductores}
                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                            getOptionLabel={(c) => `${c.nombre} ${c.apellido}`}
                            isOptionEqualToValue={(opt, val) => opt.idConductor === val.idConductor}
                            value={conductores.find(c => c.idConductor === parseInt(idConductor)) || null}
                            inputValue={conductorInput}
                            onInputChange={(_, val, reason) => setConductorInput(reason === 'input' ? val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, '') : val)}
                            onChange={(_, val) => { setIdConductor(val ? val.idConductor : ''); setError('') }}
                            noOptionsText="No hay conductores disponibles"
                            renderInput={(params) => (
                                <TextField {...params} label="Conductor *" error={!!error && !idConductor}
                                    slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles} />
                            )}
                        />
                        {error && <Typography variant="caption" color="error">{error}</Typography>}
                        </>
                    )}
                </Box>
            </DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 3, py: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', color: theme.palette.text.secondary }}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting || yaAlTope}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckOutlinedIcon />}
                    sx={{
                        textTransform: 'none', borderRadius: 2, fontWeight: 600,
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}>
                    Asignar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalAsignarRepartidor
