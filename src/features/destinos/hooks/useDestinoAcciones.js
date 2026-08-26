import { useState } from 'react'
import { useDestino } from '../context/DestinoContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

const useDestinoAcciones = () => {
    const { toggleHabilitado } = useDestino()
    const { showToast } = useToast()

    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, ciudad: '', habilitadoActual: null })

    const handleToggleHabilitado = (id, habilitadoActual, ciudad) => {
        setConfirmInhabilitar({ open: true, id, ciudad: ciudad || '', habilitadoActual })
    }

    const onConfirmar = async () => {
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            showToast(confirmInhabilitar.habilitadoActual ? 'Destino inhabilitado correctamente.' : 'Destino habilitado correctamente.', 'success')
        } catch (err) {
            showToast(err.message || 'No se pudo cambiar el estado del destino.', 'error')
            throw err
        }
    }

    return { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmar }
}

export default useDestinoAcciones
