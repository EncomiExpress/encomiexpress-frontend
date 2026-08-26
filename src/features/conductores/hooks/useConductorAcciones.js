import { useState } from 'react'
import { useConductor } from '../context/ConductorContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

const useConductorAcciones = () => {
    const { toggleHabilitado } = useConductor()
    const { showToast } = useToast()

    const [confirmToggle, setConfirmToggle] = useState({ open: false, idConductor: null, nombreCompleto: '', habilitadoActual: false })
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })

    const solicitarToggle = (conductor) => {
        setConfirmToggle({
            open: true,
            idConductor: conductor.idConductor,
            nombreCompleto: `${conductor.nombre} ${conductor.apellido}`,
            habilitadoActual: conductor.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idConductor, habilitadoActual } = confirmToggle
        try {
            await toggleHabilitado(idConductor)
            showToast(`Conductor ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`, 'success')
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
