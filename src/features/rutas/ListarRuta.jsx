import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, Button, ButtonBase } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import { getRutas } from './services/rutaService.js'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarRuta from './RegistrarRuta.jsx'
import ActualizarRuta from './ActualizarRuta.jsx'
import ModalConsultarRuta from './components/ModalConsultarRuta.jsx'
import ModalInhabilitarRuta from './components/ModalInhabilitarRuta.jsx'
import useRutaColumns from './hooks/useRutaColumns.jsx'
import useRutaAcciones from './hooks/useRutaAcciones.js'

// Listado de plantillas de Ruta — CRUD liviano (nombre, destino, observaciones,
// habilitado). La agenda concreta (fecha/hora/estado/convoy) se gestiona en la
// feature "Programación de Salidas" (src/features/salidas), no acá.
const ListarRuta = () => {
    const navigate = useNavigate()
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const { showToast } = useToast()
    const [rutaVer, setRutaVer] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar] = useState(null)
    // "Rutas de ida" (normal) vs "Rutas de regreso" (2026-09-17): la plantilla
    // compartida "Medellín" nunca se muestra como fila propia -- en su lugar, esta
    // pestaña muestra las MISMAS rutas reales que ya tienen al menos un regreso
    // registrado, con el corredor invertido (ver rutaResolvers.getRutaLabelRegreso).
    // Vive en la URL (no useState) para que persista al entrar a "Salidas" de una
    // fila y volver -- si no, cada vuelta reseteaba la pestaña a "Ida" sin avisar.
    const [searchParams, setSearchParams] = useSearchParams()
    const tipoRuta = searchParams.get('tipo') === 'regreso' ? 'regreso' : 'ida'
    const setTipoRuta = (tipo) => setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        if (tipo === 'regreso') next.set('tipo', 'regreso')
        else next.delete('tipo')
        return next
    }, { replace: true })

    // Estado propio de esta tabla paginada (no el arreglo compartido de
    // RutaContext, que otras pantallas usan con limit alto para Autocompletes —
    // ver LOGICA.md, "Bug transversal — listas paginadas corrompidas por
    // prefetch compartido").
    const [rutas, setRutas] = useState([])
    const [total, setTotal] = useState(0)

    const {
        theme,
        highlightId, highlightRef,
        loading, error, initialLoad,
        busqueda: searchTerm, setBusqueda: setSearchTerm, debouncedBusqueda: debouncedSearch,
        filtroEstado: filtroHabilitado, setFiltroEstado: setFiltroHabilitado,
        sortBy, handleSort,
        refetch,
        page, setPage, rowsPerPage, setRowsPerPage,
        filtroContainerRef, filtroBtnRefs, filtroPillStyle,
    } = useEntityCrud({
        fetchPage: async (signal, params) => {
            if (!usuario) return
            const res = await getRutas({ ...params, tipo: tipoRuta }, signal)
            setRutas(res?.data ?? [])
            setTotal(res?.total ?? (res?.data ?? []).length)
        },
        extraDeps: [usuario, tipoRuta],
        enabled: !!usuario,
    })

    const { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmar } = useRutaAcciones(refetch)

    useEffect(() => {
        if (!usuario) navigate('/login')
    }, [usuario, navigate])

    const emptyMessage = filtroHabilitado !== 'todo'
        ? 'No se encontraron rutas que coincidan con los filtros aplicados.'
        : debouncedSearch.trim()
            ? 'No se encontraron rutas que coincidan con la búsqueda.'
            : tipoRuta === 'regreso'
                ? 'Ninguna sede tiene un regreso registrado todavía.'
                : 'No hay rutas registradas en el sistema.'

    // "Salidas": lleva a la sub-vista de Programación de Salidas SCOPED a esta
    // plantilla (/transporte/rutas/:idRuta/salidas) — ya no existe una vista
    // global de Salidas; solo se llega a ella eligiendo una Ruta primero. En la
    // pestaña "Rutas de regreso" la URL sigue siendo la de la ruta real (idRuta no
    // cambia, sigue siendo la misma fila) pero con ?vista=regreso: ahí
    // ListarSalidaProgramada.jsx pide las salidas de regreso de esa ruta en vez de
    // sus idas (ver salidaProgramadaService.buildRutaWhere, filtro regresoDeRuta).
    const handleVerSalidas = (ruta) => {
        navigate(`/transporte/rutas/${ruta.idRuta}/salidas${tipoRuta === 'regreso' ? '?vista=regreso' : ''}`)
    }

    // Compacto a propósito: vive pegado al encabezado "Ruta" de la tabla (ver
    // DataTable.jsx, `headerExtra`), no suelto arriba como un filtro más.
    const tipoRutaToggle = (
        <Box sx={{ display: 'inline-flex', gap: 0.3, p: 0.25, borderRadius: 1.5, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
            {[{ value: 'ida', label: 'Ida' }, { value: 'regreso', label: 'Regreso' }].map((op) => (
                <ButtonBase
                    key={op.value}
                    onClick={() => { setTipoRuta(op.value); setPage(1) }}
                    disableRipple
                    sx={{
                        px: 1, py: 0.3, borderRadius: 1, fontSize: '0.68rem', fontWeight: 700, textTransform: 'none',
                        color: tipoRuta === op.value ? '#fff' : theme.palette.text.secondary,
                        backgroundColor: tipoRuta === op.value ? theme.palette.primary.main : 'transparent',
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                    }}
                >
                    {op.label}
                </ButtonBase>
            ))}
        </Box>
    )

    const columns = useRutaColumns({
        theme, tienePermiso, PERMISOS,
        onConsultar: setRutaVer,
        onEditar: (ruta) => { setRutaEditar(ruta); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
        onVerSalidas: handleVerSalidas,
        invertirLabel: tipoRuta === 'regreso',
        headerExtraRuta: tipoRutaToggle,
    })

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Rutas
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las plantillas de corredor reutilizables (destino y observaciones). Para programar viajes concretos, ve a Programación de Salidas.
                    </Typography>
                </Box>
                {tienePermiso(PERMISOS.REGISTRAR_RUTA) && (
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                <FiltroEstadoTabs
                    value={filtroHabilitado}
                    onChange={setFiltroHabilitado}
                    containerRef={filtroContainerRef}
                    btnRefs={filtroBtnRefs}
                    pillStyle={filtroPillStyle}
                />
                <BuscadorField
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar rutas..."
                />
            </Box>

            <DataTable
                columns={columns}
                rows={rutas}
                rowKey={(ruta) => ruta.idRuta}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                onRowClick={handleVerSalidas}
                rowSx={(ruta) => ({ opacity: ruta.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando rutas..."
                errorMessage="No se pudieron cargar las rutas. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {rutaVer && (
                <ModalConsultarRuta ruta={rutaVer} onClose={() => setRutaVer(null)} />
            )}

            <RegistrarRuta
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => { refetch(); showToast('Ruta registrada correctamente', 'success') }}
            />

            <ActualizarRuta
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setRutaEditar(null) }}
                ruta={rutaEditar}
                onSuccess={() => { refetch(); showToast('Ruta actualizada correctamente', 'success') }}
            />

            <ModalInhabilitarRuta
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, etiqueta: '', habilitadoActual: null })}
                onConfirm={onConfirmar}
            />
        </Box>
    )
}

export default ListarRuta
