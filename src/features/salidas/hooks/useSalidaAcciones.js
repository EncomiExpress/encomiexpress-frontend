import { useState } from 'react'
import { useSalidaProgramacion } from '../context/SalidaProgramacionContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getSalidaId, resolveDestinoPartes } from '../utils/salidaResolvers.js'

// refetch (opcional): recarga la página actual de ListarSalidaProgramada.jsx tras un
// toggle exitoso — su tabla ya no lee del arreglo compartido de
// SalidaProgramacionContext.
const useSalidaAcciones = (salidasProgramadas, refetch, destinos = []) => {
    const { toggleHabilitado } = useSalidaProgramacion()
    const { showToast } = useToast()

    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, idSalida: null, origen: '', destino: '', habilitadoActual: null, estadoSalida: null, fechaSalida: null, horaSalida: null })

    const handleToggleHabilitado = (id) => {
        const salidaActual = salidasProgramadas.find(s => getSalidaId(s) === id)
        setConfirmInhabilitar({
            open: true,
            idSalida: id,
            origen: salidaActual?.origen || '',
            destino: salidaActual ? resolveDestinoPartes(salidaActual, destinos).municipio : '',
            habilitadoActual: salidaActual?.habilitado !== false,
            estadoSalida: salidaActual?.estado || null,
            // Para que el modal pueda avisar de antemano si al habilitar la salida va a
            // quedar Cancelada por fecha/hora vencida.
            fechaSalida: salidaActual?.fechaSalida || null,
            horaSalida: salidaActual?.horaSalida || null,
        })
    }

    const onConfirmarInhabilitar = async () => {
        const { idSalida, habilitadoActual } = confirmInhabilitar
        try {
            const { message } = await toggleHabilitado(idSalida)
            showToast(message || `Salida ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, 'success')
            refetch?.()
        } catch (err) {
            showToast(err.message || 'Error al cambiar habilitado', 'error')
            throw err
        }
    }

    return { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmarInhabilitar }
}

export default useSalidaAcciones
