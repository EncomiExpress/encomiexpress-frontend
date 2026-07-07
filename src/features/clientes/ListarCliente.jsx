import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, TableSortLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import RegistrarCliente from './RegistrarCliente'
import ActualizarCliente from './ActualizarCliente'
import ModalInhabilitarCliente from './ModalInhabilitarCliente'
import ModalConsultarCliente from './ModalConsultarCliente'
import { getPageOfCliente } from '../../shared/services/clienteService'
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
    const { clientes, total, loading, error, fetchClientes, toggleHabilitadoCliente } = useClientes()
    const { tienePermiso, PERMISOS } = useAuth()
    const initialLoad = useRef(true)
    const pendingConfirm = useRef(false)
    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [sortBy, setSortBy] = useState({ field: 'nombre', dir: 'asc' })
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [clienteEditar, setClienteEditar] = useState(null)
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, data: null })

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
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    useEffect(() => {
        const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    useEffect(() => {
        const controller = new AbortController()

        const cargar = async () => {
            await fetchClientes(controller.signal, {
                page,
                limit: rowsPerPage,
                habilitado: filtroEstado === 'todo' ? undefined : filtroEstado === 'habilitado' ? 'true' : 'false',
                q: debouncedBusqueda.trim() || undefined,
                sortBy: `${sortBy.field}.${sortBy.dir}`,
            })
        }

        cargar()
        return () => {
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

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    const handleExportar = () => {
        const rows = clientes.map(cliente => ({
            'ID': cliente.idCliente,
            'Nombre': `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
            'Email': cliente.email,
            'Teléfono': cliente.telefono,
            'Dirección': cliente.direccion,
            'Estado': cliente.habilitado === false ? 'Inhabilitado' : 'Habilitado',
        }))

        exportToExcel({ data: rows, fileName: 'clientes', sheetName: 'Clientes' })
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
                        variant="contained"
                        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
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
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Exportar
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
                <Box sx={{
                    display: 'inline-flex',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: 4,
                    p: '4px',
                    gap: '5px',
                }}>
                    {FILTROS.map(f => (
                        <Button
                            key={f.value}
                            onClick={() => { setFiltroEstado(f.value); setPage(1) }}
                            size="small"
                            disableElevation
                            disableRipple
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                px: 2,
                                py: 0.5,
                                minWidth: 0,
                                fontWeight: filtroEstado === f.value ? 600 : 400,
                                backgroundColor: filtroEstado === f.value ? theme.palette.background.paper : 'transparent',
                                color: filtroEstado === f.value ? theme.palette.text.primary : theme.palette.text.secondary,
                                boxShadow: filtroEstado === f.value
                                    ? '0 1px 4px rgba(0,0,0,0.12)'
                                    : 'none',
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: filtroEstado === f.value ? theme.palette.background.paper : 'transparent',
                                    color: filtroEstado === f.value ? theme.palette.text.primary : theme.palette.text.medium,
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
                                        direction={sortBy.field === 'nombre' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('nombre')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
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
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CLIENTE) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setClienteEditar(cliente); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
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

            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, pt: 1.5,
            }}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Mostrando {from}–{to} de {total} resultado{total !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>
                            Filas
                        </Typography>
                        <Select
                            value={rowsPerPage}
                            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                            size="small"
                            renderValue={(value) => value}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem',
                                borderRadius: 2,
                                '& .MuiSelect-select': { py: 0.6, pl: 1.5, pr: '28px !important' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                    borderWidth: '1px',
                                },
                                '&.Mui-focused': {
                                    boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}`,
                                },
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
                                            minWidth: 80,
                                            '& .MuiMenuItem-root': {
                                                fontSize: '0.82rem',
                                                py: 0.9,
                                                px: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: 2,
                                                '&:hover': { backgroundColor: theme.palette.primary.light },
                                                '&.Mui-selected': {
                                                    backgroundColor: 'transparent',
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary,
                                                },
                                                '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.light },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {[5, 10, 25].map(n => (
                                <MenuItem key={n} value={n}>
                                    {n}
                                    {rowsPerPage === n && (
                                        <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                    )}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Pagination
                        count={totalPages}
                        page={safePage}
                        onChange={(_, val) => setPage(val)}
                        size="small"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '0.82rem',
                                borderRadius: '8px',
                                minWidth: 34,
                                height: 34,
                                mx: 0.2,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                '& .MuiTouchRipple-root': { display: 'none' },
                            },
                            '& .MuiPaginationItem-ellipsis': {
                                border: 'none',
                            },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: theme.palette.primary.main,
                                borderColor: theme.palette.primary.main,
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: theme.palette.primary.darker },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: theme.palette.background.subtle,
                                borderColor: theme.palette.divider,
                            },
                        }}
                    />
                </Box>
            </Box>

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
                            .then(() => setSnackbar({ open: true, message: `Cliente ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, severity: habilitadoActual ? 'warning' : 'success' }))
                            .catch(() => {})
                    }
                }}
                onConfirm={handleConfirmarToggle}
            />

            <RegistrarCliente
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    setSnackbar({ open: true, message: 'Cliente registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarCliente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setClienteEditar(null) }}
                cliente={clienteEditar}
                onSuccess={() => {
                    setSnackbar({ open: true, message: 'Cliente actualizado correctamente', severity: 'success' })
                }}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontSize: '0.85rem',
                    }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarCliente

