import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, CircularProgress } from '@mui/material'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as ventaService from '../../ventas/services/ventaService.js'
import * as anticipoService from '../../anticipos/services/anticipoService.js'
import ConfirmToggleDialog from '../../../shared/components/ConfirmToggleDialog.jsx'
import VentasConflictoTable from './VentasConflictoTable.jsx'
import AnticiposConflictoList from './AnticiposConflictoList.jsx'

const ESTADOS_BLOQUEO_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente']

const ModalInhabilitarRuta = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [deps, setDeps] = useState({ ventas: [], anticipos: [], loading: false })

    useEffect(() => {
        if (!open || !data?.idRuta || !data?.habilitadoActual) {
            return
        }
        setDeps({ ventas: [], anticipos: [], loading: true })
        Promise.all([
            ventaService.getEncomiendas(undefined, { idRuta: data.idRuta, habilitado: 'true', limit: 100 }),
            anticipoService.getAnticipos(undefined, { idRuta: data.idRuta, habilitado: 'true', limit: 100 }),
        ])
            .then(([ventRes, antRes]) => {
                const ventas = (ventRes?.data || []).filter(v => v.estado !== 'Entregada' && v.estado !== 'Completada con novedades' && v.estado !== 'Cancelada')
                const anticipos = (antRes?.data || []).filter(a => ESTADOS_BLOQUEO_ANTICIPO.includes(a.estado))
                setDeps({ ventas, anticipos, loading: false })
            })
            .catch(() => setDeps({ ventas: [], anticipos: [], loading: false }))
    }, [open, data?.idRuta, data?.habilitadoActual])

    const handleExited = () => {
        setDeps({ ventas: [], anticipos: [], loading: false })
        onExited?.()
    }

    const enCurso = data?.habilitadoActual && data?.estadoRuta === 'En Ruta'
    const nVentas = deps.ventas.length
    const hayAnticipo = deps.anticipos.length > 0
    const bloqueado = data?.habilitadoActual && (enCurso || nVentas > 0 || hayAnticipo)
    const cargando = data?.habilitadoActual && deps.loading

    const nombre = data?.origen || `#${data?.idRuta}`

    const titulo = !data?.habilitadoActual
        ? '¿Habilitar ruta?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : cargando
                ? 'Inhabilitar ruta'
                : '¿Inhabilitar ruta?'

    const subtexto = !data?.habilitadoActual
        ? <>La ruta <strong>{nombre}</strong> volverá a estar activa en el sistema.</>
        : enCurso
            ? <>La ruta <strong>{nombre}</strong> está en curso. Complétala o cancélala antes de inhabilitarla.</>
            : nVentas > 0 && hayAnticipo
                ? <>No es posible inhabilitar la ruta <strong>{nombre}</strong> mientras tenga ventas activas y un anticipo activo.</>
                : nVentas > 0
                    ? <>No es posible inhabilitar la ruta <strong>{nombre}</strong> mientras tenga {nVentas === 1 ? 'una venta activa' : 'ventas activas'}.</>
                    : hayAnticipo
                        ? <>No es posible inhabilitar la ruta <strong>{nombre}</strong> mientras tenga un anticipo activo.</>
                        : <>La ruta <strong>{nombre}</strong> quedará inhabilitada en el sistema.</>

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

export default ModalInhabilitarRuta
