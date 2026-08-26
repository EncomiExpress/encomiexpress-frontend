import { useState, useEffect } from 'react'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import useEntityCrud from '../../shared/hooks/useEntityCrud.js'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente'
import ModalInhabilitarAnticipo from './components/ModalInhabilitarAnticipo'
import ModalConsultarAnticipoExcedente from './components/ModalConsultarAnticipoExcedente'
import ModalConfirmarExcedente from './components/ModalConfirmarExcedente.jsx'
import FiltroAnticipo from './components/FiltroAnticipo.jsx'
import { getPageOfAnticipo, getAniosDisponiblesAnticipo } from './services/anticipoService.js'
import useAnticipoAcciones from './hooks/useAnticipoAcciones.js'
import useAnticipoExport from './hooks/useAnticipoExport.js'
import useAnticipoColumns from './hooks/useAnticipoColumns.jsx'

// ── Componente principal ─────────────────────────────────────────────────────
const ListarAnticipoExcedente = () => {
    const { anticipos, total, conductores, rutas, fetchAnticipos } = useAnticipos()
    const { tienePermiso, PERMISOS } = useAuth()
    const { showToast } = useToast()

    const [filtroEstadoAnticipo, setFiltroEstadoAnticipo] = useState('')
    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [anticipoEditar, setAnticipoEditar] = useState(null)

    const {
        modalInhabilitar, setModalInhabilitar,
        confirmDev, setConfirmDev,
        confirmandoEstado,
        handleToggleHabilitado, handleConfirmarToggle, handleExitedInhabilitar, handleConfirmarDevolucion,
    } = useAnticipoAcciones()

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
        fetchPage: (signal, params) => fetchAnticipos(signal, {
            ...params,
            estado: filtroEstadoAnticipo || undefined,
            anio: filtroAnio || undefined,
            mes: filtroMes || undefined,
        }),
        extraDeps: [filtroEstadoAnticipo, filtroAnio, filtroMes],
        fetchPageForHighlight: (id, limit) => getPageOfAnticipo(id, limit),
    })

    // Helpers para resolver nombres desde los arrays del contexto
    const getNombreConductor = (anticipo) => {
        if (anticipo?.conductor?.usuario) {
            const { nombre, apellido } = anticipo.conductor.usuario
            return apellido ? `${nombre} ${apellido}` : (nombre || '—')
        }
        const c = conductores.find(c => c.idConductor === parseInt(anticipo?.idConductor))
        return c ? c.nombre : '—'
    }

    const { exportando, handleExportar } = useAnticipoExport({
        theme, getNombreConductor, debouncedBusqueda, filtroHabilitado, filtroEstadoAnticipo, filtroAnio, filtroMes,
    })

    useEffect(() => {
        getAniosDisponiblesAnticipo()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    const emptyMessage = filtroHabilitado !== 'todo' || filtroEstadoAnticipo !== '' || filtroAnio !== '' || filtroMes !== ''
        ? 'No se encontraron anticipos que coincidan con los filtros aplicados.'
        : debouncedBusqueda.trim()
            ? 'No se encontraron anticipos que coincidan con la búsqueda.'
            : 'No hay anticipos registrados en el sistema.'

    const columns = useAnticipoColumns({
        theme, getNombreConductor, tienePermiso, PERMISOS,
        onConsultar: setAnticipoConsulta,
        onEditar: (anticipo) => { setAnticipoEditar(anticipo); setModalActualizarOpen(true) },
        onToggleHabilitado: handleToggleHabilitado,
        onSolicitarConfirmarExcedente: (id, esFaltante) => setConfirmDev({ open: true, id, esFaltante }),
    })

    return (
        <Box sx={{ p: 3.5 }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Anticipos y Excedentes
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los anticipos y excedentes de los conductores.
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

                    {tienePermiso(PERMISOS.REGISTRAR_ANTICIPO) && (
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

                    <FiltroAnticipo
                        theme={theme}
                        filtroEstadoAnticipo={filtroEstadoAnticipo} setFiltroEstadoAnticipo={setFiltroEstadoAnticipo}
                        filtroAnio={filtroAnio} setFiltroAnio={setFiltroAnio}
                        filtroMes={filtroMes} setFiltroMes={setFiltroMes}
                        aniosDisponibles={aniosDisponibles}
                        setPage={setPage}
                    />
                </Box>

                <BuscadorField value={busqueda} onChange={setBusqueda} placeholder="Buscar anticipos..." />
            </Box>

            <DataTable
                columns={columns}
                rows={anticipos}
                rowKey={(anticipo) => anticipo.idAnticipoExcedente}
                loading={loading}
                error={error}
                initialLoad={initialLoad}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(anticipo) => ({ opacity: anticipo.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando anticipos..."
            />

            {/* Paginación */}
            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {/* Modales */}
            <ModalConsultarAnticipoExcedente
                anticipo={anticipoConsulta}
                conductores={conductores}
                rutas={rutas}
                onClose={() => setAnticipoConsulta(null)}
            />

            <RegistrarAnticipoExcedente
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => showToast('Anticipo registrado correctamente', 'success')}
            />

            <ActualizarAnticipoExcedente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setAnticipoEditar(null) }}
                anticipo={anticipoEditar}
                onSuccess={() => showToast('Anticipo actualizado correctamente', 'success')}
            />

            <ModalInhabilitarAnticipo
                open={modalInhabilitar.open}
                anticipo={modalInhabilitar.anticipo}
                onClose={() => setModalInhabilitar(s => ({ ...s, open: false }))}
                onExited={handleExitedInhabilitar}
                onConfirm={handleConfirmarToggle}
            />

            <ModalConfirmarExcedente
                theme={theme}
                confirmDev={confirmDev}
                onClose={() => setConfirmDev({ open: false, id: null, esFaltante: false })}
                confirmandoEstado={confirmandoEstado}
                onConfirmar={handleConfirmarDevolucion}
            />

        </Box>
    )
}

export default ListarAnticipoExcedente
