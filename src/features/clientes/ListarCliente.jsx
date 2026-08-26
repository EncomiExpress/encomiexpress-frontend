import { useState } from 'react'
import { useClientes } from './context/ClienteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import RegistrarCliente from './RegistrarCliente'
import ActualizarCliente from './ActualizarCliente'
import ModalInhabilitarCliente from './components/ModalInhabilitarCliente'
import ModalConsultarCliente from './components/ModalConsultarCliente'
import { getPageOfCliente, getClientes } from './services/clienteService.js'
import useClienteColumns from './hooks/useClienteColumns.jsx'
import useClienteAcciones from './hooks/useClienteAcciones.js'

const ListarCliente = () => {
    const { clientes, total, fetchClientes } = useClientes()
    const { tienePermiso, PERMISOS } = useAuth()
    const { showToast } = useToast()
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [clienteEditar, setClienteEditar] = useState(null)

    const { modalInhabilitar, setModalInhabilitar, handleToggleHabilitado, handleConfirmarToggle, handleExited } = useClienteAcciones()

    const {
        theme,
        highlightId, highlightRef,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado, setFiltroEstado,
        sortBy, handleSort,
        page, setPage, rowsPerPage, setRowsPerPage,
        exportando, handleExportar,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
    } = useEntityCrud({
        fetchPage: (signal, params) => fetchClientes(signal, params),
        fetchPageForHighlight: (id, limit) => getPageOfCliente(id, limit),
        exportConfig: {
            fetchAll: (params) => getClientes(undefined, { ...params, limit: 100000 }),
            mapRow: (cliente) => ({
                'ID': cliente.idCliente,
                'Nombre': `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
                'Identificación': `${cliente.tipoIdentificacion || ''} ${cliente.numeroIdentificacion || ''}`.trim(),
                'Email': cliente.email,
                'Teléfono': cliente.telefono,
                'Dirección': cliente.direccion,
                'Estado': cliente.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }),
            fileName: 'Clientes',
            sheetName: 'Clientes',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    const emptyMessage = filtroEstado !== 'todo'
        ? 'No se encontraron clientes que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron clientes que coincidan con la búsqueda.'
            : 'No hay clientes registrados en el sistema.'

    const columns = useClienteColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setClienteConsulta,
        onEditar: (cliente) => { setClienteEditar(cliente); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Clientes
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los clientes registrados en el sistema.
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

                    {tienePermiso(PERMISOS.REGISTRAR_CLIENTE) && (
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <FiltroEstadoTabs
                    value={filtroEstado}
                    onChange={setFiltroEstado}
                    containerRef={filtroContainerRef}
                    btnRefs={filtroBtnRefs}
                    pillStyle={filtroPillStyle}
                />
                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar clientes..." />
            </Box>

            <DataTable
                columns={columns}
                rows={clientes}
                rowKey={(cliente) => cliente.idCliente}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(cliente) => ({ opacity: cliente.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando clientes..."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <ModalConsultarCliente cliente={clienteConsulta} onClose={() => setClienteConsulta(null)} />

            <ModalInhabilitarCliente
                open={modalInhabilitar.open}
                data={modalInhabilitar.data}
                onClose={() => setModalInhabilitar(s => ({ ...s, open: false }))}
                onExited={handleExited}
                onConfirm={handleConfirmarToggle}
            />

            <RegistrarCliente
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    showToast('Cliente registrado correctamente', 'success')
                }}
            />

            <ActualizarCliente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setClienteEditar(null) }}
                cliente={clienteEditar}
                onSuccess={() => {
                    showToast('Cliente actualizado correctamente', 'success')
                }}
            />
        </Box>
    )
}

export default ListarCliente
