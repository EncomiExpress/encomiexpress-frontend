import { useState, useEffect } from 'react'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import {
    Box, Typography, IconButton, Chip, Tooltip,
    Button, Avatar, Select, MenuItem,
    CircularProgress, FormControl,
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import RegistrarUsuario from './RegistrarUsuario'
import ActualizarUsuario from './ActualizarUsuario'
import ModalConsultarUsuario from './ModalConsultarUsuario'
import ModalInhabilitarUsuario from './ModalInhabilitarUsuario'

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem', py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                },
            },
        },
    },
})

const ListarUsuario = () => {
    const { tienePermiso, PERMISOS, getUsuarios, getRolesBackend, habilitarInhabilitarUsuario, usuario: usuarioActual } = useAuth()
    const { showToast } = useToast()

    const [usuarios, setUsuarios] = useState([])
    const [total, setTotal] = useState(0)
    const [roles, setRoles] = useState([])
    const [filtroRol, setFiltroRol] = useState('')
    const [usuarioConsulta, setUsuarioConsulta] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [usuarioEditar, setUsuarioEditar] = useState(null)
    const [confirmToggle, setConfirmToggle] = useState({ open: false, idUsuario: null, nombreCompleto: '', habilitadoActual: false })

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

    const filterMenuProps = getFilterMenuProps(theme)

    useEffect(() => {
        const cargarRoles = async () => {
            try {
                const respuesta = await getRolesBackend({ habilitado: 'true' })
                if (respuesta.success) {
                    setRoles(respuesta.data || [])
                }
            } catch {
                setRoles([])
            }
        }
        cargarRoles()
    }, [getRolesBackend])

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_USUARIO)

    const solicitarToggle = (usuario) => {
        setConfirmToggle({
            open: true,
            idUsuario: usuario.idUsuario,
            nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
            habilitadoActual: usuario.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idUsuario, habilitadoActual } = confirmToggle
        try {
            await habilitarInhabilitarUsuario(idUsuario)
            setUsuarios(prev => prev.map(u =>
                u.idUsuario === idUsuario ? { ...u, habilitado: !u.habilitado } : u
            ))
            showToast(`Usuario ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, 'success')
        } catch (err) {
            showToast(err?.message || 'Error al cambiar el estado', 'error')
            throw err
        }
    }

    const emptyMessage = filtroHabilitado !== 'todo' || filtroRol !== ''
        ? 'No se encontraron usuarios que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron usuarios que coincidan con la búsqueda.'
            : 'No hay usuarios registrados en el sistema.'

    const columns = [
        {
            key: 'nombre', label: 'Nombre', sortField: 'nombre',
            render: (usuario) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{
                        width: 34, height: 34,
                        backgroundColor: usuario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        fontSize: '0.73rem', fontWeight: 700,
                        color: usuario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                    }}>
                        {usuario.iniciales && usuario.iniciales !== 'U' ? usuario.iniciales : (usuario.nombre?.[0] || '') + (usuario.apellido?.[0] || '') || 'U'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                        {usuario.nombre} {usuario.apellido}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'identificacion', label: 'Identificación',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (usuario) => `${usuario.tipoIdentificacion} ${usuario.numeroIdentificacion}`,
        },
        {
            key: 'telefono', label: 'Teléfono',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (usuario) => usuario.telefono || '—',
        },
        {
            key: 'email', label: 'Email',
            cellSx: { fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 },
            render: (usuario) => usuario.email,
        },
        {
            key: 'rol', label: 'Rol', cellSx: { py: 1.5 },
            render: (usuario) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                    <Chip
                        label={usuario.rol?.nombre}
                        size="small"
                        variant="outlined"
                        sx={{ backgroundColor: 'transparent', color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10, borderColor: theme.palette.divider }}
                    />
                </Box>
            ),
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (usuario) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {tienePermiso(PERMISOS.CONSULTAR_USUARIO) && (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => setUsuarioConsulta(usuario)}
                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso(PERMISOS.ACTUALIZAR_USUARIO) && (
                        usuario.habilitado === false ? (
                            <Tooltip title="Habilita el registro para poder editarlo">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : usuario.idUsuario === 1 && usuarioActual?.idUsuario !== 1 ? (
                            <Tooltip title="Esta cuenta administradora solo puede editarse a sí misma">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : usuario.rol?.nombre?.toLowerCase() === 'conductor' ? (
                            <Tooltip title="Este usuario es un conductor: actualízalo desde el módulo de Conductores">
                                <span>
                                    <IconButton size="small" disabled>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Editar">
                                <IconButton size="small"
                                    onClick={() => { setUsuarioEditar(usuario); setModalActualizarOpen(true) }}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )
                    )}
                    {tienePermiso(PERMISOS.INHABILITAR_USUARIO) && usuario.idUsuario !== usuarioActual?.idUsuario && usuario.idUsuario !== 1 && (
                        <ToggleSwitch id={usuario.idUsuario} checked={usuario.habilitado} onChange={() => solicitarToggle(usuario)} />
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

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            displayEmpty
                            value={filtroRol}
                            onChange={e => { setFiltroRol(e.target.value); setPage(1) }}
                            renderValue={v => v ? roles.find(r => r.id === v)?.nombre || 'Rol' : 'Rol'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroRol ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {roles.map((rol) => (
                                <MenuItem key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                    {filtroRol === rol.id && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
