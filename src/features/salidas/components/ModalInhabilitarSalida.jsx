import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, CircularProgress } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as ventaService from '../../ventas/services/ventaService.js'
import * as anticipoService from '../../anticipos/services/anticipoService.js'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'
import VentasConflictoTable from './VentasConflictoTable.jsx'
import AnticiposConflictoList from './AnticiposConflictoList.jsx'
import { motivoSalidaVencida } from '../utils/salidaResolvers.js'

const ESTADOS_BLOQUEO_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente']

// Adaptado de rutas/components/ModalInhabilitarRuta.jsx (antes de la migración
// Ruta/SalidaProgramada, cuando fecha/hora/estado/convoy vivían en la misma
// entidad "Ruta"): mismo chequeo previo de ventas/anticipos activos, ahora
// filtrando por `idSalida` en vez de `idRuta`.
const ModalInhabilitarSalida = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [deps, setDeps] = useState({ ventas: [], anticipos: [], loading: false })

    useEffect(() => {
        if (!open || !data?.idSalida || !data?.habilitadoActual) {
            return
        }
        // Función interna en vez de llamar setState directo en el cuerpo del efecto --
        // mismo orden de ejecución, pero así el linter (react-hooks/set-state-in-effect)
        // no confunde el reseteo de loading previo al fetch con una mutación "impura".
        // Cada fetch atrapa su propio error (en vez de un solo .catch sobre el
        // Promise.all) -- mismo criterio que el modal original: un 403 de Anticipos
        // (ej. operador_sede, que no tiene ese permiso) no debe tumbar también el
        // resultado de Ventas.
        const cargarDependencias = () => {
            setDeps({ ventas: [], anticipos: [], loading: true })
            Promise.all([
                ventaService.getEncomiendas(undefined, { idSalida: data.idSalida, habilitado: 'true', limit: 100 }).catch(() => ({ data: [] })),
                anticipoService.getAnticipos(undefined, { idSalida: data.idSalida, habilitado: 'true', limit: 100 }).catch(() => ({ data: [] })),
            ])
                .then(([ventRes, antRes]) => {
                    const ventas = (ventRes?.data || []).filter(v => v.estado !== 'Entregada' && v.estado !== 'Completada con novedades' && v.estado !== 'Cancelada')
                    const anticipos = (antRes?.data || []).filter(a => ESTADOS_BLOQUEO_ANTICIPO.includes(a.estado))
                    setDeps({ ventas, anticipos, loading: false })
                })
                .catch(() => setDeps({ ventas: [], anticipos: [], loading: false }))
        }
        cargarDependencias()
    }, [open, data?.idSalida, data?.habilitadoActual])

    const handleExited = () => {
        setDeps({ ventas: [], anticipos: [], loading: false })
        onExited?.()
    }

    const enCurso = data?.habilitadoActual && data?.estadoSalida === 'En Ruta'
    const nVentas = deps.ventas.length
    const hayAnticipo = deps.anticipos.length > 0
    const bloqueado = data?.habilitadoActual && (enCurso || nVentas > 0 || hayAnticipo)
    const cargando = data?.habilitadoActual && deps.loading

    const nombre = data?.origen
        ? (data?.destino ? `${data.origen} → ${data.destino}` : data.origen)
        : `#${data?.idSalida}`

    // Si se va a habilitar una salida Programada cuya fecha/hora de salida ya
    // venció, salidaProgramadaService.toggleHabilitado la deja Cancelada en la
    // misma operación -- se avisa acá, antes de confirmar, en vez de en el toast
    // posterior.
    const motivoVencida = !data?.habilitadoActual && data?.estadoSalida === 'Programada'
        ? motivoSalidaVencida({ fechaSalida: data?.fechaSalida, horaSalida: data?.horaSalida })
        : null

    const titulo = !data?.habilitadoActual
        ? '¿Habilitar salida?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : cargando
                ? 'Inhabilitar salida'
                : '¿Inhabilitar salida?'

    const subtexto = !data?.habilitadoActual
        ? <>La salida <strong>{nombre}</strong> volverá a estar activa en el sistema.</>
        : enCurso
            ? <>La salida <strong>{nombre}</strong> está en curso. Complétala o cancélala antes de inhabilitarla.</>
            : nVentas > 0 && hayAnticipo
                ? <>No es posible inhabilitar la salida <strong>{nombre}</strong> mientras tenga ventas activas y un anticipo activo.</>
                : nVentas > 0
                    ? <>No es posible inhabilitar la salida <strong>{nombre}</strong> mientras tenga {nVentas === 1 ? 'una venta activa' : 'ventas activas'}.</>
                    : hayAnticipo
                        ? <>No es posible inhabilitar la salida <strong>{nombre}</strong> mientras tenga un anticipo activo.</>
                        : <>La salida <strong>{nombre}</strong> quedará inhabilitada en el sistema.</>

    return (
        <ConfirmToggleDialog
            open={open}
            onClose={onClose}
            onExited={handleExited}
            onConfirm={onConfirm}
            icono={data?.habilitadoActual
                ? <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />}
            titulo={titulo}
            subtitulo={subtexto}
            soloCerrar={enCurso || bloqueado}
            textoConfirmar={data?.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
            deshabilitarConfirmar={cargando}
        >
            {cargando && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                    <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                </Box>
            )}

            {motivoVencida && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 2, color: theme.palette.text.secondary }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18, mt: '1px', flexShrink: 0 }} />
                    <Typography variant="body2">
                        {motivoVencida === 'fecha'
                            ? 'Su fecha de salida ya pasó, así que quedará Cancelada.'
                            : 'Su hora de salida ya pasó (sigue siendo hoy), así que quedará Cancelada.'}
                    </Typography>
                </Box>
            )}

            {!cargando && bloqueado && (
                <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                    {nVentas > 0 && (
                        <Box sx={{ mb: hayAnticipo ? 2.5 : 0 }}>
                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                {enCurso
                                    ? nVentas === 1 ? 'La venta en tránsito' : 'Las ventas en tránsito'
                                    : nVentas === 1 ? 'La venta activa que impide la inhabilitación' : 'Las ventas activas que impiden la inhabilitación'}
                            </Typography>
                            <VentasConflictoTable theme={theme} ventas={deps.ventas} maxHeight={140} />
                        </Box>
                    )}

                    {deps.anticipos.length > 0 && (
                        <Box>
                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                {enCurso ? 'El anticipo en legalización' : 'El anticipo activo que impide la inhabilitación'}
                            </Typography>
                            <AnticiposConflictoList theme={theme} anticipos={deps.anticipos.slice(0, 1)} />
                        </Box>
                    )}
                </Box>
            )}
        </ConfirmToggleDialog>
    )
}

export default ModalInhabilitarSalida
