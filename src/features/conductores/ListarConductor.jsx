import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Chip, IconButton,
    Select, MenuItem, FormControl,
    Tooltip, Button, Avatar, CircularProgress,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useConductor } from './context/ConductorContext.jsx'
import { useRutaProgramacion } from '../rutas/context/RutaProgramacionContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import * as rutaService from '../rutas/services/rutaService.js'
import { getPageOfConductor, getConductores } from './services/conductorService.js'
import { normalizarConductor } from './utils/normalizarConductor.js'
import RegistrarConductor from './RegistrarConductor'
import ActualizarConductor from './ActualizarConductor'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarConductor from './ModalConsultarConductor'
import ModalInhabilitarConductor from './ModalInhabilitarConductor'
import { isVencido, formatFecha } from '../../shared/utils/formatters.js'

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

const ESTADOS_CONDUCTOR = ['Disponible', 'En Ruta']

const ListarConductor = () => {
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const { conductores, total, fetchConductores, toggleHabilitado } = useConductor()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()

    const [conductorVer, setConductorVer] = useState(null)
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })
    const [confirmToggle, setConfirmToggle] = useState({ open: false, idConductor: null, nombreCompleto: '', habilitadoActual: false })
    const [filtroEstado, setFiltroEstado] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [conductorEditar, setConductorEditar] = useState(null)

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
        refetch,
    } = useEntityCrud({
        fetchPage: (signal, params) => fetchConductores(signal, { ...params, estado: filtroEstado || undefined }),
        extraDeps: [filtroEstado],
        fetchPageForHighlight: (id, limit) => getPageOfConductor(id, limit),
        exportConfig: {
            fetchAll: (params) => getConductores(undefined, { ...params, estado: filtroEstado || undefined, limit: 100000 }),
            mapRow: (conductorCrudo) => {
                const conductor = normalizarConductor(conductorCrudo)
                return {
                    'ID': conductor.idConductor,
                    'Nombre': `${conductor.nombre || ''} ${conductor.apellido || ''}`.trim(),
                    'Identificación': conductor.numeroIdentificacion,
                    'Email': conductor.email,
                    'Teléfono': conductor.telefono,
                    'N° Licencia': conductor.numeroLicencia,
                    'Categorías de licencia': (conductor.categoriasLicencia || [])
                        .map(c => `${c.categoria} (${c.vencimiento})`)
                        .join(', '),
                    'Estado': conductoresEnRutaIds.has(conductor.idConductor) ? 'En Ruta' : 'Disponible',
                    'Habilitado': conductor.habilitado === false ? 'No' : 'Sí',
                }
            },
            fileName: 'Conductores',
            sheetName: 'Conductores',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    const filterMenuProps = getFilterMenuProps(theme)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    useEffect(() => {
        if (!usuario) return
        if (rutasProgramadas.length === 0) fetchRutasProgramadas()
    }, [usuario, rutasProgramadas.length, fetchRutasProgramadas])

    const [conductoresEnRutaIds, setConductoresEnRutaIds] = useState(new Set())

    useEffect(() => {
        if (!usuario) return
        rutaService.getRutas({ estado: 'En Ruta', habilitado: 'true', limit: 100 })
            .then(res => setConductoresEnRutaIds(new Set((res?.data || []).flatMap(r => (r.paresVehiculoConductor || []).map(p => p.idConductor)))))
            .catch(() => {})
    }, [usuario])

    const conductoresConEstado = conductores.map(c => ({
        ...c,
        estadoEfectivo: conductoresEnRutaIds.has(c.idConductor) ? 'en_ruta' : 'disponible',
    }))

    const solicitarToggle = (conductor) => {
        setConfirmToggle({
            open: true,
            idConductor: conductor.idConductor,
            nombreCompleto: `${conductor.nombre} ${conductor.apellido}`,
            habilitadoActual: conductor.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idConductor, habilitadoActual } = confirmToggle
        try {
            await toggleHabilitado(idConductor)
            showToast(`Conductor ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`, 'success')
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                showToast(err.message || 'Error al cambiar el estado', 'error')
            }
            throw err
        }
    }

    const emptyMessage = filtroHabilitado !== 'todo'
        ? 'No se encontraron conductores que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron conductores que coincidan con la búsqueda.'
            : 'No hay conductores registrados en el sistema.'

    const columns = [
        {
            key: 'nombre', label: 'Nombre', sortField: 'nombre',
            render: (conductor) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, backgroundColor: conductor.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg, fontSize: '0.73rem', fontWeight: 700, color: conductor.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color }}>
                        {conductor.nombre?.[0] || ''}{conductor.apellido?.[0] || ''}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                        {conductor.nombre} {conductor.apellido}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'identificacion', label: 'Identificación',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (conductor) => `${conductor.tipoIdentificacion} ${conductor.numeroIdentificacion}`,
        },
        { key: 'telefono', label: 'Teléfono', cellSx: { py: 1.5 }, render: (conductor) => conductor.telefono || '-' },
        { key: 'email', label: 'Email', cellSx: { py: 1.5 }, render: (conductor) => conductor.email || '-' },
        {
            key: 'licencia', label: 'Licencia', cellSx: { py: 1.5 },
            render: (conductor) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(conductor.categoriasLicencia || []).length === 0 ? (
                            <Chip label="—" size="small"
                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }} />
                        ) : conductor.categoriasLicencia.map((cat, i) => (
                            <Chip key={i}
                                label={`${cat.categoria} · ${cat.vencimiento ? formatFecha(cat.vencimiento) : 'N/A'}`}
                                size="small"
                                variant={isVencido(cat.vencimiento) ? 'filled' : 'outlined'}
                                sx={isVencido(cat.vencimiento)
                                    ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                    : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                                } />
                        ))}
                    </Box>
                    {conductor.numeroLicencia && (
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ lineHeight: 1.2 }}>
                            {conductor.numeroLicencia}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            key: 'estado', label: 'Estado', cellSx: { py: 1.5 },
            render: (conductor) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        ...(conductor.estadoEfectivo === 'en_ruta'
                            ? { backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }
                            : { backgroundColor: 'transparent', border: '2px solid #10b981' })
                    }} />
                    <Typography variant="body2" sx={{
                        fontSize: '0.82rem', fontWeight: 500,
                        color: conductor.estadoEfectivo === 'en_ruta' ? '#3B82F6' : '#10b981',
                    }}>
                        {conductor.estadoEfectivo === 'en_ruta' ? 'En Ruta' : 'Disponible'}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (conductor) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {tienePermiso(PERMISOS.CONSULTAR_CONDUCTOR) && (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => setConductorVer(conductor)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                        conductor.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => { setConductorEditar(conductor); setModalActualizarOpen(true) }}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_CONDUCTOR) && (
                        <ToggleSwitch id={conductor.idConductor} checked={conductor.habilitado} onChange={() => solicitarToggle(conductor)} />
                    )}
                </Box>
            ),
        },
    ]

    return (
        <Box sx={{ p: 3.5 }}>
            {/* -- Encabezado -- */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Conductores
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los conductores registrados en el sistema.
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

                    {tienePermiso(PERMISOS.REGISTRAR_CONDUCTOR) && (
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
                                '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            }}
                        >
                            Nuevo
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                            value={filtroEstado}
                            onChange={e => { setFiltroEstado(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Estado'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem',
                                borderRadius: 4,
                                color: filtroEstado ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {ESTADOS_CONDUCTOR.map(e => (
                                <MenuItem key={e} value={e}>
                                    {e}
                                    {filtroEstado === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar conductores..." />
            </Box>

            <DataTable
                columns={columns}
                rows={conductoresConEstado}
                rowKey={(conductor) => conductor.idConductor}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(conductor) => ({ opacity: conductor.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando conductores..."
                errorMessage="No se pudieron cargar los conductores. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {conductorVer && (
                <ModalConsultarConductor conductor={conductorVer} onClose={() => setConductorVer(null)} />
            )}

            {/* -- Modales registrar / actualizar -- */}
            <RegistrarConductor
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    refetch()
                    showToast('Conductor registrado correctamente', 'success')
                }}
            />

            <ActualizarConductor
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setConductorEditar(null) }}
                conductor={conductorEditar}
                onSuccess={() => {
                    refetch()
                    showToast('Conductor actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarConductor
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, idConductor: null, nombreCompleto: '', habilitadoActual: false })}
                onConfirm={onConfirmar}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="conductor"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

        </Box>
    )
}

export default ListarConductor
