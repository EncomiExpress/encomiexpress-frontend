import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import RegistrarCliente from './RegistrarCliente'
import ActualizarCliente from './ActualizarCliente'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

const CampoFila = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color="#2D3748">
            {String(value ?? '-')}
        </Typography>
    </Box>
)

const ModalConsultar = ({ cliente, onClose }) => {
    const theme = useTheme()
    if (!cliente) return null
    const estado = cliente.habilitado ? 'Habilitado' : 'Inhabilitado'

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Perfil</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                    Información del perfil del cliente
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar sx={{ 
                        backgroundColor: cliente.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg, 
                        color: cliente.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color, 
                        width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 
                    }}>
                        {cliente.iniciales && cliente.iniciales !== 'U' ? cliente.iniciales : (cliente.nombre?.[0] || '') + (cliente.apellido?.[0] || '') || 'C'}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                            {cliente.nombre} {cliente.apellido}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                            {cliente.email}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Cliente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Identificación y datos personales
                    </Typography>

                    <CampoFila label="Identificación" value={`${cliente.tipoIdentificacion} ${cliente.numeroIdentificacion}`} />
                    <CampoFila label="Nombre" value={cliente.nombre} />
                    <CampoFila label="Apellido" value={cliente.apellido} />
                </Paper>

                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Información de Contacto</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Datos de contacto y estado de la cuenta
                    </Typography>

                    <CampoFila label="Teléfono" value={cliente.telefono} />
                    <CampoFila label="Email" value={cliente.email} />
                    <CampoFila label="Dirección" value={cliente.direccion} />
                    <CampoFila label="Estado" value={estado} />
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const ListarCliente = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const { clientes, total, loading, error, fetchClientes, actualizarEstadoCliente } = useClientes()
    const { tienePermiso, PERMISOS } = useAuth()
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [clienteEditar, setClienteEditar] = useState(null)

    useEffect(() => {
        let active = true
        const controller = new AbortController()

        const cargar = async () => {
            await fetchClientes(controller.signal, {
                page,
                limit: rowsPerPage,
                estado: filtroEstado === 'todo' ? undefined : filtroEstado,
                q: busqueda.trim() || undefined,
            })
        }

        cargar()
        return () => {
            active = false
            controller.abort()
        }
    }, [page, rowsPerPage, filtroEstado, busqueda, fetchClientes])

    const handleToggleHabilitado = async (id, nuevoEstado) => {
        try {
            await actualizarEstadoCliente(id, nuevoEstado)
            setSnackbar({ open: true, message: `Cliente ${nuevoEstado ? 'habilitado' : 'inhabilitado'} correctamente`, severity: 'success' })
            await fetchClientes(undefined, { page, limit: rowsPerPage, estado: filtroEstado === 'todo' ? undefined : filtroEstado, q: busqueda.trim() || undefined })
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al cambiar el estado', severity: 'error' })
        }
    }

    const cargarClientes = async () => {
        await fetchClientes(undefined, { page, limit: rowsPerPage, estado: filtroEstado === 'todo' ? undefined : filtroEstado, q: busqueda.trim() || undefined })
    }

    useEffect(() => {
        cargarClientes()
    }, [page, rowsPerPage, filtroEstado, busqueda])

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    const totalClientes = total
    const totalActivos = clientes.filter(c => c.habilitado).length
    const totalInactivos = clientes.filter(c => !c.habilitado).length
    const hayFiltrosActivos = busqueda.trim() !== '' || filtroEstado !== 'todo'
    const paginatedClientes = clientes

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Clientes
                        </Typography>
                        {!loading && !error && (
                            <Chip
                                label={`${clientes.length} registrado${clientes.length !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    backgroundColor: '#F3F4F6',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    fontSize: '0.72rem',
                                    height: 22,
                                    borderRadius: 10,
                                }}
                            />
                        )}
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los clientes registrados en el sistema.
                    </Typography>
                </Box>
                {tienePermiso(PERMISOS.REGISTRAR_CLIENTE) && (
                    <Button
                        onClick={() => setModalRegistrarOpen(true)}
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                                boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
                            },
                        }}
                    >
                        Nuevo cliente
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    Error al cargar los clientes: {error}
                </Alert>
            )}

            <Box sx={{
                display: 'inline-flex',
                backgroundColor: '#FFECEC',
                borderRadius: 4,
                p: '4px',
                mb: 2.5,
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
                            backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                            color: filtroEstado === f.value ? theme.palette.text.primary : '#B05050',
                            boxShadow: filtroEstado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                                color: filtroEstado === f.value ? theme.palette.text.primary : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <TextField
                    size="small"
                    placeholder="Buscar clientes..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': {
                                boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
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

                {hayFiltrosActivos && (
                    <Chip
                        label="Limpiar"
                        size="small"
                        icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={limpiarFiltros}
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                    />
                )}

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        '&:hover': { backgroundColor: theme.palette.primary.light },
                    }}
                >
                    Exportar
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Email</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
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
                                    </TableCell>
                                </TableRow>
                            ) : paginatedClientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {clientes.length === 0
                                                ? 'No hay clientes registrados en el sistema.'
                                                : busqueda.trim() !== ''
                                                    ? 'No se encontraron clientes que coincidan con la búsqueda.'
                                                    : 'No se encontraron clientes en este estado.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedClientes.map(cliente => (
                                    <TableRow
                                        key={cliente.idCliente}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: cliente.habilitado ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>
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
                                                    <Tooltip title={cliente.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleToggleHabilitado(cliente.idCliente, !cliente.habilitado)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            {cliente.habilitado ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status.disabled2.color }} />}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
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
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E57373',
                                    borderWidth: '1px',
                                },
                                '&.Mui-focused': {
                                    boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
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
                                                '&:hover': { backgroundColor: '#FFF5F5' },
                                                '&.Mui-selected': {
                                                    backgroundColor: 'transparent',
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary,
                                                },
                                                '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
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
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            <ModalConsultar cliente={clienteConsulta} onClose={() => setClienteConsulta(null)} />

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

