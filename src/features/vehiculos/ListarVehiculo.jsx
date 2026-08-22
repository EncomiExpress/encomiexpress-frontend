import { alpha } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Select, MenuItem, FormControl, Menu,
    Dialog, DialogContent,
    Tooltip, Button, CircularProgress,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import PlacaDisplay from '../../shared/components/PlacaDisplay.jsx'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useVehiculo } from './context/VehiculoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarVehiculo from './RegistrarVehiculo'
import ActualizarVehiculo from './ActualizarVehiculo'
import ModalConsultarVehiculo from './ModalConsultarVehiculo'
import ModalInhabilitarVehiculo from './ModalInhabilitarVehiculo'
import { getPageOfVehiculo, getVehiculos as getVehiculosApi } from './services/vehiculoService.js'
import { getRutas } from '../rutas/services/rutaService.js'
import { getEstadoColorRuta } from '../../shared/utils/estadoColors.js'
import { isVencido, formatFecha, capitalizarPrimeraLetra } from '../../shared/utils/formatters.js'

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem', py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                },
            },
        },
    },
})

const ESTADOS_VEHICULO = ['Disponible', 'Mantenimiento', 'En Ruta']
const TIPOS_VEHICULO = ['Camioneta', 'Camión', 'Furgón', 'Semi Trayler', 'Trayler', 'Motocicleta', 'Otro']

const RutasMiniTabla = ({ rutas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mt: 1.5 }}>
        <TableContainer sx={{ maxHeight: 140 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Ruta</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Destino</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rutas.map(r => {
                        const { color } = getEstadoColorRuta(r.estado)
                        const esProgramada = r.estado === 'Programada'
                        return (
                            <TableRow key={r.idRuta}
                                onClick={() => window.open(`/transporte/rutas?highlight=${r.idRuta}`, '_blank')}
                                sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                    {r.origen || `#${r.idRuta}`}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                    {r.destino?.ciudad || '—'}
                                </TableCell>
                                <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: esProgramada ? 'transparent' : color, border: `2px solid ${color}` }} />
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{r.estado}</Typography>
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

const ListarTransporte = () => {
    const [vehiculoVer, setVehiculoVer] = useState(null)
    const { showToast } = useToast()
    const [estadoMenu, setEstadoMenu] = useState({ anchor: null, id: null, estadoActual: null })
    const [confirmMantenimiento, setConfirmMantenimiento] = useState({ open: false, id: null })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, habilitadoActual: null, placa: '', estadoVehiculo: null })
    const [rutasMantenimiento, setRutasMantenimiento] = useState({ data: [], loading: false })
    const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [vehiculoEditar, setVehiculoEditar] = useState(null)
    const { getVehiculos, getTotal, updateEstado, toggleHabilitado, fetchVehiculos } = useVehiculo()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    const transportes = getVehiculos()
    const totalBackend = getTotal()

    const {
        theme,
        highlightId, highlightRef,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        page, setPage, rowsPerPage, setRowsPerPage,
        exportando, handleExportar,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
    } = useEntityCrud({
        fetchPage: (signal, params) => fetchVehiculos(signal, {
            ...params,
            estado: filtroEstadoVehiculo === '' || filtroEstadoVehiculo === 'En Ruta' ? undefined : filtroEstadoVehiculo,
            tipo: filtroTipo || undefined,
        }),
        extraDeps: [filtroEstadoVehiculo, filtroTipo],
        fetchPageForHighlight: (id, limit) => getPageOfVehiculo(id, limit),
        exportConfig: {
            fetchAll: (params) => getVehiculosApi(undefined, {
                ...params,
                estado: filtroEstadoVehiculo === '' || filtroEstadoVehiculo === 'En Ruta' ? undefined : filtroEstadoVehiculo,
                tipo: filtroTipo || undefined,
                limit: 100000,
            }),
            mapRow: (vehiculo) => ({
                'ID': vehiculo.idVehiculo,
                'Placa': vehiculo.placa,
                'Marca': capitalizarPrimeraLetra(vehiculo.marca),
                'Modelo': vehiculo.modelo,
                'Tipo': vehiculo.tipo,
                'Capacidad (kg)': vehiculo.capacidad,
                'Propietario': vehiculo.propietario ? `${vehiculo.propietario.nombre} ${vehiculo.propietario.apellido}`.trim() : '-',
                'Vencimiento SOAT': vehiculo.vencimientoSOAT,
                'Vencimiento Rev. Técnica': vehiculo.vencimientoRevisionTecnica,
                'Vencimiento Seguro Terceros': vehiculo.vencimientoSeguroTerceros,
                'Estado': (vehiculosOcupadosIds.has(vehiculo.idVehiculo) ? 'En Ruta' : vehiculo.estado),
                'Habilitado': vehiculo.habilitado === false ? 'No' : 'Sí',
            }),
            fileName: 'Vehiculos',
            sheetName: 'Vehículos',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    const filterMenuProps = getFilterMenuProps(theme)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    // Consulta dedicada y fresca (no la lista paginada de Rutas, que puede no traer
    // todas las rutas En Ruta) — mismo patrón que ListarConductor.jsx.
    const [vehiculosOcupadosIds, setVehiculosOcupadosIds] = useState(new Set())
    useEffect(() => {
        if (!usuario) return
        getRutas({ estado: 'En Ruta', habilitado: 'true', limit: 100 })
            .then(res => setVehiculosOcupadosIds(new Set((res?.data || []).flatMap(r => (r.paresVehiculoConductor || []).map(p => p.idVehiculo)))))
            .catch(() => {})
    }, [usuario])

    const transportesConEstado = transportes.map(t => {
        const estaOcupado = vehiculosOcupadosIds.has(t.idVehiculo)
        return {
            ...t,
            estadoEfectivo: estaOcupado ? 'En Ruta' : t.estado,
        }
    })

    useEffect(() => {
        if (!confirmMantenimiento.open || !confirmMantenimiento.id) return
        setRutasMantenimiento({ data: [], loading: true })
        getRutas({ idVehiculo: confirmMantenimiento.id, estado: 'Programada', habilitado: 'true', limit: 100 })
            .then(res => setRutasMantenimiento({ data: res?.data || [], loading: false }))
            .catch(() => setRutasMantenimiento({ data: [], loading: false }))
    }, [confirmMantenimiento.open, confirmMantenimiento.id])

    const handleEstadoChange = async (id, nuevoEstado) => {
        const success = await updateEstado(id, nuevoEstado)
        if (success) {
            showToast(`Estado actualizado a ${nuevoEstado}.`, 'success')
        }
    }

    const handleToggleHabilitado = (id, habilitadoActual, estadoVehiculo, placa) => {
        setConfirmInhabilitar({ open: true, id, habilitadoActual, placa: placa || '', estadoVehiculo })
    }

    const onConfirmar = async () => {
        const { habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            showToast(habilitadoActual ? 'Vehículo inhabilitado correctamente.' : 'Vehículo habilitado correctamente.', 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado del vehículo', 'error')
            throw err
        }
    }

    // Re-filtro en cliente: el backend ya filtra, pero "En Ruta" es un estado
    // derivado (vehiculosOcupadosIds) que el backend no conoce.
    const filteredTransportes = transportesConEstado.filter(t => {
        const q = debouncedBusqueda.toLowerCase()
        const coincideBusqueda = !q ||
            t.placa.toLowerCase().includes(q) ||
            (t.marca || '').toLowerCase().includes(q) ||
            (t.modelo || '').toLowerCase().includes(q) ||
            (t.tipo || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && t.habilitado !== false) ||
            (filtroHabilitado === 'inhabilitado' && t.habilitado === false)

        const coincideEstado = filtroEstadoVehiculo === '' || t.estadoEfectivo === filtroEstadoVehiculo

        return coincideBusqueda && coincideHabilitado && coincideEstado
    })

    const emptyMessage = filtroEstadoVehiculo !== '' || filtroTipo !== '' || filtroHabilitado !== 'todo'
        ? 'No se encontraron vehículos que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron vehículos que coincidan con la búsqueda.'
            : 'No hay vehículos registrados en el sistema.'

    const columns = [
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
                    sx={isVencido(transporte.vencimientoSOAT)
                        ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                        : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
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
                    sx={isVencido(transporte.vencimientoRevisionTecnica)
                        ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                        : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
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
                    sx={isVencido(transporte.vencimientoSeguroTerceros)
                        ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                        : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
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
                        onClick={(e) => setEstadoMenu({ anchor: e.currentTarget, id: transporte.idVehiculo, estadoActual: transporte.estadoEfectivo })}
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
                            <IconButton size="small" onClick={() => setVehiculoVer(transporte)}
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
                                <IconButton size="small" onClick={() => { setVehiculoEditar(transporte); setModalActualizarOpen(true) }}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_VEHICULO) && (
                        <ToggleSwitch id={transporte.idVehiculo} checked={transporte.habilitado !== false} onChange={() => handleToggleHabilitado(transporte.idVehiculo, transporte.habilitado, transporte.estadoEfectivo, transporte.placa)} />
                    )}
                </Box>
            ),
        },
    ]

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Vehículos
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los vehículos registrados en el sistema.
                    </Typography>
                 </Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Button
                         onClick={handleExportar}
                         disabled={exportando}
                         variant="contained"
                         startIcon={exportando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                         sx={{
                             backgroundColor: theme.palette.background.paper,
                             color: theme.palette.text.primary,
                             borderRadius: 2,
                             textTransform: 'none',
                             fontSize: '0.875rem',
                             fontWeight: 700,
                             border: `1px solid ${theme.palette.divider}`,
                             boxShadow: 'none',
                             '&:hover': {
                                 backgroundColor: theme.palette.primary.activeBg,
                                 color: theme.palette.text.primary,
                                 border: `1px solid ${theme.palette.divider}`,
                                 boxShadow: 'none',
                             },
                         }}
                     >
                         {exportando ? 'Exportando...' : 'Exportar'}
                     </Button>

                     {tienePermiso(PERMISOS.REGISTRAR_VEHICULO) && (
                         <Button
                             onClick={() => setModalRegistrarOpen(true)}
                             variant="contained"
                             startIcon={<AddOutlinedIcon sx={{ fontSize: 20 }} />}
                             sx={{
                                 backgroundColor: theme.palette.primary.main,
                                 borderRadius: 2,
                                 textTransform: 'none',
                                 fontSize: '0.875rem',
                                 fontWeight: 600,
                                 boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                                 '&:hover': {
                                     backgroundColor: theme.palette.primary.dark,
                                     boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}`,
                                 },
                             }}
                         >
                             Nuevo
                         </Button>
                     )}
                 </Box>
             </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <FiltroEstadoTabs
                        value={filtroHabilitado}
                        onChange={setFiltroHabilitado}
                        containerRef={filtroContainerRef}
                        btnRefs={filtroBtnRefs}
                        pillStyle={filtroPillStyle}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            displayEmpty
                            value={filtroEstadoVehiculo}
                            onChange={e => { setFiltroEstadoVehiculo(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Estado'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroEstadoVehiculo ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {ESTADOS_VEHICULO.map(e => (
                                <MenuItem key={e} value={e}>
                                    {e}
                                    {filtroEstadoVehiculo === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            displayEmpty
                            value={filtroTipo}
                            onChange={e => { setFiltroTipo(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Tipo'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroTipo ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {TIPOS_VEHICULO.map(t => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                    {filtroTipo === t && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar vehículos..." width={280} />
            </Box>

            <DataTable
                columns={columns}
                rows={filteredTransportes}
                rowKey={(transporte) => transporte.idVehiculo}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(transporte) => ({ opacity: transporte.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando vehículos..."
                errorMessage="No se pudieron cargar los vehículos. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={totalBackend}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {vehiculoVer && (
                <ModalConsultarVehiculo vehiculo={vehiculoVer} onClose={() => setVehiculoVer(null)} />
            )}

            <RegistrarVehiculo
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchVehiculos()
                    showToast('Vehículo registrado correctamente', 'success')
                }}
            />

            <ActualizarVehiculo
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVehiculoEditar(null) }}
                transporte={vehiculoEditar}
                onSuccess={() => {
                    fetchVehiculos()
                    showToast('Vehículo actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarVehiculo
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, habilitadoActual: null, placa: '', estadoVehiculo: null })}
                onConfirm={onConfirmar}
            />

            <Menu
                anchorEl={estadoMenu.anchor}
                open={Boolean(estadoMenu.anchor)}
                onClose={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
            >
                {['Disponible', 'Mantenimiento'].filter(op => estadoMenu.estadoActual !== op).map((op) => (
                    <MenuItem key={op} onClick={() => {
                        setEstadoMenu(prev => ({ ...prev, anchor: null }))
                        if (op === 'Mantenimiento') {
                            setConfirmMantenimiento({ open: true, id: estadoMenu.id })
                        } else {
                            handleEstadoChange(estadoMenu.id, op)
                        }
                    }}
                        sx={{ fontSize: '0.82rem', gap: 1 }}>
                        <Box sx={{
                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                            ...(op === 'Disponible'
                                ? { backgroundColor: 'transparent', border: '2px solid #10b981' }
                                : { backgroundColor: '#ea580c', border: '2px solid #ea580c' })
                        }} />
                        {op}
                    </MenuItem>
                ))}
            </Menu>

            {/* Modal cambiar estado a Mantenimiento */}
            <Dialog
                open={confirmMantenimiento.open}
                onClose={() => setConfirmMantenimiento({ open: false, id: null })}
                TransitionProps={{ onExited: () => setRutasMantenimiento({ data: [], loading: false }) }}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogContent sx={{ p: 3, position: 'relative' }}>
                    <IconButton
                        onClick={() => setConfirmMantenimiento({ open: false, id: null })}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2, textAlign: 'center' }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SwapHorizOutlinedIcon sx={{ fontSize: 35, color: theme.palette.warning.main }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="1.35rem" color={theme.palette.text.primary}>
                            Cambiar a Mantenimiento
                        </Typography>
                        {rutasMantenimiento.loading ? (
                            <CircularProgress size={24} sx={{ mt: 1 }} />
                        ) : rutasMantenimiento.data.length > 0 ? (
                            <>
                                <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                    Este vehículo tiene {rutasMantenimiento.data.length === 1 ? 'una ruta programada' : 'rutas programadas'}. {rutasMantenimiento.data.length === 1 ? 'No podrá ponerse en curso' : 'No podrán ponerse en curso'} mientras esté en mantenimiento.
                                </Typography>
                                <RutasMiniTabla rutas={rutasMantenimiento.data} theme={theme} />
                            </>
                        ) : (
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                ¿Seguro que deseas cambiarlo a <Box component="span" fontWeight={700} color={theme.palette.warning.main}>Mantenimiento</Box>?
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                        <Button onClick={() => setConfirmMantenimiento({ open: false, id: null })} disableRipple
                            sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`, '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary } }}>
                            Cancelar
                        </Button>
                        <Button onClick={async () => {
                                setConfirmandoEstado(true)
                                try {
                                    await handleEstadoChange(confirmMantenimiento.id, 'Mantenimiento')
                                    setConfirmMantenimiento({ open: false, id: null })
                                } finally {
                                    setConfirmandoEstado(false)
                                }
                            }}
                            disabled={confirmandoEstado}
                            variant="contained" disableRipple
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.warning.main, '&:hover': { backgroundColor: theme.palette.warning.dark } }}>
                            {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

        </Box>
    )
}

export default ListarTransporte
