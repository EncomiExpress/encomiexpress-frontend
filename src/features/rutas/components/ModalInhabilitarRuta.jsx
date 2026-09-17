import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as salidaService from '../../salidas/services/salidaService.js'
import { getEstadoColorRuta } from '../../../shared/utils/estadoColors.js'
import { buildSalidaHighlightUrl } from '../../../shared/utils/salidaLinks.js'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'

// Adaptado tal cual de vehiculos/components/ModalInhabilitarVehiculo.jsx (mismo
// patrón: chequeo previo de salidas activas, mini tabla clicable en vez de
// dejar que el 400 del backend llegue como un toast plano).
const SalidasMiniTabla = ({ salidas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mt: 1.5, width: '100%' }}>
        <TableContainer sx={{ maxHeight: 140 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {salidas.map(s => {
                        const { color } = getEstadoColorRuta(s.estado)
                        const esProgramada = s.estado === 'Programada'
                        return (
                            <TableRow key={s.idSalida}
                                onClick={() => window.open(buildSalidaHighlightUrl(s), '_blank')}
                                sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                    {s.fechaSalida ? new Date(s.fechaSalida + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : `#${s.idSalida}`}
                                </TableCell>
                                <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: esProgramada ? 'transparent' : color, border: `2px solid ${color}` }} />
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{s.estado}</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)

// El backend (rutaService.toggleHabilitado) rechaza (400) inhabilitar una
// plantilla que todavía tiene alguna SalidaProgramada Programada/En Ruta -- acá
// se pre-chequea esa lista (una consulta liviana a /salidas?idRuta=...) para
// avisar de entrada, con el detalle de cuáles, en vez de dejar que el 400 del
// backend llegue como un toast plano recién al confirmar.
const ModalInhabilitarRuta = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [salidasBloqueo, setSalidasBloqueo] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.id || !data.habilitadoActual) return
        const cargarSalidasActivas = () => {
            setSalidasBloqueo({ data: [], loading: true })
            salidaService.getSalidas({ idRuta: data.id, habilitado: 'true', limit: 100 })
                .then(res => {
                    const activas = (res?.data || []).filter(s => s.estado === 'Programada' || s.estado === 'En Ruta')
                    setSalidasBloqueo({ data: activas, loading: false })
                })
                .catch(() => setSalidasBloqueo({ data: [], loading: false }))
        }
        cargarSalidasActivas()
    }, [open, data.id, data.habilitadoActual])

    const handleExited = () => {
        setSalidasBloqueo({ data: [], loading: false })
        onExited?.()
    }

    const cargando = data.habilitadoActual && salidasBloqueo.loading
    const bloqueado = data.habilitadoActual && !cargando && salidasBloqueo.data.length > 0

    let titulo
    let subtitulo
    let children = null

    if (!data.habilitadoActual) {
        titulo = '¿Habilitar ruta?'
        subtitulo = <>La plantilla <strong>{data.etiqueta}</strong> volverá a estar disponible para programar salidas.</>
    } else if (cargando) {
        titulo = '¿Inhabilitar ruta?'
        subtitulo = ''
        children = (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
            </Box>
        )
    } else if (bloqueado) {
        const n = salidasBloqueo.data.length
        titulo = 'No se puede inhabilitar'
        subtitulo = <>No es posible inhabilitar la plantilla <strong>{data.etiqueta}</strong> mientras tenga {n === 1 ? 'una salida programada o en curso' : 'salidas programadas o en curso'}.</>
        children = (
            <Box sx={{ mt: 0.5, width: '100%', textAlign: 'left' }}>
                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 0.5 }}>
                    {n === 1 ? 'Salida activa que impide la inhabilitación' : 'Salidas activas que impiden la inhabilitación'}
                </Typography>
                <SalidasMiniTabla salidas={salidasBloqueo.data} theme={theme} />
            </Box>
        )
    } else {
        titulo = '¿Inhabilitar ruta?'
        subtitulo = <>La plantilla <strong>{data.etiqueta}</strong> quedará inhabilitada y no podrá elegirse para programar nuevas salidas.</>
    }

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={handleExited}
            onConfirm={onConfirm}
            icono={data.habilitadoActual
                ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.warning.dark }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.success.dark }} />}
            variante={data.habilitadoActual ? 'warning' : 'success'}
            titulo={titulo}
            subtitulo={subtitulo}
            soloCerrar={bloqueado}
            textoConfirmar={data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
            deshabilitarConfirmar={cargando}
        >
            {children}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarRuta
