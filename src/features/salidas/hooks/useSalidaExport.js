import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getSalidas } from '../services/salidaService.js'
import { exportToExcel } from '../../../shared/utils/exportExcel.js'
import { formatHora12, formatFecha } from '../../../shared/utils/formatters.js'
import { resolvePares, resolveDestino, getSalidaId } from '../utils/salidaResolvers.js'

const useSalidaExport = ({
    theme, sortBy, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, debouncedSearch,
    getVehiculos, getConductores, destinos,
}) => {
    const { showToast } = useToast()
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getSalidas({
                page: 1, limit: 100000,
                sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                estado: filtroEstadoRuta || undefined,
                anio: filtroAnio || undefined,
                mes: filtroMes || undefined,
                q: debouncedSearch.trim() || undefined,
            })
            const rows = (res?.data || []).map(salida => {
                const pares = resolvePares(salida, { getVehiculos, getConductores })
                return {
                    'ID': getSalidaId(salida),
                    'Origen': salida.origen || `Salida ${getSalidaId(salida)}`,
                    'Destino': resolveDestino(salida, destinos, { preferNombre: true }),
                    'Vehículo': pares.map(p => p.placa).filter(Boolean).join(', ') || 'N/A',
                    'Conductor': pares.map(p => p.conductorNombre).filter(Boolean).join(', ') || 'N/A',
                    'Fecha salida': formatFecha(salida.fechaSalida),
                    'Hora salida': formatHora12(salida.horaSalida),
                    'Estado': salida.estado,
                    'Habilitado': salida.habilitado === false ? 'No' : 'Sí',
                }
            })
            await exportToExcel({ data: rows, fileName: 'Salidas', sheetName: 'Salidas', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    return { exportando, handleExportar }
}

export default useSalidaExport
