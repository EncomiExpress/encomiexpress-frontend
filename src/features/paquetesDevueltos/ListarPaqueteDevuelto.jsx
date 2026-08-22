import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, IconButton,
    Tooltip, Dialog,
    Select, MenuItem, FormControl,
} from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import CloseIcon from '@mui/icons-material/Close'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { getPaquetesDevueltos, getAniosDisponiblesPaquetesDevueltos } from './services/paqueteService.js'
import { formatFechaHora } from '../../shared/utils/formatters.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'

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
    const navigate = useNavigate()
    const { usuario } = useAuth()

    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [paquetes, setPaquetes] = useState([])
    const [total, setTotal] = useState(0)
    const [imagenAmpliada, setImagenAmpliada] = useState(null)

    const {
        theme,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        page, setPage, rowsPerPage, setRowsPerPage,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
    } = useEntityCrud({
        fetchPage: async (signal, params) => {
            const res = await getPaquetesDevueltos({ ...params, anio: filtroAnio || undefined, mes: filtroMes || undefined }, signal)
            setPaquetes(res?.data || [])
            setTotal(res?.total || 0)
        },
        extraDeps: [filtroAnio, filtroMes],
    })

    const filterMenuProps = getFilterMenuProps(theme)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    useEffect(() => {
        getAniosDisponiblesPaquetesDevueltos()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    const emptyMessage = debouncedBusqueda.trim()
        ? 'No se encontraron paquetes devueltos que coincidan con la búsqueda.'
        : 'No hay paquetes devueltos en este momento.'

    const columns = [
        {
            key: 'guia', label: 'Guía', cellSx: { py: 1.5 },
            render: (paquete) => (
                <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                    {paquete.numeroGuia}
                </Typography>
            ),
        },
        {
            key: 'cliente', label: 'Cliente', cellSx: { py: 1.5 },
            render: (paquete) => {
                const cliente = paquete.encomienda?.cliente
                return (
                    <>
                        <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                            {cliente ? `${cliente.nombre} ${cliente.apellido}` : '—'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                            {cliente?.email || 'Sin correo registrado'}
                        </Typography>
                    </>
                )
            },
        },
        {
            key: 'ruta', label: 'Ruta', cellSx: { py: 1.5 },
            render: (paquete) => {
                const ruta = paquete.asignacion?.ruta
                return (
                    <Typography variant="body2" color={theme.palette.text.primary}>
                        {ruta ? `${ruta.origen || '—'} → ${ruta.destino?.ciudad || '—'}` : '—'}
                    </Typography>
                )
            },
        },
        {
            key: 'fecha', label: 'Fecha último estado', cellSx: { py: 1.5 },
            render: (paquete) => (
                <Typography variant="body2" color={theme.palette.text.primary}>
                    {paquete.fechaUltimoEstado ? formatFechaHora(paquete.fechaUltimoEstado) : '—'}
                </Typography>
            ),
        },
        {
            key: 'observacion', label: 'Observación', cellSx: { py: 1.5, maxWidth: 260 },
            render: (paquete) => (
                <Typography variant="body2" color={theme.palette.text.secondary} noWrap>
                    {paquete.observacionEstado || '—'}
                </Typography>
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (paquete) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver venta">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/ventas/listar?highlight=${paquete.idEncomiendaVenta}`)}
                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                        >
                            <OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />
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
            ),
        },
    ]

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <FiltroEstadoTabs
                        value={filtroHabilitado}
                        onChange={setFiltroHabilitado}
                        containerRef={filtroContainerRef}
                        btnRefs={filtroBtnRefs}
                        pillStyle={filtroPillStyle}
                    />

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

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar paquetes..." />
            </Box>

            <DataTable
                columns={columns}
                rows={paquetes}
                rowKey={(paquete) => paquete.idPaquete}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={{ field: '', dir: '' }}
                onSort={() => {}}
                rowSx={(paquete) => ({ opacity: paquete.encomienda?.habilitado === false ? 0.55 : 1 })}
                emptyMessage={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 32, color: theme.palette.text.disabled }} />
                        <Typography color={theme.palette.text.secondary} variant="body2">{emptyMessage}</Typography>
                    </Box>
                }
                loadingMessage="Cargando paquetes devueltos..."
                errorMessage="No se pudieron cargar los paquetes devueltos. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
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
