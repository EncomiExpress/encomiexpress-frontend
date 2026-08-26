import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getEncomiendas } from '../services/ventaService.js'
import { exportToExcel } from '../../../shared/utils/exportExcel.js'
import { getGuiaPrincipal } from '../../../shared/utils/formatters.js'

// El export propio de ventas necesita filtros de estado/pago/método además de
// habilitado/búsqueda -- el handleExportar genérico de useEntityCrud no los conoce.
const useVentaExport = ({ theme, debouncedBusqueda, filtroHabilitado, filtroEstadoEncomienda, filtroPago, filtroMetodoPago }) => {
    const { showToast } = useToast()
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getEncomiendas(undefined, {
                limit: 100000,
                estado: filtroEstadoEncomienda || undefined,
                estadoPago: filtroPago || undefined,
                metodoPago: filtroMetodoPago || undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                q: debouncedBusqueda.trim() || undefined,
            })
            const rows = (res?.data || []).map(venta => ({
                'ID': venta.idEncomiendaVenta || venta.idVenta,
                'Guía': (venta.paquetes || []).map(p => p.numeroGuia).filter(Boolean).join(', ') || getGuiaPrincipal(venta) || '—',
                'Cliente': `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.trim() || venta.idCliente || '-',
                'Ruta': venta.ruta?.origen || '-',
                'Destino': venta.ruta?.destino?.ciudad || '-',
                'Fecha registro': venta.fechaRegistro,
                'Fecha est. entrega': venta.fechaEstimadaEntrega,
                'Estado': venta.estado,
                'Estado de pago': venta.estadoPago,
                'Método de pago': venta.metodoPago,
                'Valor servicio': Math.round(Number(venta.valorServicio)) || 0,
                'Impuestos': Math.round(Number(venta.impuestos)) || 0,
                'Total': Math.round(Number(venta.total)) || 0,
                'Habilitado': venta.habilitado === false ? 'No' : 'Sí',
            }))
            await exportToExcel({ data: rows, fileName: 'Ventas', sheetName: 'Ventas', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    return { exportando, handleExportar }
}

export default useVentaExport
