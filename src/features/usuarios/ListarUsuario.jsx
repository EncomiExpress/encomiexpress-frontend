import { useState } from 'react'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import RegistrarUsuario from './RegistrarUsuario'
import ActualizarUsuario from './ActualizarUsuario'
import ModalConsultarUsuario from './components/ModalConsultarUsuario'
import ModalInhabilitarUsuario from './components/ModalInhabilitarUsuario'
import FiltroRol from './components/FiltroRol.jsx'
import useUsuarioColumns from './hooks/useUsuarioColumns.jsx'
import useUsuarioAcciones from './hooks/useUsuarioAcciones.js'

const ListarUsuario = () => {
    const { tienePermiso, PERMISOS, getUsuarios, usuario: usuarioActual } = useAuth()
    const { showToast } = useToast()

    const [usuarios, setUsuarios] = useState([])
    const [total, setTotal] = useState(0)
    const [filtroRol, setFiltroRol] = useState('')
    const [usuarioConsulta, setUsuarioConsulta] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [usuarioEditar, setUsuarioEditar] = useState(null)

    const { confirmToggle, setConfirmToggle, solicitarToggle, onConfirmar } = useUsuarioAcciones(setUsuarios)

    const {
        theme,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        page, setPage, rowsPerPage, setRowsPerPage,
        exportando, handleExportar,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
        refetch: cargarUsuarios,
    } = useEntityCrud({
        fetchPage: async (signal, params) => {
            const respuesta = await getUsuarios({ ...params, idRol: filtroRol || undefined })
            setUsuarios(Array.isArray(respuesta.data) ? respuesta.data : [])
            setTotal(typeof respuesta.total === 'number' ? respuesta.total : (Array.isArray(respuesta.data) ? respuesta.data.length : 0))
        },
        extraDeps: [filtroRol],
        exportConfig: {
            fetchAll: async (params) => {
                const respuesta = await getUsuarios({ ...params, idRol: filtroRol || undefined, limit: 100000 })
                return { data: Array.isArray(respuesta.data) ? respuesta.data : [] }
            },
            mapRow: (usuario) => ({
                'ID': usuario.idUsuario,
                'Nombre': `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
                'Identificación': `${usuario.tipoIdentificacion || ''} ${usuario.numeroIdentificacion || ''}`.trim(),
                'Email': usuario.email,
                'Teléfono': usuario.telefono,
                'Rol': usuario.rol?.nombre || usuario.idRol || '-',
                'Estado': usuario.habilitado === false ? 'Inhabilitado' : 'Habilitado',
            }),
            fileName: 'Usuarios',
            sheetName: 'Usuarios',
        },
        onExportError: (err) => showToast(err.message || 'Error al exportar.', 'error'),
    })

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_USUARIO)

    const emptyMessage = filtroHabilitado !== 'todo' || filtroRol !== ''
        ? 'No se encontraron usuarios que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron usuarios que coincidan con la búsqueda.'
            : 'No hay usuarios registrados en el sistema.'

    const columns = useUsuarioColumns({
        theme, tienePermiso, PERMISOS, usuarioActual,
        onConsultar: setUsuarioConsulta,
        onEditar: (usuario) => { setUsuarioEditar(usuario); setModalActualizarOpen(true) },
        onToggleHabilitado: solicitarToggle,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Usuarios
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los usuarios registrados en el sistema.
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

                    {puedeRegistrar && (
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

                    <FiltroRol theme={theme} filtroRol={filtroRol} setFiltroRol={setFiltroRol} setPage={setPage} />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar usuarios..." width={280} />
            </Box>

            <DataTable
                columns={columns}
                rows={usuarios}
                rowKey={(usuario) => usuario.idUsuario}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                rowSx={(usuario) => ({ opacity: usuario.habilitado ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando usuarios..."
                errorMessage="No se pudieron cargar los usuarios. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <ModalConsultarUsuario usuario={usuarioConsulta} onClose={() => setUsuarioConsulta(null)} />

            <RegistrarUsuario
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    cargarUsuarios()
                    showToast('Usuario registrado correctamente', 'success')
                }}
            />

            <ActualizarUsuario
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setUsuarioEditar(null) }}
                usuario={usuarioEditar}
                onSuccess={() => {
                    cargarUsuarios()
                    showToast('Usuario actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarUsuario
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, idUsuario: null, nombreCompleto: '', habilitadoActual: false })}
                onConfirm={onConfirmar}
            />
        </Box>
    )
}

export default ListarUsuario
