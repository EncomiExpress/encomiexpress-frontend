import { alpha } from '@mui/material/styles'
import { Box, Typography, IconButton, Chip, Tooltip, Button } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import { formatFecha } from '../../../shared/utils/formatters.js'
import { formatMoney } from '../utils/anticipoValidation.js'
import AnticipoEstadoDot from '../components/AnticipoEstadoDot.jsx'

const useAnticipoColumns = ({
    theme, getNombreConductor, tienePermiso, PERMISOS,
    onConsultar, onEditar, onToggleHabilitado, onSolicitarConfirmarExcedente,
}) => [
    {
        key: 'conductor', label: 'Conductor', sortField: 'conductor',
        render: (anticipo) => (
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                {getNombreConductor(anticipo)}
            </Typography>
        ),
    },
    {
        key: 'ruta', label: 'Ruta', cellSx: { py: 2.5 },
        render: (anticipo) => (
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }} noWrap>
                {anticipo.ruta ? `${anticipo.ruta.origen || '—'} → ${anticipo.ruta.destino?.ciudad || 'Sin destino'}` : '—'}
            </Typography>
        ),
    },
    {
        key: 'anticipo', label: 'Anticipo', cellSx: { py: 2.5 },
        render: (anticipo) => (
            <Chip
                label={formatMoney(anticipo.valorAnticipo)}
                size="small"
                sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, fontSize: '0.7rem', borderRadius: '2px', height: 24 }}
            />
        ),
    },
    {
        key: 'gastado', label: 'Gastado', cellSx: { py: 2.5 },
        render: (anticipo) => anticipo.valorGastado ? (
            <Chip
                label={`-${formatMoney(anticipo.valorGastado)}`}
                size="small"
                sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark, fontSize: '0.7rem', borderRadius: '2px', height: 24 }}
            />
        ) : (
            <Typography variant="body2" color={theme.palette.text.secondary} fontSize="0.82rem">—</Typography>
        ),
    },
    {
        // Excedente — positivo: a favor de la empresa (verde). Negativo: la empresa
        // le debe reponer al conductor (rojo), sin el "+" fijo.
        key: 'excedente', label: 'Excedente', cellSx: { py: 2.5 },
        render: (anticipo) => {
            if (!anticipo.valorGastado) return <Typography variant="body2" color={theme.palette.text.secondary} fontSize="0.82rem">—</Typography>
            const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
            return (
                <Chip
                    label={excedente < 0 ? formatMoney(excedente) : `+${formatMoney(excedente)}`}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: alpha(excedente < 0 ? theme.palette.error.main : theme.palette.success.main, 0.1), color: excedente < 0 ? theme.palette.error.dark : theme.palette.success.dark, fontSize: '0.7rem', borderRadius: '2px', height: 24 }}
                />
            )
        },
    },
    {
        key: 'fechaEntrega', label: 'F. Entrega', cellSx: { fontSize: '0.8rem', color: theme.palette.text.primary, py: 1.5 },
        render: (anticipo) => formatFecha(anticipo.fechaEntrega),
    },
    {
        key: 'estado', label: 'Estado', cellSx: { py: 1.5, minWidth: 160 },
        render: (anticipo) => {
            const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <AnticipoEstadoDot estado={anticipo.estado} />
                    {anticipo.estado === 'Excedente pendiente' && tienePermiso(PERMISOS.ACTUALIZAR_ANTICIPO) && (
                        <Button size="small" variant="outlined"
                            onClick={() => onSolicitarConfirmarExcedente(anticipo.idAnticipoExcedente, excedente < 0)}
                            sx={excedente < 0
                                ? { fontSize: '0.68rem', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 1, py: 0.2, borderColor: theme.palette.error.main, color: theme.palette.error.main, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08), borderColor: theme.palette.error.main }, lineHeight: 1.4 }
                                : { fontSize: '0.68rem', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 1, py: 0.2, borderColor: '#059669', color: '#059669', '&:hover': { backgroundColor: '#f0fdf4', borderColor: '#059669' }, lineHeight: 1.4 }}>
                            {excedente < 0 ? 'Confirmar reposición' : 'Confirmar devolución'}
                        </Button>
                    )}
                </Box>
            )
        },
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 2.5 },
        render: (anticipo) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_ANTICIPO) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(anticipo)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_ANTICIPO) && (
                    anticipo.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : ['En Legalización', 'Excedente pendiente', 'Completado'].includes(anticipo.estado) ? (
                        <Tooltip title={anticipo.estado === 'En Legalización'
                            ? 'La ruta ya está en curso: el conductor legaliza este anticipo desde la app móvil'
                            : anticipo.estado === 'Excedente pendiente'
                                ? 'Este anticipo ya está legalizado: no se puede editar'
                                : 'Este anticipo ya está completado: no se puede editar'}>
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small"
                                onClick={() => onEditar(anticipo)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_ANTICIPO) && (
                    <ToggleSwitch id={anticipo.idAnticipoExcedente} checked={anticipo.habilitado !== false} onChange={() => onToggleHabilitado(anticipo)} />
                )}
            </Box>
        ),
    },
]

export default useAnticipoColumns
