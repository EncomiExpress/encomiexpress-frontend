import { useState, useRef } from 'react'
import { useClientes } from './context/ClienteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, IconButton, Tooltip, Button, Avatar, CircularProgress } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import RegistrarCliente from './RegistrarCliente'
import ActualizarCliente from './ActualizarCliente'
import ModalInhabilitarCliente from './ModalInhabilitarCliente'
import ModalConsultarCliente from './ModalConsultarCliente'
import { getPageOfCliente, getClientes } from './services/clienteService.js'

const ListarCliente = () => {
    const { clientes, total, fetchClientes, toggleHabilitadoCliente } = useClientes()
    const { tienePermiso, PERMISOS } = useAuth()
    const { showToast } = useToast()
    const pendingConfirm = useRef(false)
    const [clienteConsulta, setClienteConsulta] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [clienteEditar, setClienteEditar] = useState(null)
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, data: null })

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

    const handleToggleHabilitado = (cliente) => {
        setModalInhabilitar({
            open: true,
            data: {
                idCliente: cliente.idCliente,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                habilitadoActual: cliente.habilitado,
            }
        })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const emptyMessage = filtroEstado !== 'todo'
        ? 'No se encontraron clientes que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron clientes que coincidan con la búsqueda.'
            : 'No hay clientes registrados en el sistema.'

    const columns = [
        {
            key: 'nombre', label: 'Nombre', sortField: 'nombre',
            render: (cliente) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{
                        width: 34, height: 34,
                        backgroundColor: cliente.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        color: cliente.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                    }}>
                        {cliente.iniciales && cliente.iniciales !== 'U' ? cliente.iniciales : (cliente.nombre?.[0] || '') + (cliente.apellido?.[0] || '') || 'C'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                        {cliente.nombre} {cliente.apellido}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'identificacion', label: 'Identificación',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (cliente) => `${cliente.tipoIdentificacion} ${cliente.numeroIdentificacion}`,
        },
        {
            key: 'telefono', label: 'Teléfono',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (cliente) => cliente.telefono,
        },
        {
            key: 'email', label: 'Email',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5, maxWidth: 200 },
            render: (cliente) => (
                <Typography variant="body2" color={theme.palette.text.primary} noWrap>
                    {cliente.email}
                </Typography>
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (cliente) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {tienePermiso(PERMISOS.CONSULTAR_CLIENTE) && (
                        <Tooltip title="Ver detalle">
                            <IconButton
                                size="small"
                                onClick={() => setClienteConsulta(cliente)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                            >
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.ACTUALIZAR_CLIENTE) && (
                        cliente.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar">
                                <IconButton
                                    size="small"
                                    onClick={() => { setClienteEditar(cliente); setModalActualizarOpen(true) }}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                >
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_CLIENTE) && (
                        <ToggleSwitch id={cliente.idCliente} checked={cliente.habilitado} onChange={() => handleToggleHabilitado(cliente)} />
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
                onExited={() => {
                    const data = modalInhabilitar.data
                    const wasPending = pendingConfirm.current
                    pendingConfirm.current = false
                    setModalInhabilitar({ open: false, data: null })
                    if (wasPending && data) {
                        const habilitadoActual = data.habilitadoActual
                        toggleHabilitadoCliente(data.idCliente)
                            .then(() => showToast(`Cliente ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, 'success'))
                            .catch(() => { })
                    }
                }}
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
