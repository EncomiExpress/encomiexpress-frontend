import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton, Dialog } from '@mui/material'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CloseIcon from '@mui/icons-material/Close'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { getPaquetesDevueltos, getAniosDisponiblesPaquetesDevueltos } from './services/paqueteService.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import FiltroAnioMes from './components/FiltroAnioMes.jsx'
import usePaqueteDevueltoColumns from './hooks/usePaqueteDevueltoColumns.jsx'

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

    const columns = usePaqueteDevueltoColumns({
        theme,
        onVerVenta: (paquete) => navigate(`/ventas/listar?highlight=${paquete.idEncomiendaVenta}`),
        onVerImagen: setImagenAmpliada,
    })

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

                    <FiltroAnioMes
                        theme={theme}
                        filtroAnio={filtroAnio}
                        setFiltroAnio={setFiltroAnio}
                        filtroMes={filtroMes}
                        setFiltroMes={setFiltroMes}
                        aniosDisponibles={aniosDisponibles}
                        setPage={setPage}
                    />
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
                onSort={() => { }}
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
