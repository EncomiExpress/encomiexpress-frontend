import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientes } from '../../Context/ClienteContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Avatar, Select, MenuItem, Pagination
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    secondary: '#1A2E6E',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: '#1a0e0c',
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

// ── Fila de campo reutilizable ──
const CampoFila = ({ label, value, esEstado }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        {esEstado ? (
            <Chip
                label={value}
                size="small"
                sx={{
                    backgroundColor: value === 'Habilitado' ? '#DCFCE7' : '#F3F4F6',
                    color: value === 'Habilitado' ? '#16A34A' : '#9CA3AF',
                    fontWeight: 600, fontSize: '0.72rem',
                    height: 22, borderRadius: 10, border: 'none',
                }}
            />
        ) : (
            <Typography variant="body2" fontWeight={500} color="#2D3748">
                {String(value ?? '—')}
            </Typography>
        )}
    </Box>
)

// ── Modal Consultar ──
const ModalConsultar = ({ cliente, onClose }) => {
    if (!cliente) return null
    const estado = cliente.habilitado ? 'Habilitado' : 'Inhabilitado'

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            {/* ── Fila superior: Perfil (ancho completo) ── */}
            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <PersonOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Perfil</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2.5 }}>
                    Información del perfil del cliente
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                        {cliente.nombre[0]}{cliente.apellido[0]}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1.1rem" color={COLORS.text}>
                            {cliente.nombre} {cliente.apellido}
                        </Typography>
                        <Typography variant="body2" color={COLORS.textMuted} mt={0.4}>
                            {cliente.email}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* ── Fila inferior: Detalles + Contacto ── */}
            <Box sx={{ display: 'flex', gap: 2 }}>

                {/* Detalles del Cliente */}
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Detalles del Cliente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Identificación y datos personales
                    </Typography>

                    <CampoFila label="Tipo identificación" value={cliente.tipoIdentificacion} />
                    <CampoFila label="Número identificación" value={cliente.numeroIdentificacion} />
                    <CampoFila label="Nombre" value={cliente.nombre} />
                    <CampoFila label="Apellido" value={cliente.apellido} />
                </Paper>

                {/* Información de Contacto */}
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Información de Contacto</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Datos de contacto y estado de la cuenta
                    </Typography>

                    <CampoFila label="Teléfono" value={cliente.telefono} />
                    <CampoFila label="Correo" value={cliente.email} />
                    <CampoFila label="Dirección" value={cliente.direccion} />
                    <CampoFila label="Ciudad" value={cliente.ciudad} />
                    <CampoFila label="Estado" value={estado} esEstado />
                </Paper>
            </Box>

            {/* Botón cerrar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

// ── Modal Inhabilitar ──
const ModalInhabilitar = ({ cliente, onClose, onConfirm }) => {
    if (!cliente) return null
    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ color: COLORS.primary, fontWeight: 700 }}>
                ¿Inhabilitar cliente?
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Estás a punto de inhabilitar a <strong>{cliente.nombre} {cliente.apellido}</strong>.
                    El cliente no podrá ser usado en el sistema hasta que sea habilitado nuevamente.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined"
                    sx={{ borderColor: COLORS.border, color: COLORS.text, borderRadius: 2, textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm(cliente.idCliente)} variant="contained"
                    sx={{ backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none', '&:hover': { backgroundColor: '#a01212' } }}>
                    Sí, inhabilitar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Filtros de estado ──
const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

// ── Componente principal ──
const ListarCliente = () => {
    const navigate = useNavigate()
    const { clientes, invalidateCliente } = useClientes()
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [clienteInhabilitar, setClienteInhabilitar] = useState(null)

    // ── Filtrado ──
    const clientesFiltrados = clientes.filter(c => {
        const q = busqueda.toLowerCase().trim()
        const coincideBusqueda = !q ||
            c.nombre.toLowerCase().includes(q) ||
            c.apellido.toLowerCase().includes(q) ||
            (`${c.nombre} ${c.apellido}`).toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.telefono.includes(q) ||
            c.numeroIdentificacion.includes(q) ||
            c.tipoIdentificacion.toLowerCase().includes(q)

        const coincideEstado =
            filtroEstado === 'todo' ||
            (filtroEstado === 'habilitado' && c.habilitado) ||
            (filtroEstado === 'inhabilitado' && !c.habilitado)

        return coincideBusqueda && coincideEstado
    })

    const handleInhabilitar = (id) => {
        invalidateCliente(id)
        setClienteInhabilitar(null)
    }

    const totalPages = Math.max(1, Math.ceil(clientesFiltrados.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedClientes = clientesFiltrados.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = clientesFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, clientesFiltrados.length)

    return (
        <Box sx={{ p: 3.5 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                        Clientes
                    </Typography>
                    <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                        Gestiona los clientes registrados en el sistema.
                    </Typography>
                </Box>
                <Button
                    onClick={() => navigate('/clientes/registrar')}
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    sx={{
                        backgroundColor: COLORS.primary,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                        '&:hover': {
                            backgroundColor: '#b91c1c',
                            boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
                        },
                    }}
                >
                    Nuevo cliente
                </Button>
            </Box>

            {/* ── Filtros de estado ── */}
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
                            color: filtroEstado === f.value ? COLORS.text : '#B05050',
                            boxShadow: filtroEstado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                                color: filtroEstado === f.value ? COLORS.text : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* ── Barra de búsqueda + Export ── */}
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
                                borderColor: '#CC1818',
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
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 20 }} />
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
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        borderColor: COLORS.border,
                        color: COLORS.text,
                        fontWeight: 500,
                        '&:hover': { backgroundColor: COLORS.primaryLight },
                    }}
                >
                    Exportar
                </Button>
            </Box>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Tipo Identificación</TableCell>
                                <TableCell sx={thStyle}>N° Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Correo</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 110 }} />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedClientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            No se encontraron clientes con los filtros aplicados.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedClientes.map(cliente => (
                                    <TableRow
                                        key={cliente.idCliente}
                                        sx={{
                                            '&:hover': { backgroundColor: COLORS.hoverBg },
                                            transition: 'background-color 0.15s',
                                        }}
                                    >
                                        {/* Nombre */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 34, height: 34,
                                                    backgroundColor: cliente.habilitado ? '#FFCDD2' : '#E0E0E0',
                                                    fontSize: '0.73rem',
                                                    fontWeight: 700,
                                                    color: cliente.habilitado ? '#C62828' : '#8E8E8E',
                                                }}>
                                                    {cliente.nombre[0]}{cliente.apellido[0]}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={COLORS.text} noWrap>
                                                    {cliente.nombre} {cliente.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Tipo ID */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {cliente.tipoIdentificacion}
                                        </TableCell>

                                        {/* Número ID */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {cliente.numeroIdentificacion}
                                        </TableCell>

                                        {/* Teléfono */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {cliente.telefono}
                                        </TableCell>

                                        {/* Correo */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5, maxWidth: 200 }}>
                                            <Typography variant="body2" color={COLORS.text} noWrap>
                                                {cliente.email}
                                            </Typography>
                                        </TableCell>

                                        {/* Estado */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={cliente.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: cliente.habilitado ? '#DCFCE7' : '#F3F4F6',
                                                    color: cliente.habilitado ? '#16A34A' : '#9CA3AF',
                                                    fontWeight: 600,
                                                    fontSize: '0.72rem',
                                                    height: 22,
                                                    borderRadius: 10,
                                                    border: 'none',
                                                }}
                                            />
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Ver detalle">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setClienteConsulta(cliente)}
                                                        sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                    >
                                                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/clientes/actualizar/${cliente.idCliente}`)}
                                                        sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                    >
                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {cliente.habilitado && (
                                                    <Tooltip title="Inhabilitar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setClienteInhabilitar(cliente)}
                                                            sx={{ color: COLORS.primary, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <BlockOutlinedIcon sx={{ fontSize: 18 }} />
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

            {/* ── Paginación ── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, pt: 1.5,
            }}>
                <Typography variant="body2" color={COLORS.textMuted}>
                    Mostrando {from}–{to} de {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color={COLORS.textMuted} fontWeight={500}>
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
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E57373',
                                    borderWidth: '1px',
                                },
                                '&.Mui-focused': {
                                    boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
                                },
                                '& .MuiSelect-icon': { color: COLORS.textMuted, fontSize: 18 },
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
                                                    color: COLORS.text,
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
                                        <CheckOutlinedIcon sx={{ fontSize: 14, color: COLORS.textMuted }} />
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
                                color: COLORS.text,
                                border: `1px solid ${COLORS.border}`,
                                '& .MuiTouchRipple-root': { display: 'none' },
                            },
                            '& .MuiPaginationItem-ellipsis': {
                                border: 'none',
                            },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: COLORS.primary,
                                borderColor: COLORS.primary,
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: '#a01212' },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: COLORS.hoverBg,
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            <ModalConsultar cliente={clienteConsulta} onClose={() => setClienteConsulta(null)} />
            <ModalInhabilitar
                cliente={clienteInhabilitar}
                onClose={() => setClienteInhabilitar(null)}
                onConfirm={handleInhabilitar}
            />
        </Box>
    )
}

export default ListarCliente
