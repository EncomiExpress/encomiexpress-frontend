import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Snackbar, Alert,
    Tooltip, Button, CircularProgress,
    Select, MenuItem, FormControl, Pagination, TableSortLabel,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarDestino from './RegistrarDestino'
import ActualizarDestino from './ActualizarDestino'
import ModalConsultarDestino from './ModalConsultarDestino'
import ModalInhabilitarDestino from './ModalInhabilitarDestino'


const NacionSVG = ({ color }) => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <g transform="translate(0,512) scale(0.1,-0.1)" fill={color} stroke="none">
            <path d="M2980 5033 c-8 -3 -38 -16 -65 -28 -28 -13 -62 -26 -75 -30 -46 -12
-90 -61 -90 -102 0 -13 -8 -24 -21 -28 -12 -4 -58 -32 -103 -63 l-81 -55 -80
2 c-85 2 -127 -8 -160 -39 -16 -15 -34 -19 -75 -18 -75 2 -107 -17 -221 -132
-70 -70 -99 -106 -104 -130 -4 -19 -14 -44 -21 -56 -8 -11 -16 -45 -18 -75 -5
-59 -20 -109 -34 -109 -13 0 -82 -72 -98 -102 -8 -15 -35 -41 -60 -59 -40 -27
-49 -30 -70 -20 -39 18 -98 13 -127 -9 -58 -46 -92 -139 -76 -210 9 -39 8 -42
-35 -83 -29 -27 -48 -56 -55 -84 -6 -23 -18 -54 -26 -70 -24 -45 -19 -114 10
-157 14 -21 36 -59 50 -85 21 -43 23 -53 13 -85 -9 -28 -9 -48 0 -81 10 -36 9
-50 -4 -82 -15 -35 -15 -45 0 -124 24 -126 23 -191 -4 -229 -35 -50 -38 -110
-6 -169 32 -63 24 -91 -35 -121 -29 -15 -46 -33 -58 -60 -10 -25 -26 -44 -44
-51 -15 -6 -35 -21 -45 -33 -9 -12 -29 -29 -45 -39 -40 -26 -84 -92 -92 -138
-4 -23 -14 -43 -26 -49 -25 -14 -65 -86 -73 -132 -9 -47 13 -101 51 -124 15
-10 58 -46 94 -80 78 -72 142 -118 204 -145 27 -12 51 -31 59 -48 8 -15 31
-42 50 -58 44 -40 187 -75 287 -72 59 2 73 -1 106 -24 60 -40 154 -79 201 -81
61 -3 97 -34 116 -98 21 -71 57 -121 103 -143 63 -30 96 -63 114 -118 10 -30
32 -64 53 -84 20 -19 36 -43 36 -54 0 -48 46 -102 117 -138 33 -17 63 -21 155
-23 107 -3 116 -1 162 25 44 25 53 26 84 16 19 -6 60 -9 91 -6 39 3 63 0 75
-9 18 -13 17 -18 -28 -104 -53 -106 -61 -170 -26 -228 24 -38 75 -72 111 -72
29 0 50 -20 68 -67 28 -70 106 -102 169 -69 40 21 56 51 86 170 23 87 33 161
66 480 6 59 20 152 32 205 23 109 19 188 -11 251 -10 22 -24 63 -31 91 -10 39
-24 64 -61 102 -29 30 -49 60 -49 73 0 21 3 22 35 13 133 -37 240 134 169 272
l-13 26 117 7 c64 3 126 9 138 12 18 5 22 0 28 -37 10 -60 66 -115 129 -124
38 -6 55 -3 94 16 91 46 109 130 60 284 -14 44 -29 103 -33 130 -8 64 -24 102
-59 144 l-29 33 28 50 c24 43 28 58 24 109 -4 49 -11 69 -50 126 -53 78 -68
134 -68 257 0 68 3 86 19 100 10 9 25 38 32 64 7 26 23 63 35 82 72 110 15
246 -120 285 -43 13 -62 13 -97 4 -65 -16 -165 -28 -246 -28 l-71 -1 -42 68
c-71 112 -118 152 -180 152 -17 0 -41 7 -54 15 -36 24 -117 30 -168 13 -25 -8
-53 -11 -68 -7 -14 4 -41 7 -61 8 -27 1 -40 8 -58 31 -20 28 -21 35 -10 67 23
69 15 137 -24 216 -19 40 -41 94 -47 120 -7 26 -25 65 -40 86 -21 28 -25 42
-18 55 5 9 18 60 29 113 25 123 57 182 120 222 32 19 58 46 75 78 24 42 37 52
103 83 122 56 191 134 191 215 0 74 -87 179 -168 203 -40 12 -105 15 -132 5z
m-365 -574 c-14 -27 -37 -100 -50 -160 -18 -82 -34 -126 -65 -177 -44 -75 -50
-117 -23 -163 18 -30 67 -59 101 -59 15 0 21 -9 25 -38 4 -20 21 -60 38 -87
l31 -49 -16 -52 c-32 -101 -18 -186 40 -244 14 -14 35 -40 47 -59 43 -68 61
-74 214 -78 78 -1 152 2 171 8 24 8 37 8 46 0 8 -7 32 -17 54 -24 36 -11 48
-22 94 -97 78 -124 81 -125 306 -124 100 0 182 -2 182 -6 0 -4 -15 -35 -32
-70 -32 -62 -33 -66 -33 -194 0 -171 28 -290 86 -364 18 -23 17 -24 -31 -70
-58 -57 -76 -108 -56 -157 14 -33 59 -75 82 -75 22 0 27 -21 8 -35 -13 -9 -34
-12 -65 -8 -49 6 -105 -15 -116 -43 -5 -13 -30 -15 -167 -12 -146 3 -164 1
-195 -17 -59 -35 -73 -75 -68 -187 3 -53 9 -104 15 -114 8 -14 4 -24 -19 -46
-38 -39 -52 -96 -46 -193 6 -96 25 -147 77 -200 22 -23 43 -57 49 -80 6 -22
17 -49 25 -60 21 -27 20 -65 -4 -176 -11 -52 -20 -105 -20 -118 0 -18 -4 -22
-17 -16 -10 4 -29 10 -43 13 -14 3 -40 18 -57 33 -51 44 -103 56 -156 35 -41
-15 -44 -15 -82 5 -54 27 -102 20 -172 -26 -44 -30 -62 -36 -96 -33 -41 3 -42
4 -47 43 -7 51 -33 90 -70 105 -23 10 -32 23 -44 64 -16 54 -33 75 -90 111
-100 62 -103 65 -117 113 -28 101 -227 253 -313 239 -38 -6 -41 -4 -150 82
-71 55 -124 64 -184 31 -50 -28 -105 -22 -124 15 -18 33 -115 115 -137 115
-23 0 -90 37 -131 72 l-31 28 22 29 c18 25 21 38 16 85 l-5 55 41 6 c62 10
142 68 167 121 11 24 20 48 20 53 0 5 11 23 25 39 14 17 31 45 37 64 6 18 24
47 41 65 50 53 48 170 -4 206 -16 12 -16 17 -3 72 16 70 18 156 4 239 -8 53
-7 63 11 93 17 27 20 43 15 86 -4 28 -6 86 -6 127 1 71 -1 80 -45 164 l-47 88
41 35 c23 19 55 55 72 79 19 28 37 44 50 44 12 0 36 15 55 34 31 31 34 39 34
94 l0 59 56 37 c32 22 66 55 82 81 21 35 34 46 67 54 75 19 121 89 108 165 -3
21 3 59 16 100 11 36 21 71 21 77 0 7 14 25 32 39 32 27 32 27 63 9 38 -24 92
-24 130 -1 17 11 44 45 62 77 l31 58 68 -2 c38 -1 80 2 94 8 14 5 26 10 28 10
1 1 -9 -22 -23 -50z"/>
        </g>
    </svg>
)

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

const ListarDestino = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [destinoVer, setDestinoVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, ciudad: '', habilitadoActual: null })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [destinoEditar, setDestinoEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'ciudad', dir: 'asc' })
    const initialLoad = useRef(true)

    const { destinos, total, loading, error, fetchDestinos, toggleHabilitado } = useDestino()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
      return () => clearTimeout(t)
    }, [searchTerm])

    const fetchDestinosBackend = useCallback(() => {
      fetchDestinos(undefined, {
        page,
        limit: rowsPerPage,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        sortBy: `${sortBy.field}.${sortBy.dir}`,
        q: debouncedSearch.trim() || undefined,
      })
    }, [page, rowsPerPage, filtroHabilitado, debouncedSearch, sortBy, fetchDestinos])

    useEffect(() => {
      fetchDestinosBackend()
    }, [fetchDestinosBackend])

    useEffect(() => {
      if (!loading) { initialLoad.current = false }
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


    const handleToggleHabilitado = (id, habilitadoActual, ciudad) => {
        setConfirmInhabilitar({ open: true, id, ciudad: ciudad || '', habilitadoActual })
    }

    const onConfirmar = async () => {
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            setSnackbar({
                open: true,
                message: confirmInhabilitar.habilitadoActual ? 'Destino inhabilitado correctamente.' : 'Destino habilitado correctamente.',
                severity: 'success',
            })
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'No se pudo cambiar el estado del destino.', severity: 'error' })
            throw err
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
                <Box sx={{
                    display: 'inline-flex',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: 4,
                    p: '4px',
                    gap: '5px',
                }}>
                    {FILTROS.map(f => (
                        <Button key={f.value} onClick={() => { setFiltroHabilitado(f.value); setPage(1) }}
                            size="small" disableElevation disableRipple
                            sx={{
                                borderRadius: 3, textTransform: 'none', fontSize: '0.75rem', px: 2, py: 0.5, minWidth: 0,
                                fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.secondary,
                                boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                border: 'none',
                                '&:hover': { backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent', color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.medium, border: 'none' },
                            }}>
                            {f.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small" placeholder="Buscar destinos..."
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
                                        <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(1) }}><ClearIcon sx={{ fontSize: 16 }} /></IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'ciudad'}
                                        direction={sortBy.field === 'ciudad' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('ciudad')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        Ciudad
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Departamento</TableCell>
                                <TableCell sx={thStyle}>Tarifa Base</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando destinos...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <Typography variant="body2" color="error">No se pudieron cargar los destinos. Verifica la conexión con el servidor.</Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && destinos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo'
                                                ? 'No se encontraron destinos que coincidan con los filtros aplicados.'
                                                : debouncedSearch.trim()
                                                    ? 'No se encontraron destinos que coincidan con la búsqueda.'
                                                    : 'No hay destinos registrados en el sistema.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                destinos.map(destino => (
                                    <TableRow key={destino.idDestino}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: destino.habilitado ? 1 : 0.55,
                                        }}>

                                        {/* Ciudad */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Box sx={{
                                                    width: 28, height: 30, flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <NacionSVG color={destino.habilitado ? theme.palette.primary.main : theme.palette.text.disabled} />
                                                </Box>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {destino.ciudad}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Departamento */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {destino.departamento}
                                        </TableCell>

                                        {/* Tarifa base */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={destino.tarifaBase !== undefined
                                                    ? `$${Number(destino.tarifaBase).toLocaleString('es-CO')}`
                                                    : '—'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    backgroundColor: theme.palette.primary.light,
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    borderRadius: '2px',
                                                    height: 26,
                                                }}
                                            />
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_DESTINO) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setDestinoVer(destino)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small"
                                                            onClick={() => { setDestinoEditar(destino); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                                                    <Tooltip title={destino.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton size="small"
                                                            onClick={() => handleToggleHabilitado(destino.idDestino, destino.habilitado, destino.ciudad)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            {destino.habilitado
                                                                ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color || theme.palette.text.disabled }} />
                                                            }
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
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                    borderWidth: '1px',
                                },
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
                                            minWidth: 80,
                                            '& .MuiMenuItem-root': {
                                                fontSize: '0.82rem', py: 0.9, px: 2,
                                                display: 'flex', justifyContent: 'space-between', gap: 2,
                                                '&:hover': { backgroundColor: theme.palette.primary.light },
                                                '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                                                '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.light },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {[5, 10, 25].map(n => (
                                <MenuItem key={n} value={n}>{n}
                                    {rowsPerPage === n && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
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
                            '& .MuiPaginationItem-ellipsis': { border: 'none' },
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

            {destinoVer && (
                <ModalConsultarDestino destino={destinoVer} onClose={() => setDestinoVer(null)} />
            )}

            {/* ── Modales registrar / actualizar ── */}
            <RegistrarDestino
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchDestinos()
                    setSnackbar({ open: true, message: 'Destino registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarDestino
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setDestinoEditar(null) }}
                destino={destinoEditar}
                onSuccess={() => {
                    fetchDestinos()
                    setSnackbar({ open: true, message: 'Destino actualizado correctamente', severity: 'success' })
                }}
            />

            <ModalInhabilitarDestino
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, ciudad: '', habilitadoActual: null })}
                onConfirm={onConfirmar}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000}
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

export default ListarDestino

