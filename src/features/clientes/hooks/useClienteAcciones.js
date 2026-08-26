import { useState, useRef } from 'react'
import { useClientes } from '../context/ClienteContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

const useClienteAcciones = () => {
    const { toggleHabilitadoCliente } = useClientes()
    const { showToast } = useToast()
    const pendingConfirm = useRef(false)
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, data: null })

    const handleToggleHabilitado = (cliente) => {
        setModalInhabilitar({
            open: true,
            data: {
                idCliente: cliente.idCliente,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                habilitadoActual: cliente.habilitado,
            }
        })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const handleExited = () => {
        const data = modalInhabilitar.data
        const wasPending = pendingConfirm.current
        pendingConfirm.current = false
        setModalInhabilitar({ open: false, data: null })
        if (wasPending && data) {
            const habilitadoActual = data.habilitadoActual
            toggleHabilitadoCliente(data.idCliente)
                .then(() => showToast(`Cliente ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, 'success'))
                .catch(() => { })
        }
    }

    return { modalInhabilitar, setModalInhabilitar, handleToggleHabilitado, handleConfirmarToggle, handleExited }
}

export default useClienteAcciones
