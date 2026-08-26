import { useState } from 'react'
import { usePropietario } from '../context/PropietarioContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

const usePropietarioAcciones = () => {
    const { toggleHabilitado } = usePropietario()
    const { showToast } = useToast()

    const [confirmToggle, setConfirmToggle] = useState({ open: false, idPropietario: null, nombreCompleto: '', habilitadoActual: false })
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })

    const solicitarToggle = (propietario) => {
        setConfirmToggle({
            open: true,
            idPropietario: propietario.idPropietario,
            nombreCompleto: `${propietario.nombre} ${propietario.apellido}`,
            habilitadoActual: propietario.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idPropietario, habilitadoActual } = confirmToggle
        try {
            await toggleHabilitado(idPropietario)
            showToast(`Propietario ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`, 'success')
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

export default usePropietarioAcciones
