import { useState, useRef } from 'react'
import { useVentas } from '../context/VentaContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { descargarGuiaPdf } from '../../../shared/utils/exportGuia/exportGuiaPdf.js'

// onChanged (opcional): se llama tras cada cambio exitoso — ListarVenta.jsx pasa su
// `refetch` de useEntityCrud para recargar la página actual desde el servidor, ya que
// su tabla ya no lee del arreglo compartido de VentaContext (ver ListarVenta.jsx).
const useVentaAcciones = ({ onChanged } = {}) => {
    const { cambiarEstadoPagoVenta, toggleHabilitadoVenta, reactivarVenta } = useVentas()
    const { showToast } = useToast()
    const pendingConfirm = useRef(false)

    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, venta: null })
    const [pagoMenuAnchor, setPagoMenuAnchor] = useState(null)
    const [pagoMenuId, setPagoMenuId] = useState(null)
    const [confirmPago, setConfirmPago] = useState({ open: false, id: null })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)

    const handleDescargarGuia = async (venta) => {
        try {
            await descargarGuiaPdf(venta)
        } catch (err) {
            showToast(err.message || 'Error al generar la guía en PDF.', 'error')
        }
    }

    const handlePagoChange = async (id, nuevoPago) => {
        try {
            await cambiarEstadoPagoVenta(id, nuevoPago)
            showToast(`Estado de pago actualizado a ${nuevoPago}.`, 'success')
            onChanged?.()
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado de pago.', 'error')
        }
    }

    const handlePagoConfirm = async () => {
        setConfirmandoEstado(true)
        try {
            await handlePagoChange(confirmPago.id, 'Pagado')
            setConfirmPago({ open: false, id: null })
        } finally {
            setConfirmandoEstado(false)
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
        pagoMenuAnchor, setPagoMenuAnchor, pagoMenuId, setPagoMenuId, confirmPago, setConfirmPago,
        confirmandoEstado,
        handleDescargarGuia, handleToggleHabilitado, handleConfirmarToggle, handleExitedInhabilitar,
        handlePagoConfirm, handleReactivar,
    }
}

export default useVentaAcciones
