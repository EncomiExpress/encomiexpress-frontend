import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton,
    TextField, InputAdornment, Tooltip, CircularProgress, Dialog,
    Select, MenuItem, FormControl,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import CloseIcon from '@mui/icons-material/Close'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import { getPaquetesDevueltos, getAniosDisponiblesPaquetesDevueltos } from '../../shared/services/paqueteService.js'
import { formatFechaHora } from '../../shared/utils/formatters.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                },
            },
        },
    },
})

const MESES = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
]

const ListarPaqueteDevuelto = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const navigate = useNavigate()
    const { usuario } = useAuth()

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paquetes, setPaquetes] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [imagenAmpliada, setImagenAmpliada] = useState(null)
    const initialLoad = useRef(true)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    const fetchPaquetes = useCallback((signal) => {
        return getPaquetesDevueltos({
            page, limit: rowsPerPage, q: debouncedSearch.trim() || undefined,
            anio: filtroAnio || undefined, mes: filtroMes || undefined,
        }, signal)
    }, [page, rowsPerPage, debouncedSearch, filtroAnio, filtroMes])

    useEffect(() => {
        getAniosDisponiblesPaquetesDevueltos()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        let cancelled = false

        const cargar = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetchPaquetes(controller.signal)
                if (!cancelled) {
                    setPaquetes(res?.data || [])
                    setTotal(res?.total || 0)
                }
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        cargar()
        return () => { cancelled = true; controller.abort() }
    }, [fetchPaquetes])

    useEffect(() => {
        if (!loading) { initialLoad.current = false }
    }, [loading])

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Paquetes devueltos
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Paquetes que el conductor marcó como devueltos durante el reparto.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={filtroAnio}
                            onChange={e => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                            displayEmpty
                            renderValue={v => v || 'Año'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroAnio ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}
                        >
                            <MenuItem value="">Año</MenuItem>
                            {aniosDisponibles.map(anio => (
                                <MenuItem key={anio} value={String(anio)}>
                                    {anio}
                                    {filtroAnio === String(anio) && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Tooltip title={filtroAnio ? '' : 'Primero elige un año'}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroMes}
                                onChange={e => { setFiltroMes(e.target.value); setPage(1) }}
                                displayEmpty
                                disabled={!filtroAnio}
                                renderValue={v => v ? (MESES.find(m => m.value === v)?.label || v) : (filtroAnio ? 'Todos' : 'Mes')}
                                IconComponent={KeyboardArrowDownOutlinedIcon}
                                sx={{
                                    fontSize: '0.82rem', borderRadius: 4,
                                    color: filtroMes ? theme.palette.text.primary : theme.palette.text.secondary,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                    '& .MuiTouchRipple-root': { display: 'none' },
                                }}
                                MenuProps={filterMenuProps}
                            >
                                <MenuItem value="">{filtroAnio ? 'Todos' : 'Mes'}</MenuItem>
                                {MESES.map(mes => (
                                    <MenuItem key={mes.value} value={mes.value}>
                                        {mes.label}
                                        {filtroMes === mes.value && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Tooltip>
                </Box>

                <TextField
                    size="small" placeholder="Buscar paquetes..."
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

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                <TableCell sx={thStyle}>Guía</TableCell>
                                <TableCell sx={thStyle}>Cliente</TableCell>
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>Fecha último estado</TableCell>
                                <TableCell sx={thStyle}>Observación</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando paquetes devueltos...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los paquetes devueltos. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && paquetes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Inventory2OutlinedIcon sx={{ fontSize: 32, color: theme.palette.text.disabled }} />
                                            <Typography color={theme.palette.text.secondary} variant="body2">
                                                {debouncedSearch.trim()
                                                    ? 'No se encontraron paquetes devueltos que coincidan con la búsqueda.'
                                                    : 'No hay paquetes devueltos en este momento.'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paquetes.map(paquete => {
                                    const cliente = paquete.encomienda?.cliente
                                    const ruta = paquete.asignacion?.ruta
                                    return (
                                        <TableRow
                                            key={paquete.idPaquete}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                                                    {paquete.numeroGuia}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {cliente ? `${cliente.nombre} ${cliente.apellido}` : '—'}
                                                </Typography>
                                                <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                                                    {cliente?.email || 'Sin correo registrado'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={theme.palette.text.primary}>
                                                    {ruta?.origen || '—'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={theme.palette.text.primary}>
                                                    {paquete.fechaUltimoEstado ? formatFechaHora(paquete.fechaUltimoEstado) : '—'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5, maxWidth: 260 }}>
                                                <Typography variant="body2" color={theme.palette.text.secondary} noWrap>
                                                    {paquete.observacionEstado || '—'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver venta">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/ventas/listar?highlight=${paquete.idEncomiendaVenta}`)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {paquete.fotoEntrega ? (
                                                        <Tooltip title="Ver evidencia">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setImagenAmpliada(paquete.fotoEntrega)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                                            >
                                                                <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Sin evidencia adjunta">
                                                            <span>
                                                                <IconButton size="small" disabled>
                                                                    <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
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

            {imagenAmpliada && (
                <Dialog open onClose={() => setImagenAmpliada(null)} maxWidth="md"
                    slotProps={{ paper: { sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' } } }}>
                    <Box sx={{ position: 'relative' }}>
                        <IconButton onClick={() => setImagenAmpliada(null)} size="small" sx={{
                            position: 'absolute', right: -16, top: -16, backgroundColor: theme.palette.background.paper,
                            boxShadow: 2, '&:hover': { backgroundColor: theme.palette.background.paper },
                        }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                        <Box component="img" src={imagenAmpliada} alt="Evidencia de entrega"
                            sx={{ maxWidth: '80vw', maxHeight: '85vh', display: 'block', borderRadius: 2 }} />
                    </Box>
                </Dialog>
            )}
        </Box>
    )
}

export default ListarPaqueteDevuelto
