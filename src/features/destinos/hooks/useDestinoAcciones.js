import { useState } from 'react'
import { useDestino } from '../context/DestinoContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

// refetch (opcional): recarga la página actual de ListarDestino.jsx tras un toggle
// exitoso — su tabla ya no lee del arreglo compartido de DestinoContext (ver
// ListarDestino.jsx), así que sin esto el toggle no se reflejaría ahí.
const useDestinoAcciones = (refetch) => {
    const { toggleHabilitado } = useDestino()
    const { showToast } = useToast()

    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, municipio: '', habilitadoActual: null })

    const handleToggleHabilitado = (id, habilitadoActual, municipio) => {
        setConfirmInhabilitar({ open: true, id, municipio: municipio || '', habilitadoActual })
    }

    const onConfirmar = async () => {
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            showToast(confirmInhabilitar.habilitadoActual ? 'Destino inhabilitado correctamente.' : 'Destino habilitado correctamente.', 'success')
            refetch?.()
        } catch (err) {
            showToast(err.message || 'No se pudo cambiar el estado del destino.', 'error')
            throw err
        }
    }

    return { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmar }
}

export default useDestinoAcciones
