import { useState } from 'react'
import { useVentas, ESTADOS_ENCOMIENDA, METODOS_PAGO, ESTADOS_PAGO } from './context/VentaContext.jsx'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getPageOfEncomienda } from './services/ventaService.js'
import RegistrarVenta from './RegistrarVenta'
import ActualizarVenta from './ActualizarVenta'
import ModalInhabilitarVenta from './components/ModalInhabilitarVenta'
import ModalConsultarVenta from './components/ModalConsultarVenta'
import FiltroVenta from './components/FiltroVenta.jsx'
import ModalCambioEstadoVenta from './components/ModalCambioEstadoVenta.jsx'
import ModalCambioPagoVenta from './components/ModalCambioPagoVenta.jsx'
import useVentaColumns from './hooks/useVentaColumns.jsx'
import useVentaAcciones from './hooks/useVentaAcciones.js'
import useVentaExport from './hooks/useVentaExport.js'

const ListarVenta = () => {
    const { ventas, total, fetchVentas } = useVentas()
    const { tienePermiso } = useAuth()
    const { showToast } = useToast()

    const [filtroEstadoEncomienda, setFiltroEstadoEncomienda] = useState('')
    const [filtroPago, setFiltroPago] = useState('')
    const [filtroMetodoPago, setFiltroMetodoPago] = useState('')
    const [ventaConsulta, setVentaConsulta] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [ventaEditar, setVentaEditar] = useState(null)

    const {
        modalInhabilitar, setModalInhabilitar,
        pagoMenuAnchor, setPagoMenuAnchor, pagoMenuId, setPagoMenuId, confirmPago, setConfirmPago,
        estadoMenuAnchor, setEstadoMenuAnchor, estadoMenuId, setEstadoMenuId, confirmCancelar, setConfirmCancelar,
        confirmandoEstado,
        handleDescargarGuia, handleToggleHabilitado, handleConfirmarToggle, handleExitedInhabilitar,
        handlePagoConfirm, handleCancelarConfirm,
    } = useVentaAcciones()

    const {
        theme,
        highlightId, highlightRef,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        page, setPage, rowsPerPage, setRowsPerPage,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
    } = useEntityCrud({
        fetchPage: (signal, params) => fetchVentas(signal, {
            ...params,
            estado: filtroEstadoEncomienda || undefined,
            estadoPago: filtroPago || undefined,
            metodoPago: filtroMetodoPago || undefined,
        }),
        extraDeps: [filtroEstadoEncomienda, filtroPago, filtroMetodoPago],
        fetchPageForHighlight: (id, limit) => getPageOfEncomienda(id, limit),
    })

    const { exportando, handleExportar } = useVentaExport({
        theme, debouncedBusqueda, filtroHabilitado, filtroEstadoEncomienda, filtroPago, filtroMetodoPago,
    })

    const emptyMessage = filtroHabilitado !== 'todo' || filtroEstadoEncomienda !== '' || filtroPago !== '' || filtroMetodoPago !== ''
        ? 'No se encontraron ventas que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron ventas que coincidan con la búsqueda.'
            : 'No hay ventas registradas en el sistema.'

    const columns = useVentaColumns({
        theme, debouncedBusqueda, tienePermiso, PERMISOS,
        onConsultar: setVentaConsulta,
        onDescargarGuia: handleDescargarGuia,
        onEditar: (venta) => { setVentaEditar(venta); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
        onAbrirMenuPago: (anchor, id) => { setPagoMenuAnchor(anchor); setPagoMenuId(id) },
        onAbrirMenuEstado: (anchor, id) => { setEstadoMenuAnchor(anchor); setEstadoMenuId(id) },
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Ventas
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las ventas y encomiendas registradas en el sistema.
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

                    <FiltroVenta
                        theme={theme}
                        filtroEstadoEncomienda={filtroEstadoEncomienda} setFiltroEstadoEncomienda={setFiltroEstadoEncomienda} estadosEncomienda={ESTADOS_ENCOMIENDA}
                        filtroMetodoPago={filtroMetodoPago} setFiltroMetodoPago={setFiltroMetodoPago} metodosPago={METODOS_PAGO}
                        filtroPago={filtroPago} setFiltroPago={setFiltroPago} estadosPago={ESTADOS_PAGO}
                        setPage={setPage}
                    />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar ventas..." />
            </Box>

            <DataTable
                columns={columns}
                rows={ventas}
                rowKey={(venta) => venta.idEncomiendaVenta}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(venta) => ({ opacity: venta.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando ventas..."
                errorMessage="No se pudieron cargar las ventas. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <ModalConsultarVenta venta={ventaConsulta} onClose={() => setVentaConsulta(null)} />

            <RegistrarVenta
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    setModalRegistrarOpen(false)
                    showToast('Venta registrada correctamente.', 'success')
                }}
            />

            <ActualizarVenta
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVentaEditar(null) }}
                venta={ventaEditar}
                onSuccess={() => {
                    setModalActualizarOpen(false)
                    setVentaEditar(null)
                    showToast('Venta actualizada correctamente.', 'success')
                }}
            />

            <ModalInhabilitarVenta
                open={modalInhabilitar.open}
                venta={modalInhabilitar.venta}
                onClose={() => setModalInhabilitar(s => ({ ...s, open: false }))}
                onExited={handleExitedInhabilitar}
                onConfirm={handleConfirmarToggle}
            />

            <ModalCambioEstadoVenta
                theme={theme}
                estadoMenuAnchor={estadoMenuAnchor}
                onCloseMenu={() => { setEstadoMenuAnchor(null); setEstadoMenuId(null) }}
                onSeleccionarCancelar={() => { const id = estadoMenuId; setEstadoMenuAnchor(null); setEstadoMenuId(null); setConfirmCancelar({ open: true, id }) }}
                confirmCancelar={confirmCancelar}
                onCloseConfirm={() => setConfirmCancelar({ open: false, id: null })}
                confirmandoEstado={confirmandoEstado}
                onConfirmar={handleCancelarConfirm}
            />

            <ModalCambioPagoVenta
                theme={theme}
                pagoMenuAnchor={pagoMenuAnchor}
                onCloseMenu={() => { setPagoMenuAnchor(null); setPagoMenuId(null) }}
                onSeleccionarPagado={() => { setPagoMenuAnchor(null); setConfirmPago({ open: true, id: pagoMenuId }); setPagoMenuId(null) }}
                confirmPago={confirmPago}
                onCloseConfirm={() => setConfirmPago({ open: false, id: null })}
                confirmandoEstado={confirmandoEstado}
                onConfirmar={handlePagoConfirm}
            />

        </Box>
    )
}

export default ListarVenta
