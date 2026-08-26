import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getAnticipos } from '../services/anticipoService.js'
import { exportToExcel } from '../../../shared/utils/exportExcel.js'

// El export propio de anticipos necesita filtros de estado/año/mes además de
// habilitado/búsqueda -- el handleExportar genérico de useEntityCrud no los conoce.
const useAnticipoExport = ({ theme, getNombreConductor, debouncedBusqueda, filtroHabilitado, filtroEstadoAnticipo, filtroAnio, filtroMes }) => {
    const { showToast } = useToast()
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getAnticipos(undefined, {
                limit: 100000,
                q: debouncedBusqueda.trim() || undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                estado: filtroEstadoAnticipo || undefined,
                anio: filtroAnio || undefined,
                mes: filtroMes || undefined,
            })
            const rows = (res?.data || []).map(anticipo => ({
                'ID': anticipo.idAnticipoExcedente || anticipo.idAnticipo,
                'Conductor': getNombreConductor(anticipo),
                'Ruta': anticipo.ruta ? `${anticipo.ruta.origen || '-'} → ${anticipo.ruta.destino?.ciudad || 'Sin destino'}` : (anticipo.idRuta || '-'),
                'Valor anticipo': Math.round(Number(anticipo.valorAnticipo)) || 0,
                'Valor gastado': Math.round(Number(anticipo.valorGastado)) || 0,
                'Excedente': Math.round(Number(anticipo.excedente)) || 0,
                'Fecha de entrega': anticipo.fechaEntrega,
                'Estado': anticipo.estado,
                'Habilitado': anticipo.habilitado === false ? 'No' : 'Sí',
            }))
            await exportToExcel({ data: rows, fileName: 'Anticipos', sheetName: 'Anticipos', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    return { exportando, handleExportar }
}

export default useAnticipoExport
