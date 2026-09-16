import { useState } from 'react'
import { useRuta } from '../context/RutaContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

// refetch (opcional): recarga la página actual de ListarRuta.jsx tras un toggle
// exitoso — mismo patrón que useDestinoAcciones.js.
const useRutaAcciones = (refetch) => {
    const { toggleHabilitado } = useRuta()
    const { showToast } = useToast()

    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, etiqueta: '', habilitadoActual: null })

    // `etiqueta`: el corredor "Medellín -> Destino" (getRutaLabel), ya no un nombre
    // propio -- ver ../utils/rutaResolvers.js.
    const handleToggleHabilitado = (id, habilitadoActual, etiqueta) => {
        setConfirmInhabilitar({ open: true, id, etiqueta: etiqueta || '', habilitadoActual })
    }

    const onConfirmar = async () => {
        try {
            const { message } = await toggleHabilitado(confirmInhabilitar.id)
            showToast(message || (confirmInhabilitar.habilitadoActual ? 'Ruta inhabilitada correctamente.' : 'Ruta habilitada correctamente.'), 'success')
            refetch?.()
        } catch (err) {
            showToast(err.message || 'No se pudo cambiar el estado de la ruta.', 'error')
            throw err
        }
    }

    return { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmar }
}

export default useRutaAcciones
