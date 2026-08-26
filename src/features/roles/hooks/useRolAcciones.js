import { useState } from 'react'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'

const useRolAcciones = (setRoles) => {
  const { toggleHabilitadoRol } = useAuth()
  const { showToast } = useToast()

  const [confirmToggle, setConfirmToggle] = useState({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })

  const handleToggleHabilitado = (id, rolNombre, habilitadoActual) => {
    setConfirmToggle({ open: true, rolId: id, rolNombre, habilitadoActual })
  }

  const onConfirmar = async () => {
    const { rolId, rolNombre, habilitadoActual } = confirmToggle
    let respuesta
    try {
      respuesta = await toggleHabilitadoRol(rolId)
    } catch (error) {
      showToast(error?.message || 'Error al cambiar estado', 'error')
      throw error
    }
    if (respuesta.success) {
      setRoles(prev => prev.map(r => r.id === rolId ? { ...r, habilitado: !habilitadoActual } : r))
      showToast(
        !habilitadoActual
          ? `Rol "${rolNombre}" habilitado. Todos sus usuarios han sido habilitados.`
          : `Rol "${rolNombre}" inhabilitado. Todos sus usuarios han sido inhabilitados.`,
        'success'
      )
    } else {
      showToast(respuesta.message || 'Error al cambiar estado', 'error')
      throw new Error(respuesta.message || 'Error al cambiar estado')
    }
  }

  return { confirmToggle, setConfirmToggle, handleToggleHabilitado, onConfirmar }
}

export default useRolAcciones
