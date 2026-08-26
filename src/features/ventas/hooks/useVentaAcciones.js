import { useState, useRef } from 'react'
import { useVentas } from '../context/VentaContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { descargarGuiaPdf } from '../../../shared/utils/exportGuiaPdf.js'

const useVentaAcciones = () => {
    const { cambiarEstadoVenta, cambiarEstadoPagoVenta, toggleHabilitadoVenta } = useVentas()
    const { showToast } = useToast()
    const pendingConfirm = useRef(false)

    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, venta: null })
    const [pagoMenuAnchor, setPagoMenuAnchor] = useState(null)
    const [pagoMenuId, setPagoMenuId] = useState(null)
    const [confirmPago, setConfirmPago] = useState({ open: false, id: null })
    const [estadoMenuAnchor, setEstadoMenuAnchor] = useState(null)
    const [estadoMenuId, setEstadoMenuId] = useState(null)
    const [confirmCancelar, setConfirmCancelar] = useState({ open: false, id: null })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)

    const handleDescargarGuia = async (venta) => {
        try {
            await descargarGuiaPdf(venta)
        } catch (err) {
            showToast(err.message || 'Error al generar la guía en PDF.', 'error')
        }
    }

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            await cambiarEstadoVenta(id, nuevoEstado)
            showToast(`Estado actualizado a ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}.`, 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado de la encomienda.', 'error')
        }
    }

    const handlePagoChange = async (id, nuevoPago) => {
        try {
            await cambiarEstadoPagoVenta(id, nuevoPago)
            showToast(`Estado de pago actualizado a ${nuevoPago}.`, 'success')
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

    const handleCancelarConfirm = async () => {
        setConfirmandoEstado(true)
        try {
            await handleEstadoChange(confirmCancelar.id, 'Cancelada')
            setConfirmCancelar({ open: false, id: null })
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
                .then(() => showToast(`Venta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, 'success'))
                .catch(() => { })
        }
    }

    return {
        modalInhabilitar, setModalInhabilitar,
        pagoMenuAnchor, setPagoMenuAnchor, pagoMenuId, setPagoMenuId, confirmPago, setConfirmPago,
        estadoMenuAnchor, setEstadoMenuAnchor, estadoMenuId, setEstadoMenuId, confirmCancelar, setConfirmCancelar,
        confirmandoEstado,
        handleDescargarGuia, handleToggleHabilitado, handleConfirmarToggle, handleExitedInhabilitar,
        handlePagoConfirm, handleCancelarConfirm,
    }
}

export default useVentaAcciones
