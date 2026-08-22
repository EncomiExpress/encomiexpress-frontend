import { useState } from 'react'
import { useAuth, PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, IconButton, Tooltip, Button, Chip } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import RegistrarRol from './RegistrarRol'
import ActualizarRol from './ActualizarRol'
import ModalConsultarRol from './ModalConsultarRol'
import ModalInhabilitarRol from './ModalInhabilitarRol'

const ListarRol = () => {
    const { tienePermiso, PERMISOS, getRolesBackend, toggleHabilitadoRol } = useAuth()
    const { showToast } = useToast()

    const [roles, setRoles] = useState([])
    const [total, setTotal] = useState(0)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rolEditar, setRolEditar] = useState(null)
    const [rolConsulta, setRolConsulta] = useState(null)
    const [confirmToggle, setConfirmToggle] = useState({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

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

    const handleToggleHabilitado = (id, rolNombre, habilitadoActual) => {
        setConfirmToggle({ open: true, rolId: id, rolNombre, habilitadoActual })
    }

    const onConfirmar = async () => {
        const { rolId, rolNombre, habilitadoActual } = confirmToggle
        let respuesta
        try {
            respuesta = await toggleHabilitadoRol(rolId)
        } catch (error) {
            showToast(error?.message || 'Error al cambiar estado', 'error')
            throw error
        }
        if (respuesta.success) {
            setRoles(prev => prev.map(r => r.id === rolId ? { ...r, habilitado: !habilitadoActual } : r))
            showToast(
                !habilitadoActual
                    ? `Rol "${rolNombre}" habilitado. Todos sus usuarios han sido habilitados.`
                    : `Rol "${rolNombre}" inhabilitado. Todos sus usuarios han sido inhabilitados.`,
                'success'
            )
        } else {
            showToast(respuesta.message || 'Error al cambiar estado', 'error')
            throw new Error(respuesta.message || 'Error al cambiar estado')
        }
    }

    const emptyMessage = debouncedBusqueda.trim() || filtroHabilitado !== 'todo'
        ? 'No se encontraron roles que coincidan con la búsqueda.'
        : 'No hay roles registrados en el sistema.'

    const columns = [
        {
            key: 'nombre', label: 'Rol', sortField: 'nombre', width: '30%',
            render: (rol) => (
                <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                    {rol.nombre}
                </Typography>
            ),
        },
        {
            key: 'descripcion', label: 'Descripción', width: '40%', cellSx: { py: 1.5 },
            render: (rol) => (
                <Typography variant="body2" color={theme.palette.text.secondary} sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rol.descripcion || 'Sin descripción'}
                </Typography>
            ),
        },
        {
            key: 'permisos', label: 'Permisos', width: '25%', cellSx: { py: 1.5 },
            render: (rol) => (
                <Chip
                    label={`${rol.permisos?.length || 0} permisos`}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'transparent', color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10, borderColor: theme.palette.divider }}
                />
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (rol) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {tienePermiso(PERMISOS.CONSULTAR_ROL) && (
                        <Tooltip title="Ver detalle">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.currentTarget.blur(); setRolConsulta(rol) }}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                            >
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.ACTUALIZAR_ROL) && (
                        rol.id === 1 ? (
                            <Tooltip title="El rol de administrador no se puede modificar">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : rol.habilitado === false ? (
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
                                    onClick={(e) => { e.currentTarget.blur(); setRolEditar(rol); setModalActualizarOpen(true) }}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                >
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_ROL) && (
                        <ToggleSwitch id={rol.id} checked={rol.habilitado} onChange={() => handleToggleHabilitado(rol.id, rol.nombre, rol.habilitado)} />
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
