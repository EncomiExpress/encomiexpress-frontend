import { useState } from 'react'
import { useRutaProgramacion } from '../context/RutaProgramacionContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { getRutaId } from '../utils/rutaResolvers.js'

const useRutaAcciones = (rutasProgramadas) => {
    const { toggleHabilitado } = useRutaProgramacion()
    const { showToast } = useToast()

    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, idRuta: null, origen: '', habilitadoActual: null, estadoRuta: null })

    const handleToggleHabilitado = (id) => {
        const rutaActual = rutasProgramadas.find(r => getRutaId(r) === id)
        setConfirmInhabilitar({
            open: true,
            idRuta: id,
            origen: rutaActual?.origen || '',
            habilitadoActual: rutaActual?.habilitado !== false,
            estadoRuta: rutaActual?.estado || null,
        })
    }

    const onConfirmarInhabilitar = async () => {
        const { idRuta, habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(idRuta)
            showToast(`Ruta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar habilitado', 'error')
            throw err
        }
    }

    return { confirmInhabilitar, setConfirmInhabilitar, handleToggleHabilitado, onConfirmarInhabilitar }
}

export default useRutaAcciones
