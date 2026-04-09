import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, ROLES } from '../../Context/AuthContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, Pagination, Chip, Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'

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

const filterSelectSx = {
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
    '&:hover': { backgroundColor: 'transparent' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E57373', borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
    '& .MuiSelect-icon': { color: '#8A94A6', fontSize: 18 },
    '& .MuiTouchRipple-root': { display: 'none' },
}

const filterMenuProps = {
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    '&:hover': { backgroundColor: '#FFF5F5' },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: '#1a0e0c' },
                    '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
                },
            },
        },
    },
}

const getRolColor = (nombre) => {
    const colors = {
        'Administrador': { bg: '#FFCDD2', color: '#C62828' },
        'Gerente': { bg: '#FFEBEE', color: '#D32F2F' },
        'Vendedor': { bg: '#FFECB3', color: '#FFA000' },
        'Conductor': { bg: '#F8BBD9', color: '#C2185B' },
        'Auxiliar': { bg: '#FFE0B2', color: '#E65100' },
    }
    return colors[nombre] || { bg: '#F5F5F5', color: '#616161' }
}

// ── Modal Consultar ──
const ModalConsultar = ({ rol, onClose }) => {
    if (!rol) return null

    const rolStyle = getRolColor(rol.nombre)
    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 36, height: 36 }}>
                    <AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={COLORS.secondary}>
                        Rol #{rol.id}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>
                        Información del rol de usuario
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <SecurityOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Datos del Rol</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                            Información principal del rol
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                width: 50, height: 50, borderRadius: 2,
                                backgroundColor: rolStyle.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 24, color: rolStyle.color }} />
                            </Box>
                            <Box>
                                <Typography fontWeight={700} color={COLORS.text}>
                                    {rol.nombre}
                                </Typography>
                                <Typography variant="body2" color={COLORS.textMuted} mt={0.2}>
                                    {rol.descripcion || 'Sin descripción'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <SecurityOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Permisos</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                            Permisos asociados al rol
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9, borderTop: `1px solid ${COLORS.border}`, mt: 1, pt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>Total permisos</Typography>
                            <Chip
                                label={`${rol.permisos?.length || 0} permisos`}
                                size="small"
                                sx={{
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.72rem',
                                    height: 22,
                                    borderRadius: 10,
                                    border: 'none',
                                }}
                            />
                        </Box>

                        {rol.permisos && rol.permisos.length > 0 && (
                            <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
                                <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block" mb={1}>
                                    Lista de permisos
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {rol.permisos.slice(0, 10).map((permiso, idx) => (
                                        <Chip
                                            key={idx}
                                            label={permiso.replace(/_/g, ' ')}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#F3F4F6',
                                                color: COLORS.textMuted,
                                                fontWeight: 500,
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderRadius: 8,
                                                border: 'none',
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    ))}
                                    {rol.permisos.length > 10 && (
                                        <Chip
                                            label={`+${rol.permisos.length - 10} más`}
                                            size="small"
                                            sx={{
                                                backgroundColor: COLORS.primaryLight,
                                                color: COLORS.primary,
                                                fontWeight: 600,
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderRadius: 8,
                                                border: 'none',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                }}>
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
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [rolConsulta, setRolConsulta] = useState(null)

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

    // ── Filtrado ──
    const rolesFiltrados = roles.filter(r => {
        const q = busqueda.toLowerCase().trim()
        if (!q) return true
        return r.nombre.toLowerCase().includes(q) || 
               (r.descripcion || '').toLowerCase().includes(q)
    })

    const totalPages = Math.max(1, Math.ceil(rolesFiltrados.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedRoles = rolesFiltrados.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = rolesFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, rolesFiltrados.length)

    return (
        <Box sx={{ p: 3.5 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                            Roles
                        </Typography>
                        <Chip
                            label={`${roles.length} registrado${roles.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#F3F4F6',
                                color: COLORS.textMuted,
                                fontWeight: 500,
                                fontSize: '0.72rem',
                                height: 22,
                                borderRadius: 10,
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                        Gestiona los roles de usuario en el sistema.
                    </Typography>
                </Box>
                {puedeRegistrar && (
                    <Button
                        onClick={() => navigate('/roles/registrar')}
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
                        Nuevo rol
                    </Button>
                )}
            </Box>

            {/* ── Barra de búsqueda ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar roles..."
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
            </Box>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Rol</TableCell>
                                <TableCell sx={thStyle}>Descripción</TableCell>
                                <TableCell sx={thStyle}>Permisos</TableCell>
                                <TableCell sx={{ ...thStyle, width: 110 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            {roles.length === 0
                                                ? 'No hay roles registrados en el sistema.'
                                                : 'No se encontraron roles que coincidan con la búsqueda.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRoles.map(rol => {
                                    const rolStyle = getRolColor(rol.nombre)
                                    return (
                                        <TableRow
                                            key={rol.id}
                                            sx={{
                                                '&:hover': { backgroundColor: COLORS.hoverBg },
                                                transition: 'background-color 0.15s',
                                            }}
                                        >
                                            {/* Rol */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34,
                                                        backgroundColor: rolStyle.bg,
                                                        fontSize: '0.73rem',
                                                        fontWeight: 700,
                                                        color: rolStyle.color,
                                                    }}>
                                                        {rol.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={600} color={COLORS.text}>
                                                        {rol.nombre}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            {/* Descripción */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={COLORS.textMuted} sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {rol.descripcion || 'Sin descripción'}
                                                </Typography>
                                            </TableCell>

                                            {/* Permisos */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={`${rol.permisos?.length || 0} permisos`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: COLORS.primary,
                                                        color: 'white',
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
                                                            onClick={() => setRolConsulta(rol)}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            component={Link}
                                                            to={`/roles/actualizar/${rol.id}`}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
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

            {/* ── Paginación ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color={COLORS.textMuted} fontWeight={500}>
                    Mostrando {from}–{to} de {rolesFiltrados.length} resultado{rolesFiltrados.length !== 1 ? 's' : ''}
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
                                    borderColor: '#E57373', borderWidth: '1px',
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

            {/* ── Modales ── */}
            <ModalConsultar rol={rolConsulta} onClose={() => setRolConsulta(null)} />
        </Box>
    )
}

export default ListarRol
