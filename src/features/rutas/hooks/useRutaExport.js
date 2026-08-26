import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getRutas } from '../services/rutaService.js'
import { exportToExcel } from '../../../shared/utils/exportExcel.js'
import { formatHora12 } from '../../../shared/utils/formatters.js'
import { resolvePares, resolveDestino, getRutaId } from '../utils/rutaResolvers.js'

const useRutaExport = ({
    theme, sortBy, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, debouncedSearch,
    getVehiculos, getConductores, destinos,
}) => {
    const { showToast } = useToast()
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getRutas({
                page: 1, limit: 100000,
                sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                estado: filtroEstadoRuta || undefined,
                anio: filtroAnio || undefined,
                mes: filtroMes || undefined,
                q: debouncedSearch.trim() || undefined,
            })
            const rows = (res?.data || []).map(ruta => {
                const pares = resolvePares(ruta, { getVehiculos, getConductores })
                return {
                    'ID': getRutaId(ruta),
                    'Origen': ruta.origen || `Ruta ${getRutaId(ruta)}`,
                    'Destino': resolveDestino(ruta, destinos, { preferNombre: true }),
                    'Vehículo': pares.map(p => p.placa).filter(Boolean).join(', ') || 'N/A',
                    'Conductor': pares.map(p => p.conductorNombre).filter(Boolean).join(', ') || 'N/A',
                    'Fecha salida': ruta.fechaSalida,
                    'Hora salida': formatHora12(ruta.horaSalida),
                    'Estado': ruta.estado,
                    'Habilitado': ruta.habilitado === false ? 'No' : 'Sí',
                }
            })
            await exportToExcel({ data: rows, fileName: 'Rutas', sheetName: 'Rutas', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    return { exportando, handleExportar }
}

export default useRutaExport
