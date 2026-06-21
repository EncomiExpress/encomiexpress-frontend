import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, Pagination, CircularProgress, TableSortLabel, Tabs, Tab
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import * as vehiculoService from '../../shared/services/vehiculoService'
import RegistrarPropietario from './RegistrarPropietario'
import ActualizarPropietario from './ActualizarPropietario'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const ListarPropietario = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [propietarioVer, setPropietarioVer] = useState(null)
    const [tabPropIndex, setTabPropIndex] = useState(0)
    const [tabPropVehiculos, setTabPropVehiculos] = useState({ data: [], loading: false })
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [propietarioEditar, setPropietarioEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'nombre', dir: 'asc' })
    const [localLoading, setLocalLoading] = useState(false)
    const initialLoad = useRef(true)

    const { propietarios, total, loading, error, fetchPropietarios, toggleHabilitado } = usePropietario()
    const effectiveLoading = loading || localLoading
    const { usuario, tienePermiso, PERMISOS } = useAuth()

    useEffect(() => {
      const t = setTimeout(() => { setDebouncedSearch(searchTerm); setLocalLoading(true) }, 300)
      return () => clearTimeout(t)
    }, [searchTerm])

    const fetchPropietariosBackend = useCallback(() => {
      fetchPropietarios(undefined, {
        page,
        limit: rowsPerPage,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        sortBy: `${sortBy.field}.${sortBy.dir}`,
        q: debouncedSearch.trim() || undefined,
      })
    }, [page, rowsPerPage, filtroHabilitado, debouncedSearch, sortBy, fetchPropietarios])

    useEffect(() => {
      fetchPropietariosBackend()
    }, [fetchPropietariosBackend])

    useEffect(() => {
      if (!loading) { setLocalLoading(false); initialLoad.current = false }
    }, [loading])

    const handleSort = (field) => {
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    useEffect(() => {
      if (!usuario) {
        navigate('/login')
      }
    }, [usuario, navigate])

    useEffect(() => {
        if (!propietarioVer || tabPropIndex !== 1) return
        setTabPropVehiculos({ data: [], loading: true })
        vehiculoService.getVehiculos(undefined, { idPropietario: propietarioVer.idPropietario, limit: 100 })
            .then(res => setTabPropVehiculos({ data: res?.data || [], loading: false }))
            .catch(() => setTabPropVehiculos({ data: [], loading: false }))
    }, [propietarioVer, tabPropIndex])

    const handleToggleHabilitado = async (id, habilitadoActual) => {
      try {
        await toggleHabilitado(id)
        setSnackbar({
          open: true,
          message: `Propietario ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`,
          severity: 'success',
        })
      } catch (err) {
        if (err?.details?.length > 0) {
          setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
        } else {
          setSnackbar({ open: true, message: err.message || 'Error al cambiar el estado', severity: 'error' })
        }
      }
    }

    const limpiarFiltros = () => { setSearchTerm(''); setFiltroHabilitado('todo'); setPage(1) }
    const limpiarBusqueda = () => { setSearchTerm(''); setPage(1) }
    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo'

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

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
                        Nuevo propietario
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'inline-flex', backgroundColor: theme.palette.primary.light, borderRadius: 4, p: '4px', gap: '5px' }}>
                    {FILTROS.map(f => (
                        <Button key={f.value} onClick={() => { setFiltroHabilitado(f.value); setPage(1) }} size="small" disableElevation disableRipple
                            sx={{
                                borderRadius: 3, textTransform: 'none', fontSize: '0.75rem', px: 2, py: 0.5, minWidth: 0,
                                fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.secondary,
                                boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                border: 'none',
                                '&:hover': { backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent', border: 'none' },
                            }}>
                            {f.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField size="small" placeholder="Buscar propietarios..."
                        sx={{
                            width: 320,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                            },
                        }}
                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} /></InputAdornment>,
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon sx={{ fontSize: 16 }} /></IconButton>
                                    </InputAdornment>
                                )
                            }
                        }} />
                </Box>
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
                            {effectiveLoading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando propietarios...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography color="error" variant="body2">{error}</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : !effectiveLoading && propietarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo'
                                                ? 'No se encontraron propietarios que coincidan con los filtros aplicados.'
                                                : debouncedSearch.trim()
                                                    ? 'No se encontraron propietarios que coincidan con la búsqueda.'
                                                    : 'No hay propietarios registrados en el sistema.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                propietarios.map((propietario) => (
                                    <TableRow key={propietario.idPropietario}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: propietario.habilitado ? 1 : 0.55,
                                        }}>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {propietario.tipoIdentificacion} {propietario.numeroIdentificacion}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{propietario.telefono || '—'}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{propietario.email || '—'}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Ver detalle">
                                                    <IconButton size="small" onClick={() => setPropietarioVer(propietario)}
                                                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton size="small"
                                                        onClick={() => { setPropietarioEditar(propietario); setModalActualizarOpen(true) }}
                                                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {tienePermiso(PERMISOS.GESTION_TRANSPORTE) && (
                                                    <Tooltip title={propietario.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton size="small"
                                                            onClick={() => handleToggleHabilitado(propietario.idPropietario, propietario.habilitado)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            {propietario.habilitado
                                                                ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color || '#9E9E9E' }} />}
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
                                '&:hover': { backgroundColor: theme.palette.darker },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: theme.palette.background.subtle,
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            {propietarioVer && (
                <Dialog open onClose={() => { setPropietarioVer(null); setTabPropIndex(0) }} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, backgroundColor: theme.palette.background.subtle } } }}>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Avatar sx={{
                                backgroundColor: propietarioVer.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                                color: propietarioVer.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                                width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                            }}>
                                {(propietarioVer.nombre?.[0] || '').toUpperCase()}{(propietarioVer.apellido?.[0] || '').toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                                    {propietarioVer.nombre} {propietarioVer.apellido}
                                </Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary}>Propietario</Typography>
                            </Box>
                        </Box>
                        <Tabs value={tabPropIndex} onChange={(_, v) => setTabPropIndex(v)} textColor="primary" indicatorColor="primary">
                            <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                            <Tab label={`Vehículos`} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                        </Tabs>
                    </Box>

                    {tabPropIndex === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tipo doc.</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.tipoIdentificacion}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>N° identificación</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.numeroIdentificacion}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Nombre</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.nombre}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Apellido</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.apellido || '—'}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                                <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PhoneOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem">Contacto y Flota</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.telefono || '—'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Email</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.email || '—'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tarjeta propiedad</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.tarjetaPropiedad || '—'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tipo de flota</Typography>
                                            <Typography variant="body2" fontWeight={500}>{propietarioVer.tipoFlota || '—'}</Typography>
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                            <Typography variant="body2" fontWeight={500} color={propietarioVer.habilitado ? '#2E7D32' : '#ef4444'}>
                                                {propietarioVer.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    )}

                    {tabPropIndex === 1 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
                                Vehículos registrados para este propietario
                            </Typography>
                            {tabPropVehiculos.loading
                                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                                : tabPropVehiculos.data.length === 0
                                ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin vehículos registrados</Typography>
                                : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Placa</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Marca / Modelo</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Tipo</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Habilitado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabPropVehiculos.data.map(v => (
                                                <TableRow key={v.idVehiculo} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                    <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.placa}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{v.marca} {v.modelo}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{v.tipo || '—'}</TableCell>
                                                    <TableCell>
                                                        <Chip label={v.estado || '—'} size="small" sx={{
                                                            backgroundColor: v.estado === 'disponible' ? '#E3F2FD' : v.estado === 'ocupado' ? '#FFF3E0' : '#FCE4EC',
                                                            color: v.estado === 'disponible' ? '#1565C0' : v.estado === 'ocupado' ? '#E65100' : '#C62828',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={v.habilitado ? 'Habilitado' : 'Inhabilitado'} size="small" sx={{
                                                            backgroundColor: v.habilitado ? '#E8F5E9' : '#F5F5F5',
                                                            color: v.habilitado ? '#2E7D32' : '#757575',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                        <Button onClick={() => { setPropietarioVer(null); setTabPropIndex(0) }} variant="contained"
                            sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                                boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            <RegistrarPropietario
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchPropietarios()
                    setSnackbar({ open: true, message: 'Propietario registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarPropietario
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setPropietarioEditar(null) }}
                propietario={propietarioEditar}
                onSuccess={() => {
                    fetchPropietarios()
                    setSnackbar({ open: true, message: 'Propietario actualizado correctamente', severity: 'success' })
                }}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="propietario"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3500}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarPropietario