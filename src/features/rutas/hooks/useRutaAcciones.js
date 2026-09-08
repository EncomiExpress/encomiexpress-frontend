import { useState } from 'react'
import { useRutaProgramacion } from '../context/RutaProgramacionContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getRutaId, resolveDestinoPartes } from '../utils/rutaResolvers.js'

// refetch (opcional): recarga la página actual de ListarRutaProgramacion.jsx tras un
// toggle exitoso — su tabla ya no lee del arreglo compartido de RutaProgramacionContext
// (ver ListarRutaProgramacion.jsx), así que sin esto el toggle no se reflejaría ahí.
const useRutaAcciones = (rutasProgramadas, refetch, destinos = []) => {
    const { toggleHabilitado } = useRutaProgramacion()
    const { showToast } = useToast()

    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, idRuta: null, origen: '', destino: '', habilitadoActual: null, estadoRuta: null, fechaSalida: null, horaSalida: null })

    const handleToggleHabilitado = (id) => {
        const rutaActual = rutasProgramadas.find(r => getRutaId(r) === id)
        setConfirmInhabilitar({
            open: true,
            idRuta: id,
            origen: rutaActual?.origen || '',
            destino: rutaActual ? resolveDestinoPartes(rutaActual, destinos).municipio : '',
            habilitadoActual: rutaActual?.habilitado !== false,
            estadoRuta: rutaActual?.estado || null,
            // Para que el modal pueda avisar de antemano si al habilitar la ruta va a
            // quedar Cancelada por fecha/hora vencida (ver ModalInhabilitarRuta.jsx).
            fechaSalida: rutaActual?.fechaSalida || null,
            horaSalida: rutaActual?.horaSalida || null,
        })
    }

    const onConfirmarInhabilitar = async () => {
        const { idRuta, habilitadoActual } = confirmInhabilitar
        try {
            const { message } = await toggleHabilitado(idRuta)
            showToast(message || `Ruta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, 'success')
            refetch?.()
        } catch (err) {
            showToast(err.message || 'Error al cambiar habilitado', 'error')
            throw err
        }
    }

    return { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmarInhabilitar }
}

export default useRutaAcciones
