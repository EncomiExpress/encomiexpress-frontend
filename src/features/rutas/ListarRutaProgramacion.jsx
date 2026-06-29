import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl, Menu,
    Snackbar, Alert, Tooltip, Button,
    Avatar, CircularProgress, Pagination, TableSortLabel,
    Dialog, DialogContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'
import ModalConsultarRutaProgramacion from './ModalConsultarRutaProgramacion'
import ModalConfirmarEstado from './ModalConfirmarEstado'
import ModalInhabilitarRuta from './ModalInhabilitarRuta'
import { getPageOfRuta } from '../../shared/services/rutaService'
import { getEstadoColorRuta as getEstadoColor, getVehiculoEstadoDot, getConductorEstadoDot } from '../../shared/utils/estadoColors.js'

const renderEstadoDot = (estado, getEstadoColor) => {
    const color = getEstadoColor(estado).color
    if (estado === 'Cancelada') {
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color, lineHeight: 1 }}>−</Box>
    }
    if (estado === 'Completada') {
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color, lineHeight: 1 }}>✓</Box>
    }
    if (estado === 'Programada') {
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: `2px solid ${color}` }} />
    }
    return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: color, border: `2px solid ${color}` }} />
}

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

const PlacaDisplay = ({ placa, theme }) => {
    const letras = placa?.slice(0, 3) ?? ''
    const numeros = placa?.slice(3) ?? ''
    const c = theme.palette.primary.main
    return (
        <Box sx={{
            position: 'relative',
            width: 60,
            height: 25,
            backgroundColor: alpha(c, 0.07),
            border: `1.5px solid ${alpha(c, 0.28)}`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
                {letras}
            </Typography>
            <Box sx={{ width: 3, height: 3, backgroundColor: alpha(c, 0.5), borderRadius: '50%', mx: '2px', flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
                {numeros}
            </Typography>
        </Box>
    )
}

const formatHora12 = (hora) => {
    if (!hora) return null
    const [h, m] = hora.split(':').map(Number)
    const periodo = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${periodo}`
}

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const ESTADOS_RUTA = ['Programada', 'En Curso', 'Completada', 'Cancelada']

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    '&:hover': { backgroundColor: theme.palette.primary.light },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.light },
                },
            },
        },
    },
})

const MESES = [
    { value: '1',  label: 'Enero' },   { value: '2',  label: 'Febrero' },
    { value: '3',  label: 'Marzo' },   { value: '4',  label: 'Abril' },
    { value: '5',  label: 'Mayo' },    { value: '6',  label: 'Junio' },
    { value: '7',  label: 'Julio' },   { value: '8',  label: 'Agosto' },
    { value: '9',  label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
]

const ListarRutaProgramacion = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const highlightId = searchParams.get('highlight')
    const highlightRef = useRef(null)
    const hasScrolled = useRef(false)
    const hasNavigated = useRef(false)
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const [searchTerm, setSearchTerm]         = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [rutaVer, setRutaVer]               = useState(null)
    const [snackbar, setSnackbar]             = useState({ open: false, message: '', severity: 'success' })
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, idRuta: null, nombreRuta: '', habilitadoActual: null, estadoRuta: null })
    const [confirmEstado, setConfirmEstado]   = useState({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, vehiculo: null, conductor: null, confirmed: false })
    const [alertaBloqueo, setAlertaBloqueo]   = useState({ open: false, titulo: '', entidades: [] })
    const [estadoMenu, setEstadoMenu]         = useState({ anchor: null, id: null, estadoActual: null })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoRuta, setFiltroEstadoRuta] = useState('todo')
    const [filtroAnio, setFiltroAnio]         = useState('')
    const [filtroMes, setFiltroMes]           = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar]         = useState(null)
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [sortBy, setSortBy] = useState({ field: 'fechaSalida', dir: 'desc' })
    const initialLoad = useRef(true)

    const { rutasProgramadas, total, fetchRutasProgramadas, updateEstado, toggleHabilitado, loading, error } = useRutaProgramacion()
    const { getVehiculos } = useVehiculo()
    const { getConductores } = useConductor()
    const { destinos } = useDestino()

    const ahora      = new Date()
    const anioActual = ahora.getFullYear()

    useEffect(() => {
      if (!usuario) {
        navigate('/login')
      }
    }, [usuario, navigate])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    useEffect(() => {
        if (highlightId && highlightRef.current && !hasScrolled.current) {
            hasScrolled.current = true
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
        }
    })

    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfRuta(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])

    const buildRutasParams = () => ({
        page,
        limit: rowsPerPage,
        sortBy: `${sortBy.field}.${sortBy.dir}`,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        estado: filtroEstadoRuta === 'todo' ? undefined : filtroEstadoRuta,
        anio: filtroAnio || undefined,
        mes: filtroMes || undefined,
        q: debouncedSearch.trim() || undefined,
    })

    useEffect(() => {
        if (!usuario) return
        fetchRutasProgramadas(buildRutasParams())
    }, [fetchRutasProgramadas, page, rowsPerPage, debouncedSearch, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, sortBy, usuario])

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

    // Años disponibles desde fechaSalida
    const aniosDisponibles = useMemo(() => {
        const anios = new Set()
        rutasProgramadas.forEach(r => {
            if (r.fechaSalida) {
                const [anio] = r.fechaSalida.split('-')
                if (anio) anios.add(anio)
            }
        })
        return Array.from(anios).sort((a, b) => b - a)
    }, [rutasProgramadas])

    // Helpers para mostrar datos relacionados (ya están en los contextos)
    const getVehiculoPlaca = (id) => {
        const v = getVehiculos().find(v => v.idVehiculo === id)
        return v ? v.placa : 'N/A'
    }
    const getConductorNombre = (id) => {
        const c = getConductores().find(c => c.idConductor === id)
        return c ? `${c.nombre} ${c.apellido}` : 'N/A'
    }
const getDestinoNombre = (id) => {
  const d = destinos.find(d => d.idDestino === id);
  return d ? (d.nombre || `${d.ciudad}, ${d.departamento}`) : 'N/A';
};

    // Si la API devuelve los datos relacionados embebidos, los usamos directamente
    const resolveVehiculo = (ruta) =>
        ruta.vehiculo?.placa ?? getVehiculoPlaca(ruta.idVehiculo)

    const resolveConductor = (ruta) => {
        if (ruta.conductor?.usuario) {
            return `${ruta.conductor.usuario.nombre} ${ruta.conductor.usuario.apellido}`
        }
        return getConductorNombre(ruta.idConductor)
    }

const resolveDestino = (ruta) =>
  ruta.destino
    ? `${ruta.destino.ciudad}, ${ruta.destino.departamento}`
    : getDestinoNombre(ruta.idDestino);

    const getId = (ruta) => ruta.idRuta ?? ruta.idRutaProgramada

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroHabilitado('todo')
        setFiltroEstadoRuta('todo')
        setFiltroAnio('')
        setFiltroMes('')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoRuta !== 'todo' || filtroAnio || filtroMes

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    const ejecutarCambioEstado = async (id, nuevoEstado) => {
        try {
            await updateEstado(id, nuevoEstado)
            setSnackbar({ open: true, message: `Estado actualizado a "${nuevoEstado}".`, severity: 'success' })
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                setSnackbar({ open: true, message: err.message || 'Error al actualizar estado', severity: 'error' })
            }
        }
    }

    const handleEstadoChange = (id, nuevoEstado) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        const vehiculo = getVehiculos().find(v => v.idVehiculo === rutaActual?.idVehiculo)
        const conductor = getConductores().find(c => c.idConductor === rutaActual?.idConductor)

        if (nuevoEstado === 'En Curso') {
            const otraRutaVehiculo = rutasProgramadas.find(r =>
                getId(r) !== id &&
                r.idVehiculo === rutaActual?.idVehiculo &&
                r.estado === 'En Curso' &&
                r.habilitado !== false
            )
            const otraRutaConductor = rutasProgramadas.find(r =>
                getId(r) !== id &&
                r.idConductor === rutaActual?.idConductor &&
                r.estado === 'En Curso' &&
                r.habilitado !== false
            )

            const entidades = []
            let vehiculoBlocked = false
            let conductorBlocked = false

            if (vehiculo?.estado === 'Mantenimiento') {
                vehiculoBlocked = true
                entidades.push({ tipo: 'vehiculo', etiqueta: vehiculo.placa || '', estado: vehiculo.estado, id: vehiculo.idVehiculo, mensaje: 'está en Mantenimiento y no puede asignarse a una ruta En Curso.' })
            } else if (otraRutaVehiculo) {
                vehiculoBlocked = true
                entidades.push({ tipo: 'vehiculo', etiqueta: vehiculo?.placa || '', estado: vehiculo?.estado, id: vehiculo?.idVehiculo, mensaje: 'ya está asignado a otra ruta activa.' })
            }

            if (otraRutaConductor) {
                conductorBlocked = true
                const nombre = conductor?.nombre ? `${conductor.nombre} ${conductor.apellido || ''}`.trim() : 'Conductor'
                entidades.push({ tipo: 'conductor', etiqueta: nombre, estado: conductor?.estado || 'en_ruta', id: conductor?.idConductor, mensaje: 'ya está asignado a otra ruta activa.' })
            }

            if (entidades.length > 0) {
                setAlertaBloqueo({
                    open: true,
                    titulo: vehiculoBlocked && conductorBlocked
                        ? 'Vehículo y conductor no disponibles'
                        : vehiculoBlocked ? 'Vehículo no disponible'
                        : 'Conductor no disponible',
                    entidades,
                })
                return
            }
        }

        const INFO_ESTADOS = {
            'Programada': 'Las ventas seguirán asociadas bajo esta ruta. Deberá registrar un nuevo anticipo para el conductor si es necesario.',
            'Completada': 'El vehículo y el conductor quedarán disponibles y las ventas asociadas pasarán a "Entregada".',
            'Cancelada': 'El vehículo y el conductor quedarán disponibles, el anticipo pasará a "Excedente pendiente" y las ventas asociadas pasarán a "Cancelada".',
        }
        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info, ruta: rutaActual, vehiculo, conductor, confirmed: false })
    }

    const handleToggleHabilitado = (id) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        setConfirmInhabilitar({
            open: true,
            idRuta: id,
            nombreRuta: rutaActual?.nombreRuta || '',
            habilitadoActual: rutaActual?.habilitado !== false,
            estadoRuta: rutaActual?.estado || null,
        })
    }

    const onConfirmarInhabilitar = async () => {
        const { idRuta, habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(idRuta)
            setSnackbar({
                open: true,
                message: `Ruta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`,
                severity: 'success',
            })
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Error al cambiar habilitado', severity: 'error' })
            throw err
        }
    }

    const handleRegistrarSuccess = () => {
        fetchRutasProgramadas(buildRutasParams())
        setSnackbar({ open: true, message: 'Ruta registrada correctamente', severity: 'success' })
    }

    const handleActualizarSuccess = () => {
        fetchRutasProgramadas(buildRutasParams())
        setSnackbar({ open: true, message: 'Ruta actualizada correctamente', severity: 'success' })
    }

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Programación de Rutas
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las rutas programadas en el sistema.
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

                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && (
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                                onClick={() => { setFiltroHabilitado(f.value); setPage(1) }}
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
                                    fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                    backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                    color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.secondary,
                                    boxShadow: filtroHabilitado === f.value
                                        ? '0 1px 4px rgba(0,0,0,0.12)'
                                        : 'none',
                                    border: 'none',
                                    '&:hover': {
                                        backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                        color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.medium,
                                        border: 'none',
                                    },
                                }}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroAnio}
                                onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                                displayEmpty
                                sx={{ borderRadius: 4 }}
                            >
                                <MenuItem value="">Año</MenuItem>
                                {aniosDisponibles.map(anio => (
                                    <MenuItem key={anio} value={anio}>{anio}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroMes}
                                onChange={(e) => { setFiltroMes(e.target.value); setPage(1) }}
                                displayEmpty
                                disabled={!filtroAnio}
                                sx={{ borderRadius: 4 }}
                            >
                                <MenuItem value="">Mes</MenuItem>
                                {MESES.map(m => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                </Box>

                <TextField
                    size="small"
                    placeholder="Buscar rutas..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main, borderWidth: '1px',
                            },
                        },
                    }}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
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
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'fechaSalida'}
                                        direction={sortBy.field === 'fechaSalida' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('fechaSalida')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        Fecha y hora salida
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Vehículo</TableCell>
                                <TableCell sx={thStyle}>Conductor</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando rutas...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar las rutas. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && rutasProgramadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo' || filtroEstadoRuta !== 'todo' || filtroAnio !== '' || filtroMes !== ''
                                                ? 'No se encontraron rutas que coincidan con los filtros aplicados.'
                                                : debouncedSearch.trim()
                                                    ? 'No se encontraron rutas que coincidan con la búsqueda.'
                                                    : 'No hay rutas programadas en el sistema.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rutasProgramadas.map((ruta) => {
                                    const id = getId(ruta)
                                    const isHighlighted = highlightId && String(id) === String(highlightId)
                                    return (
                                        <TableRow
                                            key={id}
                                            ref={isHighlighted ? highlightRef : null}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: ruta.habilitado !== false ? 1 : 0.55,
                                                ...(isHighlighted && {
                                                    animation: 'highlightPulse 1.1s ease-in-out 4',
                                                    '@keyframes highlightPulse': {
                                                        '0%, 100%': { backgroundColor: 'transparent' },
                                                        '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                                                    },
                                                }),
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                                {ruta.nombreRuta || '—'}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography sx={{ fontSize: '0.875rem' }}>{ruta.fechaSalida || '—'}</Typography>
                                                {ruta.horaSalida && (
                                                    <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{formatHora12(ruta.horaSalida)}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                                                    <PlacaDisplay placa={resolveVehiculo(ruta)} theme={theme} />
                                                    {getVehiculos().find(v => v.idVehiculo === ruta.idVehiculo)?.habilitado === false && ruta.estado === 'Programada' && (
                                                        <Chip
                                                            label="Reasignar vehículo"
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 600,
                                                                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                                                                color: theme.palette.warning.dark,
                                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                                                                width: 'fit-content',
                                                                '& .MuiChip-label': { px: 0.8 },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                                                    <Typography sx={{ fontSize: '0.875rem' }}>{resolveConductor(ruta)}</Typography>
                                                    {getConductores().find(c => c.idConductor === ruta.idConductor)?.habilitado === false && ruta.estado === 'Programada' && (
                                                        <Chip
                                                            label="Reasignar conductor"
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 600,
                                                                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                                                                color: theme.palette.warning.dark,
                                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                                                                width: 'fit-content',
                                                                '& .MuiChip-label': { px: 0.8 },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5, minWidth: 150 }}>
                                                {ruta.estado === 'Completada' ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                                                        {renderEstadoDot('Completada', getEstadoColor)}
                                                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Completada</Typography>
                                                    </Box>
                                                ) : ruta.estado === 'En Curso' && ruta.pendienteLegalizacion ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: 'hidden' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, flex: 1 }}>
                                                                {renderEstadoDot('En Curso', getEstadoColor)}
                                                                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor('En Curso').color }}>
                                                                    En Curso
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ width: '1px', height: 28, backgroundColor: theme.palette.divider, flexShrink: 0 }} />
                                                            <Box
                                                                onClick={() => handleEstadoChange(id, 'Cancelada')}
                                                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, cursor: 'pointer' }}
                                                            >
                                                                {renderEstadoDot('Cancelada', getEstadoColor)}
                                                                <Typography variant="body2" sx={{ fontSize: '0.72rem', fontWeight: 500, color: getEstadoColor('Cancelada').color }}>
                                                                    Cancelada
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                                                            Legalización pendiente
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        onClick={(e) => setEstadoMenu({ anchor: e.currentTarget, id, estadoActual: ruta.estado || 'Programada' })}
                                                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
                                                    >
                                                        {renderEstadoDot(ruta.estado || 'Programada', getEstadoColor)}
                                                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor(ruta.estado).color }}>
                                                            {ruta.estado || 'Programada'}
                                                        </Typography>
                                                        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setRutaVer(ruta)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && (
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => { setRutaEditar(ruta); setModalActualizarOpen(true) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.INHABILITAR_RUTA) && (
                                                        <Tooltip title={ruta.habilitado !== false ? 'Inhabilitar' : 'Habilitar'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleHabilitado(id)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                {ruta.habilitado !== false
                                                                    ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                    : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color }} />}
                                                            </IconButton>
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

            {rutaVer && (
                <ModalConsultarRutaProgramacion ruta={rutaVer} onClose={() => setRutaVer(null)} />
            )}

            <RegistrarRutaProgramacion
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={handleRegistrarSuccess}
            />

            <ActualizarRutaProgramacion
                open={modalActualizarOpen}
                onClose={() => setModalActualizarOpen(false)}
                ruta={rutaEditar}
                onSuccess={handleActualizarSuccess}
            />

            <ModalConfirmarEstado
                open={confirmEstado.open}
                nuevoEstado={confirmEstado.nuevoEstado}
                info={confirmEstado.info}
                ruta={confirmEstado.ruta}
                vehiculo={confirmEstado.vehiculo}
                conductor={confirmEstado.conductor}
                onClose={() => setConfirmEstado(c => ({ ...c, open: false }))}
                onConfirm={() => setConfirmEstado(c => ({ ...c, open: false, confirmed: true }))}
                onExited={() => {
                    const { id, nuevoEstado, confirmed } = confirmEstado
                    setConfirmEstado({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, vehiculo: null, conductor: null, confirmed: false })
                    if (confirmed && id && nuevoEstado) ejecutarCambioEstado(id, nuevoEstado)
                }}
            />

            <ModalInhabilitarRuta
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, idRuta: null, nombreRuta: '', habilitadoActual: null, estadoRuta: null })}
                onConfirm={onConfirmarInhabilitar}
            />

            <Dialog open={alertaBloqueo.open} onClose={() => setAlertaBloqueo(a => ({ ...a, open: false }))}
                maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
                <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
                    <IconButton onClick={() => setAlertaBloqueo(a => ({ ...a, open: false }))}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: `${theme.palette.primary.main}22`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%' }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                                {alertaBloqueo.titulo}
                            </Typography>
                            {alertaBloqueo.entidades.map((e, i) => {
                                const dot = e.tipo === 'vehiculo' ? getVehiculoEstadoDot(e.estado) : getConductorEstadoDot(e.estado)
                                return (
                                    <Box key={i} sx={{ width: '100%', mt: i > 0 ? 1.5 : 0.5, textAlign: 'left' }}>
                                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ mb: 1, textAlign: 'center' }}>
                                            {e.tipo === 'vehiculo'
                                                ? <>El vehículo <strong>{e.etiqueta}</strong> {e.mensaje}</>
                                                : <><strong>{e.etiqueta}</strong> {e.mensaje}</>
                                            }
                                        </Typography>
                                        <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                            <Box
                                                onClick={() => e.id && window.open(`${e.tipo === 'vehiculo' ? '/vehiculos/listar' : '/transporte/conductores'}?highlight=${e.id}`, '_blank')}
                                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: e.id ? 'pointer' : 'default', '&:hover': e.id ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {e.tipo === 'vehiculo'
                                                        ? <DirectionsCarOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                        : <PersonOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                    }
                                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{e.etiqueta}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
                    <Button onClick={() => setAlertaBloqueo(a => ({ ...a, open: false }))} variant="contained" disableRipple
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': { backgroundColor: theme.palette.primary.main, filter: 'brightness(0.88)' } }}>
                        Entendido
                    </Button>
                </Box>
            </Dialog>

            <Menu
                anchorEl={estadoMenu.anchor}
                open={Boolean(estadoMenu.anchor)}
                onClose={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
            >
                {ESTADOS_RUTA.filter(op => {
                    if (op === estadoMenu.estadoActual) return false
                    if (estadoMenu.estadoActual === 'Programada') return op === 'En Curso'
                    if (estadoMenu.estadoActual === 'Cancelada') return op === 'Programada'
                    if (estadoMenu.estadoActual === 'En Curso' && op === 'Programada') return false
                    return true
                }).map(op => (
                    <MenuItem key={op} onClick={() => {
                        setEstadoMenu(prev => ({ ...prev, anchor: null }))
                        handleEstadoChange(estadoMenu.id, op)
                    }} sx={{ fontSize: '0.82rem', gap: 1 }}>
                        {renderEstadoDot(op, getEstadoColor)}
                        {op}
                    </MenuItem>
                ))}
            </Menu>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarRutaProgramacion

