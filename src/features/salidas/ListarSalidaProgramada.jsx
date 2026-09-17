import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress, IconButton, Tooltip } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useSalidaProgramacion } from './context/SalidaProgramacionContext.jsx'
import { useRuta } from '../rutas/context/RutaContext.jsx'
import { getRutaLabel } from '../rutas/utils/rutaResolvers.js'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarSalidaProgramada from './RegistrarSalidaProgramada'
import ActualizarSalidaProgramada from './ActualizarSalidaProgramada'
import ModalConsultarSalidaProgramada from './components/ModalConsultarSalidaProgramada'
import ModalConfirmarEstado from './components/ModalConfirmarEstado'
import ModalInhabilitarSalida from './components/ModalInhabilitarSalida'
import ModalProgramarRegresoSede from './components/ModalProgramarRegresoSede.jsx'
import ModalEditarHorarioRegresoSede from './components/ModalEditarHorarioRegresoSede.jsx'
import ModalAsignarRepartidor from './components/ModalAsignarRepartidor.jsx'
import FiltroSalida from './components/FiltroSalida.jsx'
import AlertaBloqueoDialog from './components/AlertaBloqueoDialog.jsx'
import MenuCambioEstadoSalida from './components/MenuCambioEstadoSalida.jsx'
import { getPageOfSalida, getAniosDisponiblesSalida, getSalidas } from './services/salidaService.js'
import { getSalidaId } from './utils/salidaResolvers.js'
import { useEstadoSalida } from './hooks/useEstadoSalida.js'
import useSalidaColumns from './hooks/useSalidaColumns.jsx'
import useSalidaAcciones from './hooks/useSalidaAcciones.js'
import useSalidaExport from './hooks/useSalidaExport.js'

// Adaptado de rutas/ListarRutaProgramacion.jsx (ver step 1 de la migración) — misma
// tabla/filtros/estado/año/mes/búsqueda, mismas acciones. "Reutilizar" ahora
// simplemente preselecciona la MISMA plantilla de ruta en el wizard de nueva
// salida (ya no copia el destino a mano, aunque el convoy sí se sigue precargando
// como punto de partida editable).
//
// Ya no existe una vista global de Salidas: esta pantalla SIEMPRE cuelga de
// /transporte/rutas/:idRuta/salidas (ver salidas.routes.jsx) y muestra/permite
// registrar únicamente las salidas de ESA plantilla — se llega acá solo desde el
// botón "Salidas" de una fila en Rutas/ListarRuta.jsx.
const ListarSalidaProgramada = () => {
    const navigate = useNavigate()
    const { idRuta: idRutaParam } = useParams()
    const idRuta = idRutaParam ? parseInt(idRutaParam) : undefined
    const { getRutaById } = useRuta()
    const rutaActual = idRuta ? getRutaById(idRuta) : null
    const { tienePermiso, PERMISOS, usuario, sedeActual } = useAuth()
    const { showToast } = useToast()
    const [salidaVer, setSalidaVer] = useState(null)
    const [estadoMenu, setEstadoMenu] = useState({ anchor: null, id: null, estadoActual: null, salida: null })
    const [filtroEstadoRuta, setFiltroEstadoRuta] = useState('')
    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [salidaEditar, setSalidaEditar] = useState(null)
    const [prefillRegreso, setPrefillRegreso] = useState(null)
    const [salidaRegresoSede, setSalidaRegresoSede] = useState(null)
    const [salidaEditarHorarioSede, setSalidaEditarHorarioSede] = useState(null)
    const [salidaAsignarRepartidor, setSalidaAsignarRepartidor] = useState(null)

    // Estado propio de esta tabla paginada (NO el arreglo compartido de
    // SalidaProgramacionContext, que otras pantallas/hooks piden completo o con un
    // limit alto para sus propios usos — Autocompletes, "Programar regreso", el
    // wizard de Ventas). Si se lee de ahí, cualquier otra pantalla que refresque ese
    // arreglo compartido pisa la página actual.
    const [salidasProgramadas, setSalidasProgramadas] = useState([])
    const [total, setTotal] = useState(0)
    const { updateEstado, programarRegresoSede, actualizarSalidaProgramada } = useSalidaProgramacion()
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
        fetchPage: async (signal, params) => {
            if (!usuario) return
            const res = await getSalidas({
                ...params,
                idRuta,
                estado: filtroEstadoRuta || undefined,
                anio: filtroAnio || undefined,
                mes: filtroMes || undefined,
            }, signal)
            setSalidasProgramadas(res?.data ?? [])
            setTotal(res?.total ?? (res?.data ?? []).length)
        },
        extraDeps: [idRuta, filtroEstadoRuta, filtroAnio, filtroMes, usuario],
        fetchPageForHighlight: (id, limit) => getPageOfSalida(id, limit),
    })

    const { confirmEstado, setConfirmEstado, alertaBloqueo, setAlertaBloqueo, handleEstadoChange, ejecutarCambioEstado } = useEstadoSalida({
        salidasProgramadas, getVehiculos, getConductores, fetchVehiculos, fetchConductores, updateEstado, refetch, showToast,
    })

    const { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmarInhabilitar } = useSalidaAcciones(salidasProgramadas, refetch, destinos)

    const { exportando, handleExportar } = useSalidaExport({
        theme, sortBy, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, debouncedSearch,
        getVehiculos, getConductores, destinos,
    })

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        }
    }, [usuario, navigate])

    // Años disponibles para el filtro — se traen del backend (todas las salidas), no
    // solo de la página actualmente cargada.
    useEffect(() => {
        getAniosDisponiblesSalida()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    const handleRegistrarSuccess = () => {
        refetch()
        const esProgramarRegreso = prefillRegreso && !prefillRegreso.reutilizar
        showToast(esProgramarRegreso ? 'Viaje de regreso programado correctamente' : 'Salida registrada correctamente', 'success')
    }

    // Precarga el formulario de Registrar con el corredor invertido de una salida ya
    // Completada — mismo convoy. La plantilla no se precarga
    // (RegistrarSalidaProgramada la resuelve sola hacia la base).
    const handleProgramarRegreso = (salida) => {
        setPrefillRegreso({
            idSalidaIda: salida.idSalida,
            origen: salida.ruta?.destino?.municipio || '',
            pares: (salida.paresVehiculoConductor || []).map(p => ({
                idVehiculo: p.idVehiculo,
                idConductor: p.idConductor,
            })),
        })
        setModalRegistrarOpen(true)
    }

    // "Reutilizar salida": precarga la MISMA plantilla y convoy de una ida ya
    // Completada -- a diferencia de "Programar Regreso", no manda idSalidaIda: la
    // salida que se cree queda totalmente independiente de esta, solo repite los
    // datos como punto de partida editable.
    const handleReutilizarSalida = (salida) => {
        setPrefillRegreso({
            reutilizar: true,
            idRuta: salida.idRuta,
            pares: (salida.paresVehiculoConductor || []).map(p => ({
                idVehiculo: p.idVehiculo,
                idConductor: p.idConductor,
            })),
        })
        setModalRegistrarOpen(true)
    }

    // "Nuevo" en esta vista scoped siempre crea una salida de LA plantilla actual
    // (idRuta viene de la URL) — a diferencia de "Programar regreso"/"Reutilizar",
    // no hay nada más que precargar: es un registro nuevo de verdad, así que el
    // convoy y el horario quedan en blanco para que el usuario los complete a
    // mano (para repetir el convoy/horario de un viaje anterior está el botón
    // "Reutilizar salida" en cada fila, que sí es una acción explícita de copiar).
    const handleAbrirNuevo = () => {
        setPrefillRegreso(idRuta ? { idRuta } : null)
        setModalRegistrarOpen(true)
    }

    const handleActualizarSuccess = () => {
        refetch()
        showToast('Salida actualizada correctamente', 'success')
    }

    // WS4 "Sedes remotas": operador_sede dispara el regreso de su sede con solo
    // fecha/hora de salida — sin abrir el wizard completo.
    const handleConfirmarRegresoSede = async (salida, datos) => {
        await programarRegresoSede(salida.idSalida, datos)
        setSalidaRegresoSede(null)
        refetch()
        showToast('Regreso programado correctamente', 'success')
    }

    // operador_sede edita SOLO fecha/hora de su propio regreso — reusa el mismo
    // PUT /salidas/:id que el wizard completo del admin, pero mandando nada más esos
    // 4 campos; el backend valida que no venga ningún otro campo.
    const handleConfirmarEditarHorarioSede = async (salida, datos) => {
        await actualizarSalidaProgramada({ idSalida: salida.idSalida, ...datos })
        setSalidaEditarHorarioSede(null)
        refetch()
        showToast('Regreso actualizado correctamente', 'success')
    }

    const emptyMessage = filtroHabilitado !== 'todo' || filtroEstadoRuta !== '' || filtroAnio !== '' || filtroMes !== ''
        ? 'No se encontraron salidas que coincidan con los filtros aplicados.'
        : debouncedSearch.trim()
            ? 'No se encontraron salidas que coincidan con la búsqueda.'
            : 'No hay salidas programadas en el sistema.'

    const columns = useSalidaColumns({
        theme, tienePermiso, PERMISOS, getVehiculos, getConductores, sedeActual, usuario,
        onConsultar: setSalidaVer,
        onEditar: (salida) => { setSalidaEditar(salida); setModalActualizarOpen(true) },
        onEditarHorarioSede: setSalidaEditarHorarioSede,
        onToggleHabilitado: handleToggleHabilitado,
        onAbrirMenuEstado: (anchor, id, estadoActual, salida) => setEstadoMenu({ anchor, id, estadoActual, salida }),
        onCancelarEnRuta: (id) => handleEstadoChange(id, 'Cancelada'),
        onProgramarRegresoSede: setSalidaRegresoSede,
        onProgramarRegreso: handleProgramarRegreso,
        onReutilizarSalida: handleReutilizarSalida,
        onAsignarRepartidor: setSalidaAsignarRepartidor,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Tooltip title="Volver a Rutas">
                        <IconButton onClick={() => navigate('/transporte/rutas')} sx={{ mt: 0.25, color: theme.palette.neutral.main, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>
                            <ArrowBackOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Salidas de {rutaActual ? getRutaLabel(rutaActual) : 'esta ruta'}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                            {rutaActual?.destino
                                ? `Viajes programados hacia ${rutaActual.destino.municipio}, ${rutaActual.destino.departamento}.`
                                : 'Viajes programados para esta ruta.'}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        onClick={handleExportar}
                        disabled={exportando}
                        variant="contained"
                        startIcon={exportando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.primary.main,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dim,
                                color: theme.palette.primary.main,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {exportando ? 'Exportando...' : 'Exportar'}
                    </Button>

                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && (
                        <Button
                            onClick={handleAbrirNuevo}
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

                    <FiltroSalida
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
                    placeholder="Buscar salidas..."
                />
            </Box>

            <DataTable
                columns={columns}
                rows={salidasProgramadas}
                rowKey={getSalidaId}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(salida) => ({ opacity: salida.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando salidas..."
                errorMessage="No se pudieron cargar las salidas. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {salidaVer && (
                <ModalConsultarSalidaProgramada salida={salidaVer} onClose={() => setSalidaVer(null)} />
            )}

            <RegistrarSalidaProgramada
                open={modalRegistrarOpen}
                onClose={() => { setModalRegistrarOpen(false); setPrefillRegreso(null) }}
                onSuccess={handleRegistrarSuccess}
                prefill={prefillRegreso}
            />

            <ActualizarSalidaProgramada
                open={modalActualizarOpen}
                onClose={() => setModalActualizarOpen(false)}
                salida={salidaEditar}
                onSuccess={handleActualizarSuccess}
            />

            <ModalConfirmarEstado
                open={confirmEstado.open}
                nuevoEstado={confirmEstado.nuevoEstado}
                info={confirmEstado.info}
                salida={confirmEstado.salida}
                pares={confirmEstado.pares}
                onClose={() => setConfirmEstado(c => ({ ...c, open: false }))}
                onConfirm={async (extra) => {
                    const { id, nuevoEstado } = confirmEstado
                    await ejecutarCambioEstado(id, nuevoEstado, extra || {})
                    setConfirmEstado(c => ({ ...c, open: false }))
                }}
                onExited={() => setConfirmEstado({ open: false, id: null, nuevoEstado: null, info: '', salida: null, pares: [] })}
            />

            <ModalInhabilitarSalida
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, idSalida: null, origen: '', destino: '', habilitadoActual: null, estadoSalida: null, fechaSalida: null, horaSalida: null })}
                onConfirm={onConfirmarInhabilitar}
            />

            <AlertaBloqueoDialog
                theme={theme}
                alertaBloqueo={alertaBloqueo}
                onClose={() => setAlertaBloqueo(a => ({ ...a, open: false }))}
            />

            <MenuCambioEstadoSalida
                estadoMenu={estadoMenu}
                onClose={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                onSeleccionar={(op) => {
                    setEstadoMenu(prev => ({ ...prev, anchor: null }))
                    handleEstadoChange(estadoMenu.id, op)
                }}
            />

            <ModalProgramarRegresoSede
                open={!!salidaRegresoSede}
                salida={salidaRegresoSede}
                destinos={destinos}
                onClose={() => setSalidaRegresoSede(null)}
                onConfirmar={handleConfirmarRegresoSede}
            />

            <ModalEditarHorarioRegresoSede
                open={!!salidaEditarHorarioSede}
                salida={salidaEditarHorarioSede}
                destinos={destinos}
                onClose={() => setSalidaEditarHorarioSede(null)}
                onConfirmar={handleConfirmarEditarHorarioSede}
            />

            <ModalAsignarRepartidor
                open={!!salidaAsignarRepartidor}
                salida={salidaAsignarRepartidor}
                onClose={() => setSalidaAsignarRepartidor(null)}
                onSuccess={refetch}
            />

        </Box>
    )
}

export default ListarSalidaProgramada
