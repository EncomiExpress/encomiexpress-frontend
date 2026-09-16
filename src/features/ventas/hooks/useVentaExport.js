import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getEncomiendas } from '../services/ventaService.js'
import { exportToExcel } from '../../../shared/utils/exportExcel.js'
import { getGuiaPrincipal, formatFecha } from '../../../shared/utils/formatters.js'
import { motivoVentaCancelada, LABEL_VENTA_CANCELADA } from '../utils/ventaResolvers.js'

// El export propio de ventas necesita filtros de estado/pago/modalidad además de
// habilitado/búsqueda -- el handleExportar genérico de useEntityCrud no los conoce.
const useVentaExport = ({ theme, debouncedBusqueda, filtroHabilitado, filtroEstadoEncomienda, filtroPago, filtroModalidad }) => {
    const { showToast } = useToast()
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getEncomiendas(undefined, {
                limit: 100000,
                estado: filtroEstadoEncomienda || undefined,
                estadoPago: filtroPago || undefined,
                modalidadRecaudo: filtroModalidad || undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                q: debouncedBusqueda.trim() || undefined,
            })
            const rows = (res?.data || []).map(venta => ({
                'ID': venta.idEncomiendaVenta || venta.idVenta,
                'Guía': (venta.paquetes || []).map(p => p.numeroGuia).filter(Boolean).join(', ') || getGuiaPrincipal(venta) || '—',
                'Cliente': `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.trim() || venta.idCliente || '-',
                'Ruta': venta.salida?.origen || '-',
                'Destino': venta.destinatario?.destino?.municipio || '-',
                'Fecha registro': formatFecha(venta.fechaRegistro),
                'Fecha est. entrega': formatFecha(venta.fechaEstimadaEntrega),
                // Mismo criterio que la columna "Estado" del listado (useVentaColumns.jsx):
                // una venta "Cancelada" solo porque quedó con el destino fuera del
                // recorrido de su ruta (destinoFueraDeRuta) no es una cancelación real --
                // sigue siendo válida, solo le falta reasignar la ruta. Sin esto, el Excel
                // mostraba "Cancelada" en un caso donde el propio listado ya no lo hace.
                'Estado': venta.estado === 'Cancelada'
                    ? (LABEL_VENTA_CANCELADA[motivoVentaCancelada(venta)] || venta.estado)
                    : venta.estado,
                'Estado de pago': venta.estadoPago,
                'Modalidad de recaudo': venta.modalidadRecaudo,
                // Mismo formato que la columna "Total" del listado ("$150.000") -- antes
                // salía como número pelado ("150000"), sin signo ni puntos de miles.
                'Total a pagar': venta.total != null
                    ? `$${Math.round(Number(venta.total)).toLocaleString('es-CO')}`
                    : '—',
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
