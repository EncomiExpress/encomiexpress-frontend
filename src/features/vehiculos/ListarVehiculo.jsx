import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { useVehiculo } from './context/VehiculoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarVehiculo from './RegistrarVehiculo'
import ActualizarVehiculo from './ActualizarVehiculo'
import ModalConsultarVehiculo from './components/ModalConsultarVehiculo'
import ModalInhabilitarVehiculo from './components/ModalInhabilitarVehiculo'
import ModalCambioEstadoVehiculo from './components/ModalCambioEstadoVehiculo.jsx'
import FiltroEstadoTipoVehiculo from './components/FiltroEstadoTipoVehiculo.jsx'
import { getPageOfVehiculo, getVehiculos as getVehiculosApi } from './services/vehiculoService.js'
import { capitalizarPrimeraLetra } from '../../shared/utils/formatters.js'
import useVehiculoColumns from './hooks/useVehiculoColumns.jsx'
import useVehiculoAcciones from './hooks/useVehiculoAcciones.js'
import useVehiculosEnRuta from './hooks/useVehiculosEnRuta.js'

const ListarTransporte = () => {
    const [vehiculoVer, setVehiculoVer] = useState(null)
    const { showToast } = useToast()
    const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [vehiculoEditar, setVehiculoEditar] = useState(null)
    const { getVehiculos, getTotal, fetchVehiculos } = useVehiculo()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    const transportes = getVehiculos()
    const totalBackend = getTotal()

    const {
        estadoMenu, setEstadoMenu,
        confirmMantenimiento, setConfirmMantenimiento,
        confirmandoEstado,
        confirmInhabilitar, setConfirmInhabilitar,
        rutasMantenimiento, setRutasMantenimiento,
        handleToggleHabilitado, onConfirmar,
        handleSeleccionarEstado, handleConfirmarMantenimiento,
    } = useVehiculoAcciones()

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
    } = useEntityCrud({
        fetchPage: (signal, params) => fetchVehiculos(signal, {
            ...params,
            estado: filtroEstadoVehiculo === '' || filtroEstadoVehiculo === 'En Ruta' ? undefined : filtroEstadoVehiculo,
            tipo: filtroTipo || undefined,
        }),
        extraDeps: [filtroEstadoVehiculo, filtroTipo],
        fetchPageForHighlight: (id, limit) => getPageOfVehiculo(id, limit),
        exportConfig: {
            fetchAll: (params) => getVehiculosApi(undefined, {
                ...params,
                estado: filtroEstadoVehiculo === '' || filtroEstadoVehiculo === 'En Ruta' ? undefined : filtroEstadoVehiculo,
                tipo: filtroTipo || undefined,
                limit: 100000,
            }),
            mapRow: (vehiculo) => ({
                'ID': vehiculo.idVehiculo,
                'Placa': vehiculo.placa,
                'Marca': capitalizarPrimeraLetra(vehiculo.marca),
                'Modelo': vehiculo.modelo,
                'Tipo': vehiculo.tipo,
                'Capacidad (kg)': vehiculo.capacidad,
                'Propietario': vehiculo.propietario ? `${vehiculo.propietario.nombre} ${vehiculo.propietario.apellido}`.trim() : '-',
                'Vencimiento SOAT': vehiculo.vencimientoSOAT,
                'Vencimiento Rev. Técnica': vehiculo.vencimientoRevisionTecnica,
                'Vencimiento Seguro Terceros': vehiculo.vencimientoSeguroTerceros,
                'Estado': (vehiculosOcupadosIds.has(vehiculo.idVehiculo) ? 'En Ruta' : vehiculo.estado),
                'Habilitado': vehiculo.habilitado === false ? 'No' : 'Sí',
            }),
            fileName: 'Vehiculos',
            sheetName: 'Vehículos',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const { vehiculosOcupadosIds, transportesConEstado } = useVehiculosEnRuta(transportes, usuario)

    // Re-filtro en cliente: el backend ya filtra, pero "En Ruta" es un estado
    // derivado (vehiculosOcupadosIds) que el backend no conoce.
    const filteredTransportes = transportesConEstado.filter(t => {
        const q = debouncedBusqueda.toLowerCase()
        const coincideBusqueda = !q ||
            t.placa.toLowerCase().includes(q) ||
            (t.marca || '').toLowerCase().includes(q) ||
            (t.modelo || '').toLowerCase().includes(q) ||
            (t.tipo || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && t.habilitado !== false) ||
            (filtroHabilitado === 'inhabilitado' && t.habilitado === false)

        const coincideEstado = filtroEstadoVehiculo === '' || t.estadoEfectivo === filtroEstadoVehiculo

        return coincideBusqueda && coincideHabilitado && coincideEstado
    })

    const emptyMessage = filtroEstadoVehiculo !== '' || filtroTipo !== '' || filtroHabilitado !== 'todo'
        ? 'No se encontraron vehículos que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron vehículos que coincidan con la búsqueda.'
            : 'No hay vehículos registrados en el sistema.'

    const columns = useVehiculoColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setVehiculoVer,
        onEditar: (transporte) => { setVehiculoEditar(transporte); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
        onAbrirMenuEstado: (anchor, id, estadoActual) => setEstadoMenu({ anchor, id, estadoActual }),
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Vehículos
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los vehículos registrados en el sistema.
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

                     {tienePermiso(PERMISOS.REGISTRAR_VEHICULO) && (
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <FiltroEstadoTabs
                        value={filtroHabilitado}
                        onChange={setFiltroHabilitado}
                        containerRef={filtroContainerRef}
                        btnRefs={filtroBtnRefs}
                        pillStyle={filtroPillStyle}
                    />
                    <FiltroEstadoTipoVehiculo
                        theme={theme}
                        filtroEstadoVehiculo={filtroEstadoVehiculo}
                        setFiltroEstadoVehiculo={setFiltroEstadoVehiculo}
                        filtroTipo={filtroTipo}
                        setFiltroTipo={setFiltroTipo}
                        setPage={setPage}
                    />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar vehículos..." width={280} />
            </Box>

            <DataTable
                columns={columns}
                rows={filteredTransportes}
                rowKey={(transporte) => transporte.idVehiculo}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(transporte) => ({ opacity: transporte.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando vehículos..."
                errorMessage="No se pudieron cargar los vehículos. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={totalBackend}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {vehiculoVer && (
                <ModalConsultarVehiculo vehiculo={vehiculoVer} onClose={() => setVehiculoVer(null)} />
            )}

            <RegistrarVehiculo
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchVehiculos()
                    showToast('Vehículo registrado correctamente', 'success')
                }}
            />

            <ActualizarVehiculo
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVehiculoEditar(null) }}
                transporte={vehiculoEditar}
                onSuccess={() => {
                    fetchVehiculos()
                    showToast('Vehículo actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarVehiculo
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, habilitadoActual: null, placa: '', estadoVehiculo: null })}
                onConfirm={onConfirmar}
            />

            <ModalCambioEstadoVehiculo
                theme={theme}
                estadoMenu={estadoMenu}
                onCloseMenu={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                onSeleccionarEstado={handleSeleccionarEstado}
                confirmMantenimiento={confirmMantenimiento}
                onCloseMantenimiento={() => setConfirmMantenimiento({ open: false, id: null })}
                onExitedMantenimiento={() => setRutasMantenimiento({ data: [], loading: false })}
                rutasMantenimiento={rutasMantenimiento}
                confirmandoEstado={confirmandoEstado}
                onConfirmarMantenimiento={handleConfirmarMantenimiento}
            />

        </Box>
    )
}

export default ListarTransporte
