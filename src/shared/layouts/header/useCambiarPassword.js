import { useState, useEffect } from 'react'
import { API_URL } from '../../config/api.js'
import { PASSWORD_REGEX } from '../../validations/passwordValidation.js'

export const PASSWORD_HELP = '8-64 caracteres, con mayúsculas, minúsculas, números y un carácter especial'

const useCambiarPassword = (token, open) => {
  const [passwordActual, setPasswordActual]   = useState('')
  const [passwordNueva, setPasswordNueva]     = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showActual, setShowActual]           = useState(false)
  const [showNueva, setShowNueva]             = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [cambiarLoading, setCambiarLoading]   = useState(false)
  const [cambiarMensaje, setCambiarMensaje]   = useState(null)
  const [erroresCambiar, setErroresCambiar]   = useState({})

  useEffect(() => {
    if (open) {
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirm('')
      setCambiarMensaje(null)
      setErroresCambiar({})
    }
  }, [open])

  const onChangeActual = (valor) => setPasswordActual(valor)

  const onChangeNueva = (valor) => {
    setPasswordNueva(valor)
    setErroresCambiar(prev => {
      const next = { ...prev }
      if (prev.nueva) next.nueva = PASSWORD_REGEX.test(valor) ? '' : PASSWORD_HELP
      if (prev.confirm) next.confirm = !passwordConfirm ? 'Confirma la nueva contraseña' : (valor !== passwordConfirm ? 'Las contraseñas no coinciden' : '')
      return next
    })
  }

  const onChangeConfirm = (valor) => {
    setPasswordConfirm(valor)
    setErroresCambiar(prev => prev.confirm
      ? { ...prev, confirm: !valor ? 'Confirma la nueva contraseña' : (passwordNueva !== valor ? 'Las contraseñas no coinciden' : '') }
      : prev)
  }

  const submit = async () => {
    const errores = {}
    if (!PASSWORD_REGEX.test(passwordNueva)) errores.nueva = PASSWORD_HELP
    if (!passwordConfirm) errores.confirm = 'Confirma la nueva contraseña'
    else if (passwordNueva !== passwordConfirm) errores.confirm = 'Las contraseñas no coinciden'
    if (Object.keys(errores).length > 0) {
      setErroresCambiar(errores)
      return
    }
    setErroresCambiar({})
    setCambiarLoading(true)
    setCambiarMensaje(null)
    try {
      const response = await fetch(`${API_URL}/auth/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ passwordActual, passwordNueva })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Error al cambiar la contraseña')
      setCambiarMensaje({ tipo: 'success', texto: 'Contraseña actualizada correctamente.' })
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirm('')
    } catch (error) {
      setCambiarMensaje({ tipo: 'error', texto: error.message || 'No se pudo actualizar la contraseña.' })
    } finally {
      setCambiarLoading(false)
    }
  }

  return {
    passwordActual, passwordNueva, passwordConfirm,
    showActual, showNueva, showConfirm,
    setShowActual, setShowNueva, setShowConfirm,
    cambiarLoading, cambiarMensaje, erroresCambiar,
    onChangeActual, onChangeNueva, onChangeConfirm,
    submit,
  }
}

export default useCambiarPassword
