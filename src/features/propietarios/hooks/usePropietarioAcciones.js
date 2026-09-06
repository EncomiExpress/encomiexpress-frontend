import { useState } from 'react'
import { usePropietario } from '../context/PropietarioContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

// refetch (opcional): recarga la página actual de ListarPropietario.jsx tras un
// toggle exitoso — su tabla ya no lee del arreglo compartido de PropietarioContext
// (ver ListarPropietario.jsx), así que sin esto el toggle no se reflejaría ahí.
const usePropietarioAcciones = (refetch) => {
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

export default usePropietarioAcciones
