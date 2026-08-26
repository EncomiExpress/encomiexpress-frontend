import { useState } from 'react'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

const useUsuarioAcciones = (setUsuarios) => {
    const { habilitarInhabilitarUsuario } = useAuth()
    const { showToast } = useToast()

    const [confirmToggle, setConfirmToggle] = useState({ open: false, idUsuario: null, nombreCompleto: '', habilitadoActual: false })

    const solicitarToggle = (usuario) => {
        setConfirmToggle({
            open: true,
            idUsuario: usuario.idUsuario,
            nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
            habilitadoActual: usuario.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idUsuario, habilitadoActual } = confirmToggle
        try {
            await habilitarInhabilitarUsuario(idUsuario)
            setUsuarios(prev => prev.map(u =>
                u.idUsuario === idUsuario ? { ...u, habilitado: !u.habilitado } : u
            ))
            showToast(`Usuario ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, 'success')
        } catch (err) {
            showToast(err?.message || 'Error al cambiar el estado', 'error')
            throw err
        }
    }

    return { confirmToggle, setConfirmToggle, solicitarToggle, onConfirmar }
}

export default useUsuarioAcciones
