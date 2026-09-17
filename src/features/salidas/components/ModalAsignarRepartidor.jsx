import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import {
    Box, Typography, Dialog, DialogTitle, DialogContent, IconButton, Button, CircularProgress,
    TextField, Autocomplete, Tooltip, Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'
import { formFieldStyles } from '../../../shared/utils/formStyles.js'
import { vehiculoDocumentosVigentes, conductorLicenciaVigente } from '../../../shared/utils/vigenciaDocumentos.js'
import { getErrorMessage } from '../../../shared/utils/errorMessage.js'
import { useSalidaProgramacion } from '../context/SalidaProgramacionContext.jsx'
import { useVehiculo } from '../../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { resolvePares } from '../utils/salidaResolvers.js'
import { MAX_PARES } from '../validations/salidaValidation.js'

// Acción rápida de la lista de Salidas: agrega o quita UN vehículo+conductor del
// convoy de una salida YA EXISTENTE, sin abrir el wizard completo de edición --
// útil tanto para sumar un repartidor más (ej. llegaron más paquetes de los que
// cabían en el vehículo original) como para soltar uno que hace falta en otra
// salida. Reusa PUT /salidas/:id mandando la lista COMPLETA de pares que deben
// quedar activos, no un "agregar/quitar" (ver update() en
// salidaProgramadaService.js) -- cada acción (agregar uno, quitar uno) se manda
// por separado y cierra el modal al terminar, igual que el resto de acciones
// rápidas de la app.
const ModalAsignarRepartidor = ({ open, salida, onClose, onSuccess }) => {
    const theme = useTheme()
    const { actualizarSalidaProgramada } = useSalidaProgramacion()
    const { getVehiculosHabilitados, getVehiculos } = useVehiculo()
    const { getConductoresHabilitados, getConductores } = useConductor()
    const { showToast } = useToast()

    const [idVehiculo, setIdVehiculo] = useState('')
    const [idConductor, setIdConductor] = useState('')
    const [vehiculoInput, setVehiculoInput] = useState('')
    const [conductorInput, setConductorInput] = useState('')
    const [error, setError] = useState('')
    const [apiError, setApiError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    // Par elegido para quitar del convoy -- separado del flujo de agregar, con su
    // propia confirmación (ConfirmToggleDialog) porque es una acción distinta y
    // ya guardada (no un campo del formulario de abajo).
    const [parAQuitar, setParAQuitar] = useState(null)
    const [errorQuitar, setErrorQuitar] = useState(null)

    useEffect(() => {
        if (!open) return
        setIdVehiculo(''); setIdConductor('')
        setVehiculoInput(''); setConductorInput('')
        setError(''); setApiError(null)
        setParAQuitar(null); setErrorQuitar(null)
    }, [open])

    if (!salida) return null

    const paresActuales = salida.paresVehiculoConductor || []
    const paresActivos = paresActuales.filter(p => p.habilitado !== false)
    const yaAlTope = paresActivos.length >= MAX_PARES
    // Datos listos para mostrar (placa, marca/modelo, nombre del conductor) --
    // mismo helper que ya usa ModalConsultarSalidaProgramada.jsx para esto mismo.
    const paresParaMostrar = resolvePares({ ...salida, paresVehiculoConductor: paresActivos }, { getVehiculos, getConductores })

    // Mismo criterio de "quién se puede asignar" que el wizard completo
    // (PasoConvoy/ActualizarSalidaProgramada): documentos vigentes, y ningún
    // conductor/vehículo ya usado en OTRO par de esta misma salida. Un regreso
    // nunca llega hasta acá (el botón que abre este modal no se muestra para
    // regresos, hereda el convoy de la ida).
    const idsVehiculoUsados = new Set(paresActivos.map(p => p.idVehiculo))
    const idsConductorUsados = new Set(paresActivos.map(p => p.idConductor))
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
                ...paresActivos.map(p => ({
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

    // El backend rechaza (400) quitar un par que ya tiene paquetes asignados en
    // esta salida -- ese error se muestra dentro del propio diálogo de
    // confirmación en vez de cerrarlo, para que quede claro por qué no se pudo.
    const handleConfirmarQuitar = async () => {
        setErrorQuitar(null)
        try {
            const paresParaEnviar = paresActivos
                .filter(p => p.idSalidaVehiculoConductor !== parAQuitar.idSalidaVehiculoConductor)
                .map(p => ({
                    idSalidaVehiculoConductor: p.idSalidaVehiculoConductor,
                    idVehiculo: p.idVehiculo,
                    idConductor: p.idConductor,
                }))
            const { message } = await actualizarSalidaProgramada({ idSalida: salida.idSalida, pares: paresParaEnviar })
            showToast(message || 'Vehículo y conductor quitados del convoy', 'success')
            onSuccess?.()
            onClose?.()
        } catch (err) {
            setErrorQuitar(getErrorMessage(err, 'No se pudo quitar del convoy'))
            throw err
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Gestionar Convoy</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5 }}>
                        Agrega o quita vehículos y conductores del convoy de esta salida.
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {paresParaMostrar.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                                Convoy actual
                            </Typography>
                            {paresParaMostrar.map((par) => (
                                <Box key={par.idSalidaVehiculoConductor} sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
                                    p: 1.25, borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                        <PlacaDisplay placa={par.placa} theme={theme} />
                                        <Typography variant="body2" fontWeight={500} noWrap>{par.conductorNombre}</Typography>
                                    </Box>
                                    <Tooltip title={paresParaMostrar.length === 1
                                        ? 'La salida debe tener al menos un vehículo y conductor'
                                        : 'Quitar del convoy'}>
                                        <span>
                                            <IconButton size="small" disabled={paresParaMostrar.length === 1}
                                                onClick={() => setParAQuitar(par)}
                                                sx={{ color: theme.palette.error.main, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08) } }}>
                                                <PersonRemoveOutlinedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            ))}
                            <Divider sx={{ my: 0.5 }} />
                        </Box>
                    )}
                    <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                        Agregar al convoy
                    </Typography>
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

            <ConfirmToggleDialog
                open={!!parAQuitar}
                onClose={() => setParAQuitar(null)}
                onConfirm={handleConfirmarQuitar}
                icono={<PersonRemoveOutlinedIcon sx={{ fontSize: 32, color: theme.palette.primary.darker }} />}
                titulo="¿Quitar del convoy?"
                subtitulo={`${parAQuitar?.placa || ''} — ${parAQuitar?.conductorNombre || ''} se quitará del convoy de esta salida. Podrás asignarlo a otra ruta después.`}
                textoConfirmar="Quitar"
            >
                {errorQuitar && (
                    <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>{errorQuitar}</Typography>
                )}
            </ConfirmToggleDialog>
        </Dialog>
    )
}

export default ModalAsignarRepartidor
