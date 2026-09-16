import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Typography, Paper, TextField } from '@mui/material'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { getAnticipoEstadoDot, getRutaEstadoDot } from '../../../shared/utils/estadoColors'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'
import { formFieldStyles } from '../../../shared/utils/formStyles.js'
import { buildSalidaHighlightUrl } from '../../../shared/utils/salidaLinks.js'

const MOTIVO_MAX_LENGTH = 500

const renderDot = (dot) => {
    if (dot.type === 'circle') {
        return (
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
        )
    }
    return (
        <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>
            {dot.char}
        </Box>
    )
}

const getRutaLabel = (ruta) => {
    if (!ruta) return '—'
    const placa = ruta.vehiculo?.placa
    const base = ruta.origen ? `${ruta.origen} → ${ruta.ruta?.destino?.municipio || 'Sin destino'}` : '—'
    return placa ? `${base} · ${placa}` : base
}

// "Cerrar sin haberse entregado" (2026-09-13, ver LOGICA.md "Cerrar un anticipo que
// nunca se llegó a entregar") vive fusionado en este mismo modal, no en un botón/modal
// aparte -- decisión de la usuaria: un solo botón ("Inhabilitar"), no dos. Si el
// anticipo no está Completado/Cerrado, no es huérfano, y todavía no hay un
// `valorGastado` real reportado (Entregado/En Legalización), inhabilitar exige un
// motivo obligatorio y cierra el anticipo como "Cerrado sin entregar" en el mismo
// golpe. "Excedente pendiente" sigue bloqueado del todo -- ahí sí hubo plata real de
// por medio (el conductor ya reportó gasto), eso se resuelve por "Confirmar
// devolución/reposición" primero, no por acá.
const ModalInhabilitarAnticipo = ({ open, anticipo, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [motivo, setMotivo] = useState('')

    const habilitadoActual = anticipo?.habilitado === true
    const yaCerrado = ['Completado', 'Cerrado sin entregar'].includes(anticipo?.estado)
    const puedeCerrarSinEntregar = ['Entregado', 'En Legalización'].includes(anticipo?.estado)
    // Huérfano (ver LOGICA.md, "Anticipos huérfanos al reasignar conductor"): el
    // conductor de este anticipo ya no es par activo de su ruta, así que nada del flujo
    // normal (legalizar desde el móvil, cerrar la ruta) va a llegar a completarlo nunca
    // — se deja inhabilitar sin exigir motivo ni "Completado".
    const necesitaMotivo = habilitadoActual && !yaCerrado && !anticipo?.esHuerfano && puedeCerrarSinEntregar
    const bloqueadoDuro = habilitadoActual && !yaCerrado && !anticipo?.esHuerfano && !puedeCerrarSinEntregar
    const ruta = anticipo?.salida || null

    const nombreConductor = anticipo?.conductor?.usuario
        ? `${anticipo.conductor.usuario.nombre} ${anticipo.conductor.usuario.apellido}`
        : 'el conductor'

    const titulo = !habilitadoActual
        ? '¿Habilitar anticipo?'
        : bloqueadoDuro
            ? 'No se puede inhabilitar'
            : '¿Inhabilitar anticipo?'

    const subtexto = !habilitadoActual
        ? <>El anticipo de <strong>{nombreConductor}</strong> volverá a estar activo.</>
        : bloqueadoDuro
            ? (parseFloat(anticipo.excedente) < 0
                ? <>Hay un faltante pendiente de reponerle al conductor.</>
                : <>El conductor tiene un excedente pendiente de devolución.</>)
            : necesitaMotivo
                ? <>Este anticipo no ha sido completado. Para inhabilitarlo, confirma que <strong>{nombreConductor}</strong> nunca recibió esta plata.</>
                : <>El anticipo de <strong>{nombreConductor}</strong> quedará inhabilitado.</>

    const rutaLabel = bloqueadoDuro && ruta ? 'La ruta en curso que impide la inhabilitación' : null

    const motivoValido = motivo.trim().length > 0

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            // Limpia el motivo recién cuando termina la animación de salida (evita un
            // setState síncrono dentro de un efecto) — y deja pasar el `onExited` real,
            // que es el que de verdad dispara el toggle en el padre.
            onExited={() => { setMotivo(''); onExited?.() }}
            onConfirm={() => onConfirm(necesitaMotivo ? motivo.trim() : undefined)}
            icono={habilitadoActual
                ? <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={titulo}
            subtitulo={subtexto}
            soloCerrar={bloqueadoDuro}
            confirmarInvalido={necesitaMotivo && !motivoValido}
            textoConfirmar={habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
        >
            {bloqueadoDuro && (
                <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                    {ruta ? (() => {
                        const dot = getRutaEstadoDot(ruta.estado)
                        return (
                            <>
                                {rutaLabel && (
                                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                        {rutaLabel}
                                    </Typography>
                                )}
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <Box
                                        onClick={() => window.open(buildSalidaHighlightUrl(ruta), '_blank')}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                                    >
                                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                            {getRutaLabel(ruta)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {renderDot(dot)}
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>
                                                {dot.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </>
                        )
                    })() : (() => {
                        const dot = getAnticipoEstadoDot(anticipo.estado)
                        return (
                            <>
                                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                    Estado actual del anticipo
                                </Typography>
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
                                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                            {nombreConductor}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {renderDot(dot)}
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>
                                                {dot.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </>
                        )
                    })()}
                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mt: 1, display: 'block' }}>
                        Este anticipo tiene un excedente/faltante pendiente — resuélvelo primero con "Confirmar devolución/reposición".
                    </Typography>
                </Box>
            )}
            {necesitaMotivo && (
                <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={3}
                        label="Motivo"
                        required
                        placeholder="Ej: se registró por error, el conductor nunca recibió el efectivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value.slice(0, MOTIVO_MAX_LENGTH))}
                        helperText={`Obligatorio · ${motivo.length}/${MOTIVO_MAX_LENGTH}`}
                        sx={formFieldStyles}
                    />
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarAnticipo
