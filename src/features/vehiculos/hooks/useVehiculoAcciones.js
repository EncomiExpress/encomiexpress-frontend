import { useState, useEffect } from 'react'
import { useVehiculo } from '../context/VehiculoContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getRutas } from '../../rutas/services/rutaService.js'

const useVehiculoAcciones = () => {
    const { updateEstado, toggleHabilitado } = useVehiculo()
    const { showToast } = useToast()

    const [estadoMenu, setEstadoMenu] = useState({ anchor: null, id: null, estadoActual: null })
    const [confirmMantenimiento, setConfirmMantenimiento] = useState({ open: false, id: null })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, habilitadoActual: null, placa: '', estadoVehiculo: null })
    const [rutasMantenimiento, setRutasMantenimiento] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!confirmMantenimiento.open || !confirmMantenimiento.id) return
        setRutasMantenimiento({ data: [], loading: true })
        getRutas({ idVehiculo: confirmMantenimiento.id, estado: 'Programada', habilitado: 'true', limit: 100 })
            .then(res => setRutasMantenimiento({ data: res?.data || [], loading: false }))
            .catch(() => setRutasMantenimiento({ data: [], loading: false }))
    }, [confirmMantenimiento.open, confirmMantenimiento.id])

    const handleEstadoChange = async (id, nuevoEstado) => {
        const success = await updateEstado(id, nuevoEstado)
        if (success) {
            showToast(`Estado actualizado a ${nuevoEstado}.`, 'success')
        }
    }

    const handleToggleHabilitado = (id, habilitadoActual, estadoVehiculo, placa) => {
        setConfirmInhabilitar({ open: true, id, habilitadoActual, placa: placa || '', estadoVehiculo })
    }

    const onConfirmar = async () => {
        const { habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            showToast(habilitadoActual ? 'Vehículo inhabilitado correctamente.' : 'Vehículo habilitado correctamente.', 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado del vehículo', 'error')
            throw err
        }
    }

    const handleSeleccionarEstado = (op) => {
        setEstadoMenu(prev => ({ ...prev, anchor: null }))
        if (op === 'Mantenimiento') {
            setConfirmMantenimiento({ open: true, id: estadoMenu.id })
        } else {
            handleEstadoChange(estadoMenu.id, op)
        }
    }

    const handleConfirmarMantenimiento = async () => {
        setConfirmandoEstado(true)
        try {
            await handleEstadoChange(confirmMantenimiento.id, 'Mantenimiento')
            setConfirmMantenimiento({ open: false, id: null })
        } finally {
            setConfirmandoEstado(false)
        }
    }

    return {
        estadoMenu, setEstadoMenu,
        confirmMantenimiento, setConfirmMantenimiento,
        confirmandoEstado,
        confirmInhabilitar, setConfirmInhabilitar,
        rutasMantenimiento, setRutasMantenimiento,
        handleToggleHabilitado, onConfirmar,
        handleSeleccionarEstado, handleConfirmarMantenimiento,
    }
}

export default useVehiculoAcciones
