import { useState } from 'react'
import { useConductor } from '../context/ConductorContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

// refetch (opcional): recarga la página actual de ListarConductor.jsx tras un toggle
// exitoso — su tabla ya no lee del arreglo compartido de ConductorContext (ver
// ListarConductor.jsx), así que sin esto el toggle no se reflejaría ahí.
const useConductorAcciones = (refetch) => {
    const { toggleHabilitado } = useConductor()
    const { showToast } = useToast()

    const [confirmToggle, setConfirmToggle] = useState({ open: false, idConductor: null, nombreCompleto: '', habilitadoActual: false, destinoActual: null })
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })

    const solicitarToggle = (conductor) => {
        setConfirmToggle({
            open: true,
            idConductor: conductor.idConductor,
            nombreCompleto: `${conductor.nombre} ${conductor.apellido}`,
            habilitadoActual: conductor.habilitado,
            destinoActual: conductor.destinoActual || null,
        })
    }

    const onConfirmar = async () => {
        const { idConductor, habilitadoActual } = confirmToggle
        try {
            await toggleHabilitado(idConductor)
            showToast(`Conductor ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`, 'success')
            refetch?.()
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                showToast(err.message || 'Error al cambiar el estado', 'error')
            }
            throw err
        }
    }

    return { confirmToggle, setConfirmToggle, modalBloqueo, setModalBloqueo, solicitarToggle, onConfirmar }
}

export default useConductorAcciones
