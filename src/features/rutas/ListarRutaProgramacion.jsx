import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useRutaProgramacion } from './context/RutaProgramacionContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'
import ModalConsultarRutaProgramacion from './components/ModalConsultarRutaProgramacion'
import ModalConfirmarEstado from './components/ModalConfirmarEstado'
import ModalInhabilitarRuta from './components/ModalInhabilitarRuta'
import FiltroRuta from './components/FiltroRuta.jsx'
import AlertaBloqueoDialog from './components/AlertaBloqueoDialog.jsx'
import MenuCambioEstadoRuta from './components/MenuCambioEstadoRuta.jsx'
import { getPageOfRuta, getAniosDisponiblesRuta } from './services/rutaService.js'
import { getRutaId } from './utils/rutaResolvers.js'
import { useEstadoRuta } from './hooks/useEstadoRuta.js'
import useRutaColumns from './hooks/useRutaColumns.jsx'
import useRutaAcciones from './hooks/useRutaAcciones.js'
import useRutaExport from './hooks/useRutaExport.js'

const ListarRutaProgramacion = () => {
    const navigate = useNavigate()
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const { showToast } = useToast()
    const [rutaVer, setRutaVer] = useState(null)
    const [estadoMenu, setEstadoMenu] = useState({ anchor: null, id: null, estadoActual: null })
    const [filtroEstadoRuta, setFiltroEstadoRuta] = useState('')
    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar] = useState(null)
    const [prefillRegreso, setPrefillRegreso] = useState(null)

    const { rutasProgramadas, total, fetchRutasProgramadas, updateEstado } = useRutaProgramacion()
    const { getVehiculos, fetchVehiculos } = useVehiculo()
    const { getConductores, fetchConductores } = useConductor()
    const { destinos } = useDestino()

    const {
        theme,
        highlightId, highlightRef,
        loading, error, initialLoad,
        busqueda: searchTerm, setBusqueda: setSearchTerm, debouncedBusqueda: debouncedSearch,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        refetch,
        page, setPage, rowsPerPage, setRowsPerPage,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
    } = useEntityCrud({
        // Antes de que "usuario" esté listo (justo antes del redirect a /login de abajo)
        // no se debe llamar al backend -- mismo guard que tenía el efecto original.
        fetchPage: (signal, params) => {
            if (!usuario) return Promise.resolve()
            return fetchRutasProgramadas({
                ...params,
                estado: filtroEstadoRuta || undefined,
                anio: filtroAnio || undefined,
                mes: filtroMes || undefined,
            }, signal)
        },
        extraDeps: [filtroEstadoRuta, filtroAnio, filtroMes, usuario],
        fetchPageForHighlight: (id, limit) => getPageOfRuta(id, limit),
    })

    const { confirmEstado, setConfirmEstado, alertaBloqueo, setAlertaBloqueo, handleEstadoChange, ejecutarCambioEstado } = useEstadoRuta({
        rutasProgramadas, getVehiculos, getConductores, fetchVehiculos, fetchConductores, updateEstado, refetch, showToast,
    })

    const { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmarInhabilitar } = useRutaAcciones(rutasProgramadas)

    const { exportando, handleExportar } = useRutaExport({
        theme, sortBy, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, debouncedSearch,
        getVehiculos, getConductores, destinos,
    })

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        }
    }, [usuario, navigate])

    // Años disponibles para el filtro — se traen del backend (todas las rutas),
    // no solo de la página actualmente cargada, para que el dropdown esté completo
    // sin importar la paginación.
    useEffect(() => {
        getAniosDisponiblesRuta()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    const handleRegistrarSuccess = () => {
        refetch()
        showToast(prefillRegreso ? 'Viaje de regreso programado correctamente' : 'Ruta registrada correctamente', 'success')
    }

    // Precarga el formulario de Registrar con el corredor invertido de una ruta ya
    // Completada — mismo convoy, paradas en orden inverso. El destino final queda
    // vacío a propósito (ver comentario en RegistrarRutaProgramacion.jsx).
    const handleProgramarRegreso = (ruta) => {
        setPrefillRegreso({
            idRutaIda: ruta.idRuta,
            origen: ruta.destino?.ciudad || '',
            pares: (ruta.paresVehiculoConductor || []).map(p => ({ idVehiculo: p.idVehiculo, idConductor: p.idConductor })),
            paradas: [...(ruta.paradas || [])].sort((a, b) => b.orden - a.orden).map(p => ({ idDestino: p.idDestino })),
        })
        setModalRegistrarOpen(true)
    }

    const handleActualizarSuccess = () => {
        refetch()
        showToast('Ruta actualizada correctamente', 'success')
    }

    const emptyMessage = filtroHabilitado !== 'todo' || filtroEstadoRuta !== '' || filtroAnio !== '' || filtroMes !== ''
        ? 'No se encontraron rutas que coincidan con los filtros aplicados.'
        : debouncedSearch.trim()
            ? 'No se encontraron rutas que coincidan con la búsqueda.'
            : 'No hay rutas programadas en el sistema.'

    const columns = useRutaColumns({
        theme, tienePermiso, PERMISOS, destinos, getVehiculos, getConductores,
        onConsultar: setRutaVer,
        onEditar: (ruta) => { setRutaEditar(ruta); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
        onAbrirMenuEstado: (anchor, id, estadoActual) => setEstadoMenu({ anchor, id, estadoActual }),
        onCancelarEnRuta: (id) => handleEstadoChange(id, 'Cancelada'),
        onProgramarRegreso: handleProgramarRegreso,
    })

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
                        onClick={handleExportar}
                        disabled={exportando}
                        variant="contained"
                        startIcon={exportando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
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
                                backgroundColor: theme.palette.primary.activeBg,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {exportando ? 'Exportando...' : 'Exportar'}
                    </Button>

                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && (
                        <Button
                            onClick={() => { setPrefillRegreso(null); setModalRegistrarOpen(true) }}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FiltroEstadoTabs
                            value={filtroHabilitado}
                            onChange={setFiltroHabilitado}
                            containerRef={filtroContainerRef}
                            btnRefs={filtroBtnRefs}
                            pillStyle={filtroPillStyle}
                        />
                    </Box>

                    <FiltroRuta
                        theme={theme}
                        filtroEstadoRuta={filtroEstadoRuta} setFiltroEstadoRuta={setFiltroEstadoRuta}
                        filtroAnio={filtroAnio} setFiltroAnio={setFiltroAnio}
                        filtroMes={filtroMes} setFiltroMes={setFiltroMes}
                        aniosDisponibles={aniosDisponibles}
                        setPage={setPage}
                    />
                </Box>

                <BuscadorField
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar rutas..."
                />
            </Box>

            <DataTable
                columns={columns}
                rows={rutasProgramadas}
                rowKey={getRutaId}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(ruta) => ({ opacity: ruta.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando rutas..."
                errorMessage="No se pudieron cargar las rutas. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {rutaVer && (
                <ModalConsultarRutaProgramacion ruta={rutaVer} onClose={() => setRutaVer(null)} />
            )}

            <RegistrarRutaProgramacion
                open={modalRegistrarOpen}
                onClose={() => { setModalRegistrarOpen(false); setPrefillRegreso(null) }}
                onSuccess={handleRegistrarSuccess}
                prefill={prefillRegreso}
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
                pares={confirmEstado.pares}
                onClose={() => setConfirmEstado(c => ({ ...c, open: false }))}
                onConfirm={async () => {
                    const { id, nuevoEstado } = confirmEstado
                    await ejecutarCambioEstado(id, nuevoEstado)
                    setConfirmEstado(c => ({ ...c, open: false }))
                }}
                onExited={() => setConfirmEstado({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, pares: [] })}
            />

            <ModalInhabilitarRuta
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, idRuta: null, origen: '', habilitadoActual: null, estadoRuta: null })}
                onConfirm={onConfirmarInhabilitar}
            />

            <AlertaBloqueoDialog
                theme={theme}
                alertaBloqueo={alertaBloqueo}
                onClose={() => setAlertaBloqueo(a => ({ ...a, open: false }))}
            />

            <MenuCambioEstadoRuta
                estadoMenu={estadoMenu}
                onClose={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                onSeleccionar={(op) => {
                    setEstadoMenu(prev => ({ ...prev, anchor: null }))
                    handleEstadoChange(estadoMenu.id, op)
                }}
            />

        </Box>
    )
}

export default ListarRutaProgramacion
