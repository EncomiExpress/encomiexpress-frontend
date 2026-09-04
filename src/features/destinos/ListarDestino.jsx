import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPageOfDestino, getDestinos } from './services/destinoService.js'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useDestino } from './context/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarDestino from './RegistrarDestino'
import ActualizarDestino from './ActualizarDestino'
import ModalConsultarDestino from './components/ModalConsultarDestino'
import ModalInhabilitarDestino from './components/ModalInhabilitarDestino'
import FiltroDepartamento from './components/FiltroDepartamento.jsx'
import useDestinoColumns from './hooks/useDestinoColumns.jsx'
import useDestinoAcciones from './hooks/useDestinoAcciones.js'

const ListarDestino = () => {
    const { showToast } = useToast()
    const [destinoVer, setDestinoVer] = useState(null)
    const [filtroDepartamento, setFiltroDepartamento] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [destinoEditar, setDestinoEditar] = useState(null)
    const { destinos, total, fetchDestinos } = useDestino()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    const { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmar } = useDestinoAcciones()

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
        fetchPage: (signal, params) => fetchDestinos(signal, { ...params, departamento: filtroDepartamento || undefined }),
        extraDeps: [filtroDepartamento],
        fetchPageForHighlight: (id, limit) => getPageOfDestino(id, limit),
        exportConfig: {
            fetchAll: (params) => getDestinos(undefined, { ...params, departamento: filtroDepartamento || undefined, limit: 100000 }),
            mapRow: (destino) => ({
                'ID': destino.idDestino,
                'Ciudad': destino.ciudad,
                'Departamento': destino.departamento,
                'Dirección': destino.direccion || '',
                'Tarifa base': Math.round(Number(destino.tarifaBase)) || 0,
                'Estado': destino.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }),
            fileName: 'Destinos',
            sheetName: 'Destinos',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const emptyMessage = filtroHabilitado !== 'todo'
        ? 'No se encontraron destinos que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron destinos que coincidan con la búsqueda.'
            : 'No hay destinos registrados en el sistema.'

    const columns = useDestinoColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setDestinoVer,
        onEditar: (destino) => { setDestinoEditar(destino); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
    })

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FiltroEstadoTabs
                        value={filtroHabilitado}
                        onChange={setFiltroHabilitado}
                        containerRef={filtroContainerRef}
                        btnRefs={filtroBtnRefs}
                        pillStyle={filtroPillStyle}
                    />
                    <FiltroDepartamento theme={theme} filtroDepartamento={filtroDepartamento} setFiltroDepartamento={setFiltroDepartamento} setPage={setPage} />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar destinos..." />
            </Box>

            <DataTable
                columns={columns}
                rows={destinos}
                rowKey={(destino) => destino.idDestino}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(destino) => ({ opacity: destino.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando destinos..."
                errorMessage="No se pudieron cargar los destinos. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {destinoVer && (
                <ModalConsultarDestino destino={destinoVer} onClose={() => setDestinoVer(null)} />
            )}

            {/* ── Modales registrar / actualizar ── */}
            <RegistrarDestino
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    refetch()
                    showToast('Destino registrado correctamente', 'success')
                }}
            />

            <ActualizarDestino
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setDestinoEditar(null) }}
                destino={destinoEditar}
                onSuccess={() => {
                    refetch()
                    showToast('Destino actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarDestino
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, ciudad: '', habilitadoActual: null })}
                onConfirm={onConfirmar}
            />
        </Box>
    )
}

export default ListarDestino
