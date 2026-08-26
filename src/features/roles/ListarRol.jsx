import { useState } from 'react'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, Button } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import useRolColumns from './hooks/useRolColumns.jsx'
import useRolAcciones from './hooks/useRolAcciones.js'
import RegistrarRol from './RegistrarRol'
import ActualizarRol from './ActualizarRol'
import ModalConsultarRol from './components/ModalConsultarRol'
import ModalInhabilitarRol from './components/ModalInhabilitarRol'

const ListarRol = () => {
    const { tienePermiso, getRolesBackend } = useAuth()
    const { showToast } = useToast()

    const [roles, setRoles] = useState([])
    const [total, setTotal] = useState(0)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rolEditar, setRolEditar] = useState(null)
    const [rolConsulta, setRolConsulta] = useState(null)

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

    const { confirmToggle, setConfirmToggle, handleToggleHabilitado, onConfirmar } = useRolAcciones(setRoles)

    const {
        theme,
        loading, error, initialLoad,
        busqueda, setBusqueda, debouncedBusqueda,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        page, setPage, rowsPerPage, setRowsPerPage,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
        refetch: cargarRoles,
    } = useEntityCrud({
        fetchPage: async (signal, params) => {
            const respuesta = await getRolesBackend(params)
            if (respuesta.success) {
                setRoles(respuesta.data || [])
                setTotal(respuesta.total ?? (respuesta.data || []).length)
            } else {
                setRoles([])
                setTotal(0)
            }
        },
        defaultRowsPerPage: 10,
    })

    const emptyMessage = debouncedBusqueda.trim() || filtroHabilitado !== 'todo'
        ? 'No se encontraron roles que coincidan con la búsqueda.'
        : 'No hay roles registrados en el sistema.'

    const columns = useRolColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setRolConsulta,
        onEditar: (rol) => { setRolEditar(rol); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Roles
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los roles de usuario en el sistema.
                    </Typography>
                </Box>
                {puedeRegistrar && (
                    <Button
                        onClick={(e) => { e.currentTarget.blur(); setModalRegistrarOpen(true) }}
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 2,
                            textTransform: 'none',
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <FiltroEstadoTabs
                    value={filtroHabilitado}
                    onChange={setFiltroHabilitado}
                    containerRef={filtroContainerRef}
                    btnRefs={filtroBtnRefs}
                    pillStyle={filtroPillStyle}
                />
                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar roles..." />
            </Box>

            <DataTable
                columns={columns}
                rows={roles}
                rowKey={(rol) => rol.id}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                rowSx={(rol) => ({ opacity: rol.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando roles..."
                errorMessage="No se pudieron cargar los roles. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            <ModalConsultarRol rol={rolConsulta} onClose={() => setRolConsulta(null)} />

            <RegistrarRol
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    cargarRoles()
                    showToast('Rol registrado correctamente', 'success')
                }}
            />

            <ActualizarRol
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setRolEditar(null) }}
                rol={rolEditar}
                onSuccess={() => {
                    cargarRoles()
                    showToast('Rol actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarRol
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })}
                onConfirm={onConfirmar}
            />

        </Box>
    )
}

export default ListarRol
