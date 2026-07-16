import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Avatar,
    CircularProgress, FormControl, TableSortLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import RegistrarCliente from './RegistrarCliente'
import ActualizarCliente from './ActualizarCliente'
import ModalInhabilitarCliente from './ModalInhabilitarCliente'
import ModalConsultarCliente from './ModalConsultarCliente'
import { getPageOfCliente, getClientes } from '../../shared/services/clienteService'
import { exportToExcel } from '../../shared/utils/exportExcel.js'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const ListarCliente = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const [searchParams] = useSearchParams()
    const highlightId = searchParams.get('highlight')
    const highlightRef = useRef(null)
    const hasScrolled = useRef(false)
    const hasNavigated = useRef(false)
    const { clientes, total, fetchClientes, toggleHabilitadoCliente } = useClientes()
    const { tienePermiso, PERMISOS } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const initialLoad = useRef(true)
    const pendingConfirm = useRef(false)
    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const filtroContainerRef = useRef(null)
    const filtroBtnRefs = useRef([])
    const [filtroPillStyle, setFiltroPillStyle] = useState({ left: 0, width: 0 })
    const [sortBy, setSortBy] = useState({ field: '', dir: '' })
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [exportando, setExportando] = useState(false)
    const { showToast } = useToast()
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [clienteEditar, setClienteEditar] = useState(null)
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, data: null })

    useLayoutEffect(() => {
        const activeIndex = FILTROS.findIndex(f => f.value === filtroEstado)
        const btn = filtroBtnRefs.current[activeIndex]
        const container = filtroContainerRef.current
        if (btn && container) {
            setFiltroPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth })
        }
    }, [filtroEstado])

    useEffect(() => {
        if (highlightId && highlightRef.current && !hasScrolled.current) {
            hasScrolled.current = true
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
        }
    })

    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfCliente(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])

    const handleSort = (field) => {
        setSortBy(prev => {
            if (prev.field !== field) return { field, dir: 'asc' }
            if (prev.dir === 'asc') return { field, dir: 'desc' }
            return { field: '', dir: '' }
        })
        setPage(1)
    }

    useEffect(() => {
        const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    useEffect(() => {
        const controller = new AbortController()
        let cancelled = false

        const cargar = async () => {
            setLoading(true)
            setError(null)
            try {
                await fetchClientes(controller.signal, {
                    page,
                    limit: rowsPerPage,
                    habilitado: filtroEstado === 'todo' ? undefined : filtroEstado === 'habilitado' ? 'true' : 'false',
                    q: debouncedBusqueda.trim() || undefined,
                    sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
                })
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        cargar()
        return () => {
            cancelled = true
            controller.abort()
        }
    }, [page, rowsPerPage, filtroEstado, debouncedBusqueda, sortBy, fetchClientes])

    useEffect(() => {
        if (!loading) initialLoad.current = false
    }, [loading])

    const handleToggleHabilitado = (cliente) => {
        setModalInhabilitar({
            open: true,
            data: {
                idCliente: cliente.idCliente,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                habilitadoActual: cliente.habilitado,
            }
        })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const handleExportar = async () => {
        setExportando(true)
        try {
            // Trae TODOS los registros que coinciden con el filtro/búsqueda activa,
            // no solo la página que se está viendo — "Exportar" no debe depender
            // de cuántas filas por página tengas seleccionadas.
            const res = await getClientes(undefined, {
                limit: 100000,
                habilitado: filtroEstado === 'todo' ? undefined : filtroEstado === 'habilitado' ? 'true' : 'false',
                q: debouncedBusqueda.trim() || undefined,
                sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
            })
            const rows = (res?.data || []).map(cliente => ({
                'ID': cliente.idCliente,
                'Nombre': `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
                'Identificación': `${cliente.tipoIdentificacion || ''} ${cliente.numeroIdentificacion || ''}`.trim(),
                'Email': cliente.email,
                'Teléfono': cliente.telefono,
                'Dirección': cliente.direccion,
                'Estado': cliente.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }))
            await exportToExcel({ data: rows, fileName: 'clientes', sheetName: 'Clientes', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Clientes
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los clientes registrados en el sistema.
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

                    {tienePermiso(PERMISOS.REGISTRAR_CLIENTE) && (
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
                <Box ref={filtroContainerRef} sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: 4,
                    p: '4px',
                    gap: '5px',
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: '4px',
                        bottom: '4px',
                        left: `${filtroPillStyle.left}px`,
                        width: `${filtroPillStyle.width}px`,
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: 'none',
                    }} />
                    {FILTROS.map((f, i) => (
                        <Button
                            key={f.value}
                            ref={el => { filtroBtnRefs.current[i] = el }}
                            onClick={() => { setFiltroEstado(f.value); setPage(1) }}
                            size="small"
                            disableElevation
                            disableRipple
                            sx={{
                                position: 'relative',
                                zIndex: 1,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                px: 2,
                                py: 0.5,
                                minWidth: 0,
                                fontWeight: filtroEstado === f.value ? 600 : 400,
                                backgroundColor: 'transparent',
                                color: filtroEstado === f.value ? theme.palette.text.primary : theme.palette.primary.darker,
                                transition: 'color 0.3s ease',
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    color: filtroEstado === f.value ? theme.palette.text.primary : theme.palette.primary.dark,
                                    border: 'none',
                                },
                            }}
                        >
                            {f.label}
                        </Button>
                    ))}
                </Box>

                <TextField
                    size="small"
                    placeholder="Buscar clientes..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            '&.Mui-focused': {
                                boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}`,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '1px',
                            },
                        },
                    }}
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setPage(1) }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: busqueda && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setBusqueda(''); setPage(1) }}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />

            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'nombre'}
                                        direction={sortBy.dir === 'desc' ? 'desc' : 'asc'}
                                        onClick={() => handleSort('nombre')}
                                        IconComponent={sortBy.field === 'nombre' ? undefined : UnfoldMoreOutlinedIcon}
                                        sx={{
                                            color: 'inherit',
                                            '&:hover': { color: 'inherit' },
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '&.Mui-active:hover': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 1, fontSize: 16 },
                                        }}
                                    >
                                        Nombre
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Email</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando clientes...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los clientes. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && clientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroEstado !== 'todo'
                                                ? 'No se encontraron clientes que coincidan con los filtros aplicados.'
                                                : debouncedBusqueda.trim()
                                                    ? 'No se encontraron clientes que coincidan con la búsqueda.'
                                                    : 'No hay clientes registrados en el sistema.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clientes.map(cliente => {
                                    const isHighlighted = highlightId && String(cliente.idCliente) === String(highlightId)
                                    return (
                                    <TableRow
                                        key={cliente.idCliente}
                                        ref={isHighlighted ? highlightRef : null}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: cliente.habilitado ? 1 : 0.55,
                                            ...(isHighlighted && {
                                                animation: 'highlightPulse 1.1s ease-in-out 4',
                                                '@keyframes highlightPulse': {
                                                    '0%, 100%': { backgroundColor: 'transparent' },
                                                    '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                                                },
                                            }),
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 34, height: 34,
                                                    backgroundColor: cliente.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                                                    fontSize: '0.73rem',
                                                    fontWeight: 700,
                                                    color: cliente.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                                                }}>
                                                    {cliente.iniciales && cliente.iniciales !== 'U' ? cliente.iniciales : (cliente.nombre?.[0] || '') + (cliente.apellido?.[0] || '') || 'C'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {cliente.nombre} {cliente.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {cliente.tipoIdentificacion} {cliente.numeroIdentificacion}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {cliente.telefono}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5, maxWidth: 200 }}>
                                            <Typography variant="body2" color={theme.palette.text.primary} noWrap>
                                                {cliente.email}
                                            </Typography>
                                        </TableCell>

                                        {/* Acciones: Ver, Editar, Checkbox habilitado */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_CLIENTE) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setClienteConsulta(cliente)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CLIENTE) && (
                                                    cliente.habilitado === false ? (
                                                        <Tooltip title="Habilita el registro para poder editarlo">
                                                            <span>
                                                                <IconButton size="small" disabled>
                                                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => { setClienteEditar(cliente); setModalActualizarOpen(true) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                                            >
                                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )
                                                )}
                                                {tienePermiso(PERMISOS.INHABILITAR_CLIENTE) && (
                                                    <ToggleSwitch id={cliente.idCliente} checked={cliente.habilitado} onChange={() => handleToggleHabilitado(cliente)} />
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
            />

            <ModalConsultarCliente cliente={clienteConsulta} onClose={() => setClienteConsulta(null)} />

            <ModalInhabilitarCliente
                open={modalInhabilitar.open}
                data={modalInhabilitar.data}
                onClose={() => setModalInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => {
                    const data = modalInhabilitar.data
                    const wasPending = pendingConfirm.current
                    pendingConfirm.current = false
                    setModalInhabilitar({ open: false, data: null })
                    if (wasPending && data) {
                        const habilitadoActual = data.habilitadoActual
                        toggleHabilitadoCliente(data.idCliente)
                            .then(() => showToast(`Cliente ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, habilitadoActual ? 'warning' : 'success'))
                            .catch(() => {})
                    }
                }}
                onConfirm={handleConfirmarToggle}
            />

            <RegistrarCliente
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    showToast('Cliente registrado correctamente', 'success')
                }}
            />

            <ActualizarCliente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setClienteEditar(null) }}
                cliente={clienteEditar}
                onSuccess={() => {
                    showToast('Cliente actualizado correctamente', 'success')
                }}
            />
        </Box>
    )
}

export default ListarCliente

