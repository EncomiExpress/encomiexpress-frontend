import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPageOfDestino, getDestinos } from './services/destinoService.js'
import {
    Box, Typography, Chip, IconButton,
    TextField, InputAdornment,
    Tooltip, Button, CircularProgress,
    Select, MenuItem, FormControl,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useDestino } from './context/DestinoContext.jsx'
import { useConfiguracion } from '../../shared/contexts/ConfiguracionContext.jsx'
import { formatearMoneda, limpiarMonedaInput } from '../../shared/utils/formatters.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarDestino from './RegistrarDestino'
import ActualizarDestino from './ActualizarDestino'
import ModalConsultarDestino from './ModalConsultarDestino'
import ModalInhabilitarDestino from './ModalInhabilitarDestino'
import NacionSVG from '../../shared/components/NacionSVG.jsx'

const DEPARTAMENTOS = ['Antioquia', 'Córdoba']

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

const ListarDestino = () => {
    const { showToast } = useToast()
    const [destinoVer, setDestinoVer] = useState(null)
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, ciudad: '', habilitadoActual: null })
    const [filtroDepartamento, setFiltroDepartamento] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [destinoEditar, setDestinoEditar] = useState(null)
    const { destinos, total, fetchDestinos, toggleHabilitado } = useDestino()
    const { tarifaPorKg, actualizarTarifaPorKg } = useConfiguracion()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    const [editandoTarifa, setEditandoTarifa] = useState(false)
    const [tarifaInput, setTarifaInput] = useState('')
    const [guardandoTarifa, setGuardandoTarifa] = useState(false)

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
        fetchPage: (signal, params) => fetchDestinos(signal, { ...params, departamento: filtroDepartamento || undefined }),
        extraDeps: [filtroDepartamento],
        fetchPageForHighlight: (id, limit) => getPageOfDestino(id, limit),
        exportConfig: {
            fetchAll: (params) => getDestinos(undefined, { ...params, departamento: filtroDepartamento || undefined, limit: 100000 }),
            mapRow: (destino) => ({
                'ID': destino.idDestino,
                'Ciudad': destino.ciudad,
                'Departamento': destino.departamento,
                'Dirección': destino.direccion || '',
                'Tarifa base': Math.round(Number(destino.tarifaBase)) || 0,
                'Estado': destino.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }),
            fileName: 'Destinos',
            sheetName: 'Destinos',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    const filterMenuProps = getFilterMenuProps(theme)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const handleAbrirEdicionTarifa = () => {
        setTarifaInput(String(tarifaPorKg))
        setEditandoTarifa(true)
    }

    const handleCancelarEdicionTarifa = () => {
        setEditandoTarifa(false)
        setTarifaInput('')
    }

    const handleGuardarTarifa = async () => {
        const valor = parseFloat(limpiarMonedaInput(tarifaInput))
        if (isNaN(valor) || valor < 0) {
            showToast('Ingresa un valor numérico válido', 'error')
            return
        }
        setGuardandoTarifa(true)
        try {
            await actualizarTarifaPorKg(valor)
            showToast('Tarifa por kg actualizada correctamente', 'success')
            setEditandoTarifa(false)
        } catch (err) {
            showToast(err.message || 'No se pudo actualizar la tarifa por kg.', 'error')
        } finally {
            setGuardandoTarifa(false)
        }
    }

    const handleToggleHabilitado = (id, habilitadoActual, ciudad) => {
        setConfirmInhabilitar({ open: true, id, ciudad: ciudad || '', habilitadoActual })
    }

    const onConfirmar = async () => {
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            showToast(confirmInhabilitar.habilitadoActual ? 'Destino inhabilitado correctamente.' : 'Destino habilitado correctamente.', 'success')
        } catch (err) {
            showToast(err.message || 'No se pudo cambiar el estado del destino.', 'error')
            throw err
        }
    }

    const emptyMessage = filtroHabilitado !== 'todo'
        ? 'No se encontraron destinos que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron destinos que coincidan con la búsqueda.'
            : 'No hay destinos registrados en el sistema.'

    const columns = [
        {
            key: 'ciudad', label: 'Ciudad', sortField: 'ciudad',
            render: (destino) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <NacionSVG color={destino.habilitado ? theme.palette.primary.main : theme.palette.text.disabled} />
                    </Box>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                        {destino.ciudad}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'departamento', label: 'Departamento',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (destino) => destino.departamento,
        },
        {
            key: 'tarifaBase', label: 'Tarifa Base', cellSx: { py: 1.5 },
            render: (destino) => (
                <Chip
                    label={destino.tarifaBase !== undefined ? `$${Number(destino.tarifaBase).toLocaleString('es-CO')}` : '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', borderRadius: '2px', height: 26 }}
                />
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (destino) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {tienePermiso(PERMISOS.CONSULTAR_DESTINO) && (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => setDestinoVer(destino)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                        destino.habilitado === false ? (
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
                                    onClick={() => { setDestinoEditar(destino); setModalActualizarOpen(true) }}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_DESTINO) && (
                        <ToggleSwitch id={destino.idDestino} checked={destino.habilitado} onChange={() => handleToggleHabilitado(destino.idDestino, destino.habilitado, destino.ciudad)} />
                    )}
                </Box>
            ),
        },
    ]

    return (
        <Box sx={{ p: 3.5 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Destinos
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los destinos de entrega registrados en el sistema.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        pl: 0.75, pr: 1.25, height: 40,
                    }}>
                        <Tooltip title="Valor global usado en Ventas: tarifa del destino + peso × esta tarifa">
                            <Box sx={{
                                width: 26, height: 26, borderRadius: 1.5, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: theme.palette.primary.light,
                            }}>
                                <ScaleOutlinedIcon sx={{ fontSize: 15, color: theme.palette.primary.darker }} />
                            </Box>
                        </Tooltip>
                        <Typography variant="body2" color={theme.palette.text.secondary} sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            Tarifa por kg
                        </Typography>
                        {editandoTarifa ? (
                            <>
                                <TextField
                                    size="small" autoFocus value={formatearMoneda(tarifaInput)} variant="standard"
                                    onChange={e => setTarifaInput(limpiarMonedaInput(e.target.value))}
                                    slotProps={{ input: { disableUnderline: false, startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                                    sx={{ width: 100 }}
                                />
                                <Tooltip title="Guardar">
                                    <span>
                                        <IconButton size="small" onClick={handleGuardarTarifa} disabled={guardandoTarifa}
                                            sx={{ color: theme.palette.primary.main, p: 0.5 }}>
                                            {guardandoTarifa ? <CircularProgress size={14} /> : <CheckOutlinedIcon sx={{ fontSize: 16 }} />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Cancelar">
                                    <IconButton size="small" onClick={handleCancelarEdicionTarifa} disabled={guardandoTarifa}
                                        sx={{ color: theme.palette.text.secondary, p: 0.5 }}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <Tooltip title="Valor global usado en Ventas: tarifa del destino + peso × esta tarifa">
                                    <Chip
                                        label={`$${Number(tarifaPorKg).toLocaleString('es-CO')} / kg`}
                                        size="small"
                                        sx={{
                                            fontWeight: 600, backgroundColor: theme.palette.primary.light,
                                            color: theme.palette.primary.darker, fontSize: '0.75rem', height: 24,
                                        }}
                                    />
                                </Tooltip>
                                {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) ? (
                                    <Tooltip title="Desbloquear para editar">
                                        <IconButton size="small" onClick={handleAbrirEdicionTarifa}
                                            sx={{ color: theme.palette.text.secondary, p: 0.5, '&:hover': { backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker } }}>
                                            <LockOutlinedIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <LockOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.disabled }} />
                                )}
                            </>
                        )}
                    </Box>
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

                    {tienePermiso(PERMISOS.REGISTRAR_DESTINO) && (
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
                            value={filtroDepartamento}
                            onChange={e => { setFiltroDepartamento(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Departamento'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroDepartamento ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {DEPARTAMENTOS.map(d => (
                                <MenuItem key={d} value={d}>
                                    {d}
                                    {filtroDepartamento === d && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar destinos..." />
            </Box>

            <DataTable
                columns={columns}
                rows={destinos}
                rowKey={(destino) => destino.idDestino}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(destino) => ({ opacity: destino.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando destinos..."
                errorMessage="No se pudieron cargar los destinos. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {destinoVer && (
                <ModalConsultarDestino destino={destinoVer} onClose={() => setDestinoVer(null)} />
            )}

            {/* ── Modales registrar / actualizar ── */}
            <RegistrarDestino
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    refetch()
                    showToast('Destino registrado correctamente', 'success')
                }}
            />

            <ActualizarDestino
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setDestinoEditar(null) }}
                destino={destinoEditar}
                onSuccess={() => {
                    refetch()
                    showToast('Destino actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarDestino
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, ciudad: '', habilitadoActual: null })}
                onConfirm={onConfirmar}
            />
        </Box>
    )
}

export default ListarDestino
