import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Chip, IconButton,
    Select, MenuItem, FormControl,
    Tooltip, Button, Avatar, CircularProgress,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { usePropietario } from './context/PropietarioContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarPropietario from './RegistrarPropietario'
import ActualizarPropietario from './ActualizarPropietario'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarPropietario from './ModalConsultarPropietario'
import ModalInhabilitarPropietario from './ModalInhabilitarPropietario'
import { getPageOfPropietario, getPropietarios } from './services/propietarioService.js'

const TIPOS_FLOTA = ['Carga Liviana', 'Carga Pesada', 'Pasajeros', 'Mixta']

const ListarPropietario = () => {
    const navigate = useNavigate()
    const [propietarioVer, setPropietarioVer] = useState(null)
    const { showToast } = useToast()
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })
    const [confirmToggle, setConfirmToggle] = useState({ open: false, idPropietario: null, nombreCompleto: '', habilitadoActual: false })
    const [filtroTipoFlota, setFiltroTipoFlota] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [propietarioEditar, setPropietarioEditar] = useState(null)
    const { propietarios, total, fetchPropietarios, toggleHabilitado } = usePropietario()
    const { usuario, tienePermiso, PERMISOS } = useAuth()

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
        fetchPage: (signal, params) => fetchPropietarios(signal, { ...params, tipoFlota: filtroTipoFlota || undefined }),
        extraDeps: [filtroTipoFlota],
        fetchPageForHighlight: (id, limit) => getPageOfPropietario(id, limit),
        exportConfig: {
            fetchAll: (params) => getPropietarios(undefined, { ...params, tipoFlota: filtroTipoFlota || undefined, limit: 100000 }),
            mapRow: (propietario) => ({
                'ID': propietario.idPropietario,
                'Nombre': `${propietario.nombre || ''} ${propietario.apellido || ''}`.trim(),
                'Identificación': `${propietario.tipoIdentificacion || ''} ${propietario.numeroIdentificacion || ''}`.trim(),
                'Email': propietario.email,
                'Teléfono': propietario.telefono,
                'Tipo de flota': propietario.tipoFlota,
                'Estado': propietario.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }),
            fileName: 'Propietarios',
            sheetName: 'Propietarios',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const solicitarToggle = (propietario) => {
        setConfirmToggle({
            open: true,
            idPropietario: propietario.idPropietario,
            nombreCompleto: `${propietario.nombre} ${propietario.apellido}`,
            habilitadoActual: propietario.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idPropietario, habilitadoActual } = confirmToggle
        try {
            await toggleHabilitado(idPropietario)
            showToast(`Propietario ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`, 'success')
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
        ? 'No se encontraron propietarios que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron propietarios que coincidan con la búsqueda.'
            : 'No hay propietarios registrados en el sistema.'

    const columns = [
        {
            key: 'nombre', label: 'Nombre', sortField: 'nombre',
            render: (propietario) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{
                        width: 34, height: 34,
                        backgroundColor: propietario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        fontSize: '0.73rem', fontWeight: 700,
                        color: propietario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                    }}>
                        {(propietario.nombre?.[0] || '').toUpperCase()}{(propietario.apellido?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                        {propietario.nombre} {propietario.apellido}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'identificacion', label: 'Identificación',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (propietario) => `${propietario.tipoIdentificacion} ${propietario.numeroIdentificacion}`,
        },
        { key: 'telefono', label: 'Teléfono', cellSx: { py: 1.5 }, render: (propietario) => propietario.telefono || '—' },
        { key: 'email', label: 'Email', cellSx: { py: 1.5 }, render: (propietario) => propietario.email || '—' },
        {
            key: 'tipoFlota', label: 'Tipo Flota', cellSx: { py: 1.5 },
            render: (propietario) => (
                <Chip
                    label={propietario.tipoFlota || '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                />
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (propietario) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => setPropietarioVer(propietario)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    {propietario.habilitado === false ? (
                        <Tooltip title="Habilita el registro para poder editarlo">
                            <span>
                                <IconButton size="small" disabled>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Editar">
                            <IconButton size="small"
                                onClick={() => { setPropietarioEditar(propietario); setModalActualizarOpen(true) }}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_PROPIETARIO) && (
                        <ToggleSwitch id={propietario.idPropietario} checked={propietario.habilitado} onChange={() => solicitarToggle(propietario)} />
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
                        Propietarios
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los propietarios de vehículos registrados en el sistema.
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

                    <Button
                        onClick={() => setModalRegistrarOpen(true)}
                        variant="contained" startIcon={<AddOutlinedIcon sx={{ fontSize: 20 }} />}
                        sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                        }}>
                        Nuevo
                    </Button>
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
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            displayEmpty
                            value={filtroTipoFlota}
                            onChange={e => { setFiltroTipoFlota(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Tipo de flota'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem',
                                borderRadius: 4,
                                color: filtroTipoFlota ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={{
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
                                                '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600 },
                                                '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                                            },
                                        },
                                    },
                                },
                            }}>
                            <MenuItem value="">Todos</MenuItem>
                            {TIPOS_FLOTA.map(t => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                    {filtroTipoFlota === t && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar propietarios..." />
            </Box>

            <DataTable
                columns={columns}
                rows={propietarios}
                rowKey={(propietario) => propietario.idPropietario}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(propietario) => ({ opacity: propietario.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando propietarios..."
                errorMessage="No se pudieron cargar los propietarios. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {propietarioVer && (
                <ModalConsultarPropietario propietario={propietarioVer} onClose={() => setPropietarioVer(null)} />
            )}

            <RegistrarPropietario
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    refetch()
                    showToast('Propietario registrado correctamente', 'success')
                }}
            />

            <ActualizarPropietario
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setPropietarioEditar(null) }}
                propietario={propietarioEditar}
                onSuccess={() => {
                    refetch()
                    showToast('Propietario actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarPropietario
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, idPropietario: null, nombreCompleto: '', habilitadoActual: false })}
                onConfirm={onConfirmar}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="propietario"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

        </Box>
    )
}

export default ListarPropietario
