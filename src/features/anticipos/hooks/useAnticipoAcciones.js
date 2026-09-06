import { useState, useRef } from 'react'
import { useAnticipos } from '../context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

// refetch (opcional): recarga la página actual de ListarAnticipoExcedente.jsx tras un
// cambio exitoso — su tabla ya no lee del arreglo compartido de
// AnticipoExcedenteContext (ver ListarAnticipoExcedente.jsx), así que sin esto el
// cambio no se reflejaría ahí.
const useAnticipoAcciones = (refetch) => {
    const { toggleHabilitado, entregarExcedente } = useAnticipos()
    const { showToast } = useToast()
    const pendingConfirm = useRef(false)

    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, anticipo: null })
    const [confirmDev, setConfirmDev] = useState({ open: false, id: null, esFaltante: false })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)

    const handleToggleHabilitado = (anticipo) => {
        setModalInhabilitar({ open: true, anticipo })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const handleExitedInhabilitar = () => {
        const anticipo = modalInhabilitar.anticipo
        const wasPending = pendingConfirm.current
        pendingConfirm.current = false
        setModalInhabilitar({ open: false, anticipo: null })
        if (wasPending && anticipo) {
            const habilitadoActual = anticipo.habilitado === true
            toggleHabilitado(anticipo.idAnticipoExcedente)
                .then(() => { showToast(habilitadoActual ? 'Anticipo inhabilitado' : 'Anticipo habilitado', 'success'); refetch?.() })
                .catch(() => { })
        }
    }

    const handleConfirmarDevolucion = async () => {
        setConfirmandoEstado(true)
        try {
            await entregarExcedente(confirmDev.id)
            showToast(confirmDev.esFaltante ? 'Reposición confirmada: el anticipo quedó Completado' : 'Devolución confirmada: el anticipo quedó Completado', 'success')
            refetch?.()
        } catch (err) {
            showToast(err.message || (confirmDev.esFaltante ? 'No se pudo confirmar la reposición' : 'No se pudo confirmar la devolución'), 'error')
        }
        setConfirmandoEstado(false)
        setConfirmDev({ open: false, id: null, esFaltante: false })
    }

    return {
        modalInhabilitar, setModalInhabilitar,
        confirmDev, setConfirmDev,
        confirmandoEstado,
        handleToggleHabilitado, handleConfirmarToggle, handleExitedInhabilitar, handleConfirmarDevolucion,
    }
}

export default useAnticipoAcciones
