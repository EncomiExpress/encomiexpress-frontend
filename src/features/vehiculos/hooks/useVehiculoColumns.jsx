import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ToggleSwitch from '../../../shared/components/ToggleSwitch.jsx'
import PlacaDisplay from '../../../shared/components/PlacaDisplay.jsx'
import { isVencido, formatFecha, capitalizarPrimeraLetra } from '../../../shared/utils/formatters.js'

const vencimientoChipSx = (theme, vencido) => vencido
    ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
    : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }

const useVehiculoColumns = ({ theme, tienePermiso, PERMISOS, onConsultar, onEditar, onToggleHabilitado, onAbrirMenuEstado }) => [
    { key: 'placa', label: 'Placa', sortField: 'placa', render: (transporte) => <PlacaDisplay placa={transporte.placa} theme={theme} /> },
    {
        key: 'marcaModelo', label: 'Marca / Modelo', cellSx: { py: 1.5 },
        render: (transporte) => (
            <>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                    {capitalizarPrimeraLetra(transporte.marca)}
                </Typography>
                <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                    {transporte.modelo}
                </Typography>
            </>
        ),
    },
    {
        key: 'tipo', label: 'Tipo', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip label={transporte.tipo || '—'} size="small" sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }} />
        ),
    },
    {
        key: 'propietario', label: 'Propietario', cellSx: { py: 1.5 },
        render: (transporte) => transporte.propietario ? `${transporte.propietario.nombre} ${transporte.propietario.apellido}` : '—',
    },
    {
        key: 'soat', label: 'SOAT', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip
                label={transporte.vencimientoSOAT ? formatFecha(transporte.vencimientoSOAT) : 'N/A'}
                size="small"
                variant={isVencido(transporte.vencimientoSOAT) ? 'filled' : 'outlined'}
                sx={vencimientoChipSx(theme, isVencido(transporte.vencimientoSOAT))}
            />
        ),
    },
    {
        key: 'revTecnica', label: 'Rev. Técnica', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip
                label={transporte.vencimientoRevisionTecnica ? formatFecha(transporte.vencimientoRevisionTecnica) : 'N/A'}
                size="small"
                variant={isVencido(transporte.vencimientoRevisionTecnica) ? 'filled' : 'outlined'}
                sx={vencimientoChipSx(theme, isVencido(transporte.vencimientoRevisionTecnica))}
            />
        ),
    },
    {
        key: 'segTerceros', label: 'Seg. Terceros', cellSx: { py: 1.5 },
        render: (transporte) => (
            <Chip
                label={transporte.vencimientoSeguroTerceros ? formatFecha(transporte.vencimientoSeguroTerceros) : 'N/A'}
                size="small"
                variant={isVencido(transporte.vencimientoSeguroTerceros) ? 'filled' : 'outlined'}
                sx={vencimientoChipSx(theme, isVencido(transporte.vencimientoSeguroTerceros))}
            />
        ),
    },
    {
        key: 'estado', label: 'Estado', cellSx: { py: 1.5 },
        render: (transporte) => (
            transporte.estadoEfectivo === 'En Ruta' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#3B82F6' }}>En Ruta</Typography>
                </Box>
            ) : (
                <Box
                    onClick={(e) => onAbrirMenuEstado(e.currentTarget, transporte.idVehiculo, transporte.estadoEfectivo)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
                >
                    <Box sx={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        ...(transporte.estadoEfectivo === 'Disponible'
                            ? { backgroundColor: 'transparent', border: '2px solid #10b981' }
                            : { backgroundColor: '#ea580c', border: '2px solid #ea580c' })
                    }} />
                    <Typography variant="body2" sx={{
                        fontSize: '0.82rem', fontWeight: 500,
                        color: transporte.estadoEfectivo === 'Disponible' ? '#10b981' : '#ea580c',
                    }}>
                        {transporte.estadoEfectivo}
                    </Typography>
                    <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
                </Box>
            )
        ),
    },
    {
        key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
        render: (transporte) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tienePermiso(PERMISOS.CONSULTAR_VEHICULO) && (
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onConsultar(transporte)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {tienePermiso(PERMISOS.ACTUALIZAR_VEHICULO) && (
                    transporte.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onEditar(transporte)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                {tienePermiso(PERMISOS.INHABILITAR_VEHICULO) && (
                    <ToggleSwitch id={transporte.idVehiculo} checked={transporte.habilitado !== false} onChange={() => onToggleHabilitado(transporte.idVehiculo, transporte.habilitado, transporte.estadoEfectivo, transporte.placa)} />
                )}
            </Box>
        ),
    },
]

export default useVehiculoColumns
