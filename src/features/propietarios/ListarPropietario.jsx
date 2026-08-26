import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { usePropietario } from './context/PropietarioContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarPropietario from './RegistrarPropietario'
import ActualizarPropietario from './ActualizarPropietario'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarPropietario from './components/ModalConsultarPropietario'
import ModalInhabilitarPropietario from './components/ModalInhabilitarPropietario'
import FiltroTipoFlota from './components/FiltroTipoFlota.jsx'
import { getPageOfPropietario, getPropietarios } from './services/propietarioService.js'
import usePropietarioColumns from './hooks/usePropietarioColumns.jsx'
import usePropietarioAcciones from './hooks/usePropietarioAcciones.js'

const ListarPropietario = () => {
    const navigate = useNavigate()
    const [propietarioVer, setPropietarioVer] = useState(null)
    const { showToast } = useToast()
    const [filtroTipoFlota, setFiltroTipoFlota] = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [propietarioEditar, setPropietarioEditar] = useState(null)
    const { propietarios, total, fetchPropietarios } = usePropietario()
    const { usuario, tienePermiso, PERMISOS } = useAuth()

    const { confirmToggle, setConfirmToggle, modalBloqueo, setModalBloqueo, solicitarToggle, onConfirmar } = usePropietarioAcciones()

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
        fetchPage: (signal, params) => fetchPropietarios(signal, { ...params, tipoFlota: filtroTipoFlota || undefined }),
        extraDeps: [filtroTipoFlota],
        fetchPageForHighlight: (id, limit) => getPageOfPropietario(id, limit),
        exportConfig: {
            fetchAll: (params) => getPropietarios(undefined, { ...params, tipoFlota: filtroTipoFlota || undefined, limit: 100000 }),
            mapRow: (propietario) => ({
                'ID': propietario.idPropietario,
                'Nombre': `${propietario.nombre || ''} ${propietario.apellido || ''}`.trim(),
                'Identificación': `${propietario.tipoIdentificacion || ''} ${propietario.numeroIdentificacion || ''}`.trim(),
                'Email': propietario.email,
                'Teléfono': propietario.telefono,
                'Tipo de flota': propietario.tipoFlota,
                'Estado': propietario.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }),
            fileName: 'Propietarios',
            sheetName: 'Propietarios',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const emptyMessage = filtroHabilitado !== 'todo'
        ? 'No se encontraron propietarios que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron propietarios que coincidan con la búsqueda.'
            : 'No hay propietarios registrados en el sistema.'

    const columns = usePropietarioColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setPropietarioVer,
        onEditar: (propietario) => { setPropietarioEditar(propietario); setModalActualizarOpen(true) },
        onToggleHabilitado: solicitarToggle,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Propietarios
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los propietarios de vehículos registrados en el sistema.
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
                        variant="contained" startIcon={<AddOutlinedIcon sx={{ fontSize: 20 }} />}
                        sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                        }}>
                        Nuevo
                    </Button>
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
                    <FiltroTipoFlota theme={theme} filtroTipoFlota={filtroTipoFlota} setFiltroTipoFlota={setFiltroTipoFlota} setPage={setPage} />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar propietarios..." />
            </Box>

            <DataTable
                columns={columns}
                rows={propietarios}
                rowKey={(propietario) => propietario.idPropietario}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(propietario) => ({ opacity: propietario.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando propietarios..."
                errorMessage="No se pudieron cargar los propietarios. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {propietarioVer && (
                <ModalConsultarPropietario propietario={propietarioVer} onClose={() => setPropietarioVer(null)} />
            )}

            <RegistrarPropietario
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    refetch()
                    showToast('Propietario registrado correctamente', 'success')
                }}
            />

            <ActualizarPropietario
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setPropietarioEditar(null) }}
                propietario={propietarioEditar}
                onSuccess={() => {
                    refetch()
                    showToast('Propietario actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarPropietario
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, idPropietario: null, nombreCompleto: '', habilitadoActual: false })}
                onConfirm={onConfirmar}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="propietario"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

        </Box>
    )
}

export default ListarPropietario
