import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getPageOfConductor, getConductores } from './services/conductorService.js'
import { normalizarConductor } from './utils/normalizarConductor.js'
import { formatFecha } from '../../shared/utils/formatters.js'
import RegistrarConductor from './RegistrarConductor'
import ActualizarConductor from './ActualizarConductor'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarConductor from './components/ModalConsultarConductor'
import ModalInhabilitarConductor from './components/ModalInhabilitarConductor'
import FiltroEstadoConductor from './components/FiltroEstadoConductor.jsx'
import useConductorColumns from './hooks/useConductorColumns.jsx'
import useConductorAcciones from './hooks/useConductorAcciones.js'

const ListarConductor = () => {
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    // Estado propio de esta tabla paginada (NO el arreglo compartido de
    // ConductorContext, que otras pantallas piden completo con limit:1000 para su
    // propio uso — ver ../../../LOGICA.md, "Bug transversal — listas paginadas
    // corrompidas por prefetch compartido"). Si se lee de ahí, cualquier otra
    // pantalla que refresque ese arreglo compartido pisa la página actual.
    const [conductores, setConductores] = useState([])
    const [total, setTotal] = useState(0)

    const [conductorVer, setConductorVer] = useState(null)
    const [filtroEstado, setFiltroEstado] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [conductorEditar, setConductorEditar] = useState(null)

    const {
        theme,
        highlightId, highlightRef,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        page, setPage, rowsPerPage, setRowsPerPage,
        exportando, handleExportar,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
        refetch,
    } = useEntityCrud({
        fetchPage: async (signal, params) => {
            const res = await getConductores(signal, { ...params, estado: filtroEstado || undefined })
            if (res?.success) {
                setConductores(res.data.map(normalizarConductor))
                setTotal(res.total ?? res.data.length)
            }
        },
        extraDeps: [filtroEstado],
        fetchPageForHighlight: (id, limit) => getPageOfConductor(id, limit),
        exportConfig: {
            fetchAll: (params) => getConductores(undefined, { ...params, estado: filtroEstado || undefined, limit: 100000 }),
            mapRow: (conductorCrudo) => {
                const conductor = normalizarConductor(conductorCrudo)
                return {
                    'ID': conductor.idConductor,
                    'Nombre': `${conductor.nombre || ''} ${conductor.apellido || ''}`.trim(),
                    'Identificación': conductor.numeroIdentificacion,
                    'Email': conductor.email,
                    'Teléfono': conductor.telefono,
                    'Número de Licencia': conductor.numeroLicencia,
                    'Categorías de licencia': (conductor.categoriasLicencia || [])
                        .map(c => `${c.categoria} · ${c.vencimiento ? formatFecha(c.vencimiento) : 'N/A'}`)
                        .join(', '),
                    'Estado': conductor.estado,
                    'Habilitado': conductor.habilitado === false ? 'No' : 'Sí',
                }
            },
            fileName: 'Conductores',
            sheetName: 'Conductores',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    const { confirmToggle, setConfirmToggle, modalBloqueo, setModalBloqueo, solicitarToggle, onConfirmar } = useConductorAcciones(refetch)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const emptyMessage = filtroHabilitado !== 'todo'
        ? 'No se encontraron conductores que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron conductores que coincidan con la búsqueda.'
            : 'No hay conductores registrados en el sistema.'

    const columns = useConductorColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setConductorVer,
        onEditar: (conductor) => { setConductorEditar(conductor); setModalActualizarOpen(true) },
        onToggleHabilitado: solicitarToggle,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            {/* -- Encabezado -- */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Conductores
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los conductores registrados en el sistema.
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

                    {tienePermiso(PERMISOS.REGISTRAR_CONDUCTOR) && (
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FiltroEstadoTabs
                        value={filtroHabilitado}
                        onChange={setFiltroHabilitado}
                        containerRef={filtroContainerRef}
                        btnRefs={filtroBtnRefs}
                        pillStyle={filtroPillStyle}
                    />
                    <FiltroEstadoConductor theme={theme} filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} setPage={setPage} />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar conductores..." />
            </Box>

            <DataTable
                columns={columns}
                rows={conductores}
                rowKey={(conductor) => conductor.idConductor}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(conductor) => ({ opacity: conductor.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando conductores..."
                errorMessage="No se pudieron cargar los conductores. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {conductorVer && (
                <ModalConsultarConductor conductor={conductorVer} onClose={() => setConductorVer(null)} />
            )}

            {/* -- Modales registrar / actualizar -- */}
            <RegistrarConductor
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    refetch()
                    showToast('Conductor registrado correctamente', 'success')
                }}
            />

            <ActualizarConductor
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setConductorEditar(null) }}
                conductor={conductorEditar}
                onSuccess={() => {
                    refetch()
                    showToast('Conductor actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarConductor
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, idConductor: null, nombreCompleto: '', habilitadoActual: false, destinoActual: null })}
                onConfirm={onConfirmar}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="conductor"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

        </Box>
    )
}

export default ListarConductor
