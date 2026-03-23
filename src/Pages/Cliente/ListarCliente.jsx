import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientes } from '../../Context/ClienteContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    TextField, IconButton, Chip, Tooltip, InputAdornment,
    MenuItem, Select, FormControl, InputLabel, Button,
    Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import PeopleIcon from '@mui/icons-material/People'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'

const COLORS = {
    primary: '#CC1818',
    secondary: '#1A2E6E',
    text: '#2D3748',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    activeBg: '#FFE8E8',
    hoverBg: '#F9F9F9',
}

// ── Modal Consultar ──
const ModalConsultar = ({ cliente, onClose }) => {
    if (!cliente) return null
    const campos = [
        { label: 'ID', value: cliente.idCliente },
        { label: 'Tipo identificación', value: cliente.tipoIdentificacion },
        { label: 'Número identificación', value: cliente.numeroIdentificacion },
        { label: 'Nombre', value: cliente.nombre },
        { label: 'Apellido', value: cliente.apellido },
        { label: 'Teléfono', value: cliente.telefono },
        { label: 'Email', value: cliente.email },
        { label: 'Dirección', value: cliente.direccion },
        { label: 'Ciudad', value: cliente.ciudad },
        { label: 'Estado', value: cliente.habilitado ? 'Activo' : 'Inactivo' },
    ]
    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: COLORS.secondary, width: 36, height: 36, fontSize: '0.85rem' }}>
                    {cliente.nombre[0]}{cliente.apellido[0]}
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={COLORS.secondary}>
                        {cliente.nombre} {cliente.apellido}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>Detalle del cliente</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {campos.map(c => (
                        <Box key={c.label}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} textTransform="uppercase" letterSpacing={0.8}>
                                {c.label}
                            </Typography>
                            <Typography variant="body2" fontWeight={500} color={COLORS.text}>
                                {String(c.value)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained"
                    sx={{ backgroundColor: COLORS.secondary, borderRadius: 2, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Modal Inhabilitar ──
const ModalInhabilitar = ({ cliente, onClose, onConfirm }) => {
    if (!cliente) return null
    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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

// ── Componente principal ──
const ListarCliente = () => {
    const navigate = useNavigate()
    const { clientes, inhabilitarCliente } = useClientes()  // 👈 viene del context
    const [busqueda, setBusqueda] = useState('')
    const [filtroPor, setFiltroPor] = useState('todo')
    const [filtroTipoDoc, setFiltroTipoDoc] = useState('todos')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [clienteInhabilitar, setClienteInhabilitar] = useState(null)

    // ── Filtrado ──
    const clientesFiltrados = clientes.filter(c => {
        const q = busqueda.toLowerCase()
        let coincideBusqueda = true

        if (q) {
            switch (filtroPor) {
                case 'nombre': coincideBusqueda = c.nombre.toLowerCase().includes(q); break
                case 'apellido': coincideBusqueda = c.apellido.toLowerCase().includes(q); break
                case 'nombreApellido': coincideBusqueda = `${c.nombre} ${c.apellido}`.toLowerCase().includes(q); break
                case 'telefono': coincideBusqueda = c.telefono.includes(q); break
                case 'email': coincideBusqueda = c.email.toLowerCase().includes(q); break
                case 'identificacion': coincideBusqueda = c.numeroIdentificacion.includes(q); break
                default:
                    coincideBusqueda =
                        c.nombre.toLowerCase().includes(q) ||
                        c.apellido.toLowerCase().includes(q) ||
                        c.email.toLowerCase().includes(q) ||
                        c.telefono.includes(q) ||
                        c.numeroIdentificacion.includes(q)
            }
        }

        const coincideTipoDoc = filtroTipoDoc === 'todos' || c.tipoIdentificacion === filtroTipoDoc
        const coincideEstado =
            filtroEstado === 'todos' ||
            (filtroEstado === 'activo' && c.habilitado) ||
            (filtroEstado === 'inactivo' && !c.habilitado)

        return coincideBusqueda && coincideTipoDoc && coincideEstado
    })

    // 👈 ahora usa inhabilitarCliente del context
    const handleInhabilitar = (id) => {
        inhabilitarCliente(id)
        setClienteInhabilitar(null)
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroPor('todo')
        setFiltroTipoDoc('todos')
        setFiltroEstado('todos')
        setPage(0)
    }

    const hayFiltrosActivos = busqueda || filtroTipoDoc !== 'todos' || filtroEstado !== 'todos'

    return (
        <Box sx={{ p: 1 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PeopleIcon sx={{ color: COLORS.primary, fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.secondary}>
                            Clientes
                        </Typography>
                        <Typography variant="caption" color={COLORS.textMuted}>
                            {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    onClick={() => navigate('/clientes/registrar')}
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: COLORS.primary,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: '#a01212' }
                    }}
                >
                    + Nuevo cliente
                </Button>
            </Box>

            {/* ── Filtros y búsqueda ── */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${COLORS.border}`, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <FilterListIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                    <Typography variant="caption" fontWeight={700} color={COLORS.textMuted} textTransform="uppercase" letterSpacing={1}>
                        Filtros y búsqueda
                    </Typography>
                    {hayFiltrosActivos && (
                        <Chip
                            label="Limpiar"
                            size="small"
                            icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={limpiarFiltros}
                            sx={{ ml: 'auto', fontSize: '0.72rem', height: 24, cursor: 'pointer', backgroundColor: COLORS.activeBg, color: COLORS.primary }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Buscar por</InputLabel>
                        <Select value={filtroPor} label="Buscar por"
                            onChange={e => { setFiltroPor(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todo">Todo</MenuItem>
                            <MenuItem value="nombre">Nombre</MenuItem>
                            <MenuItem value="apellido">Apellido</MenuItem>
                            <MenuItem value="nombreApellido">Nombre y apellido</MenuItem>
                            <MenuItem value="telefono">Teléfono</MenuItem>
                            <MenuItem value="email">Correo</MenuItem>
                            <MenuItem value="identificacion">N° identificación</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Escribe para buscar..."
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setPage(0) }}
                        sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                                </InputAdornment>
                            ),
                            endAdornment: busqueda && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setBusqueda('')}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Tipo doc.</InputLabel>
                        <Select value={filtroTipoDoc} label="Tipo doc."
                            onChange={e => { setFiltroTipoDoc(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="CC">CC</MenuItem>
                            <MenuItem value="TI">TI</MenuItem>
                            <MenuItem value="NIT">NIT</MenuItem>
                            <MenuItem value="CE">CE</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Estado</InputLabel>
                        <Select value={filtroEstado} label="Estado"
                            onChange={e => { setFiltroEstado(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                {['#', 'Cliente', 'Identificación', 'Teléfono', 'Correo', 'Estado', 'Acciones'].map(col => (
                                    <TableCell key={col} sx={{
                                        fontWeight: 700, fontSize: '0.75rem', color: COLORS.textMuted,
                                        textTransform: 'uppercase', letterSpacing: 0.8, py: 1.5,
                                        borderBottom: `2px solid ${COLORS.border}`,
                                    }}>
                                        {col}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {clientesFiltrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            No se encontraron clientes con los filtros aplicados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clientesFiltrados
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((cliente, index) => (
                                        <TableRow key={cliente.idCliente}
                                            sx={{
                                                '&:hover': { backgroundColor: COLORS.hoverBg },
                                                opacity: cliente.habilitado ? 1 : 0.6,
                                                transition: 'background-color 0.15s',
                                            }}
                                        >
                                            <TableCell sx={{ fontSize: '0.8rem', color: COLORS.textMuted, py: 1.5 }}>
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                    <Avatar sx={{
                                                        width: 30, height: 30,
                                                        backgroundColor: cliente.habilitado ? COLORS.secondary : COLORS.textMuted,
                                                        fontSize: '0.7rem', fontWeight: 700,
                                                    }}>
                                                        {cliente.nombre[0]}{cliente.apellido[0]}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={600} color={COLORS.text} noWrap>
                                                        {cliente.nombre} {cliente.apellido}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={COLORS.textMuted} fontSize="0.78rem">
                                                    {cliente.tipoIdentificacion}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color={COLORS.text} fontSize="0.82rem">
                                                    {cliente.numeroIdentificacion}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.82rem', color: COLORS.text, py: 1.5 }}>
                                                {cliente.telefono}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.82rem', color: COLORS.text, py: 1.5 }}>
                                                {cliente.email}
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={cliente.habilitado ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.72rem', fontWeight: 600, height: 22,
                                                        backgroundColor: cliente.habilitado ? '#E8F5E9' : '#FFF3F3',
                                                        color: cliente.habilitado ? '#2E7D32' : COLORS.primary,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Consultar">
                                                        <IconButton size="small" onClick={() => setClienteConsulta(cliente)}
                                                            sx={{ color: COLORS.secondary, '&:hover': { backgroundColor: '#EEF2FF' } }}>
                                                            <VisibilityIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Actualizar">
                                                        <IconButton size="small"
                                                            onClick={() => navigate(`/clientes/actualizar/${cliente.idCliente}`)}
                                                            sx={{ color: '#F59E0B', '&:hover': { backgroundColor: '#FFFBEB' } }}>
                                                            <EditIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {cliente.habilitado && (
                                                        <Tooltip title="Inhabilitar">
                                                            <IconButton size="small" onClick={() => setClienteInhabilitar(cliente)}
                                                                sx={{ color: COLORS.primary, '&:hover': { backgroundColor: COLORS.activeBg } }}>
                                                                <BlockIcon sx={{ fontSize: 17 }} />
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

                <TablePagination
                    component="div"
                    count={clientesFiltrados.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                    sx={{ borderTop: `1px solid ${COLORS.border}`, fontSize: '0.8rem' }}
                />
            </Paper>

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