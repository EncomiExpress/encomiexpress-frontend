import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLES } from '../../Context/AuthContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    TextField, IconButton, Tooltip, Button, Dialog, DialogTitle, 
    DialogContent, DialogActions, Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PeopleIcon from '@mui/icons-material/People'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'

const COLORS = {
    primary: '#CC1818',
    secondary: '#1A2E6E',
    text: '#2D3748',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

// ── Modal Consultar ──
const ModalConsultar = ({ rol, onClose }) => {
    if (!rol) return null
    
    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: COLORS.secondary, width: 36, height: 36, fontSize: '0.85rem' }}>
                    {rol.nombre[0]}
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={COLORS.secondary}>
                        {rol.nombre}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>Detalle del rol</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2">
                    <strong>ID:</strong> {rol.id}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Nombre:</strong> {rol.nombre}
                </Typography>
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

// ── Componente principal ──
const ListarRol = () => {
    const navigate = useNavigate()
    const { tienePermiso, PERMISOS } = useAuth()
    
    const roles = Object.values(ROLES)
    const [busqueda, setBusqueda] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [rolConsulta, setRolConsulta] = useState(null)

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

    // ── Filtrado ──
    const rolesFiltrados = roles.filter(r => {
        const q = busqueda.toLowerCase()
        if (!q) return true
        return r.nombre.toLowerCase().includes(q)
    })

    return (
        <Box sx={{ p: 1 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PeopleIcon sx={{ color: COLORS.primary, fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.secondary}>
                            Roles
                        </Typography>
                        <Typography variant="caption" color={COLORS.textMuted}>
                            {rolesFiltrados.length} resultado{rolesFiltrados.length !== 1 ? 's' : ''} encontrado{rolesFiltrados.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                {puedeRegistrar && (
                    <Button
                        onClick={() => navigate('/roles/registrar')}
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: COLORS.primary,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { backgroundColor: '#a01212' }
                        }}
                    >
                        Nuevo rol
                    </Button>
                )}
            </Box>

            {/* ── Filtros ── */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: COLORS.textMuted, mr: 1 }} />,
                            endAdornment: busqueda && (
                                <ClearIcon sx={{ cursor: 'pointer', color: COLORS.textMuted }} onClick={() => setBusqueda('')} />
                            )
                        }}
                    />
                </Box>
            </Paper>

            {/* ── Tabla ── */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rolesFiltrados
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((rol) => (
                                    <TableRow key={rol.id} hover sx={{ '&:hover': { backgroundColor: COLORS.hoverBg } }}>
                                        <TableCell>{rol.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{rol.nombre}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Consultar">
                                                <IconButton size="small" onClick={() => setRolConsulta(rol)}>
                                                    <VisibilityIcon fontSize="small" sx={{ color: COLORS.secondary }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rolesFiltrados.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
                />
            </Paper>

            {/* ── Modales ── */}
            <ModalConsultar rol={rolConsulta} onClose={() => setRolConsulta(null)} />
        </Box>
    )
}

export default ListarRol


