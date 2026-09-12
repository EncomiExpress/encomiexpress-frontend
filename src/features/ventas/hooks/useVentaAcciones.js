import { useState, useRef } from 'react'
import { useVentas } from '../context/VentaContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { descargarGuiaPdf } from '../../../shared/utils/exportGuia/exportGuiaPdf.js'

// onChanged (opcional): se llama tras cada cambio exitoso — ListarVenta.jsx pasa su
// `refetch` de useEntityCrud para recargar la página actual desde el servidor, ya que
// su tabla ya no lee del arreglo compartido de VentaContext (ver ListarVenta.jsx).
const useVentaAcciones = ({ onChanged } = {}) => {
    const { toggleHabilitadoVenta, reactivarVenta } = useVentas()
    const { showToast } = useToast()
    const pendingConfirm = useRef(false)

    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, venta: null })

    const handleDescargarGuia = async (venta) => {
        try {
            await descargarGuiaPdf(venta)
        } catch (err) {
            showToast(err.message || 'Error al generar la guía en PDF.', 'error')
        }
    }

    const handleToggleHabilitado = (venta) => {
        setModalInhabilitar({ open: true, venta })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const handleExitedInhabilitar = () => {
        const venta = modalInhabilitar.venta
        const wasPending = pendingConfirm.current
        pendingConfirm.current = false
        setModalInhabilitar({ open: false, venta: null })
        if (wasPending && venta) {
            const habilitadoActual = venta.habilitado
            toggleHabilitadoVenta(venta.idEncomiendaVenta)
                .then((res) => { showToast(res?.message || `Venta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, 'success'); onChanged?.() })
                // Antes se tragaba cualquier error en silencio — ahora rehabilitar/
                // inhabilitar sí puede rechazarse (ej. venta "En Ruta"), hay que avisar.
                .catch((err) => showToast(err.message || 'Error al cambiar habilitado', 'error'))
        }
    }

    // Reactivar una venta "Cancelada" cuya ruta ya volvió a servir sola — sin
    // wizard, sin confirmar (acción de bajo riesgo y fácilmente reversible con el
    // toggle de habilitado si fue un clic de más). Ver EstadoVentaCancelada.jsx.
    const handleReactivar = async (venta) => {
        try {
            await reactivarVenta(venta.idEncomiendaVenta)
            showToast('Venta reactivada a "Programada".', 'success')
            onChanged?.()
        } catch (err) {
            showToast(err.message || 'Error al reactivar la venta.', 'error')
        }
    }

    return {
        modalInhabilitar, setModalInhabilitar,
        handleDescargarGuia, handleToggleHabilitado, handleConfirmarToggle, handleExitedInhabilitar,
        handleReactivar,
    }
}

export default useVentaAcciones
