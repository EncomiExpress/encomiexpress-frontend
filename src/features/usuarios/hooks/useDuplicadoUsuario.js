import { useState } from 'react'
import * as usuarioService from '../services/usuarioService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO, MENSAJE_EMAIL_DUPLICADO } from '../../../shared/utils/duplicados.js'
import { validarEmail } from '../validations/usuarioValidation.js'

// excludeId: solo Actualizar lo pasa (para no marcar el propio usuario como
// duplicado de sí mismo); Registrar lo deja undefined.
export function useDuplicadoUsuario({ form, setErrores, excludeId }) {
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')
    const [avisoEmailDuplicado, setAvisoEmailDuplicado] = useState('')

    const idOptions = excludeId !== undefined ? { excludeId, getId: (r) => r.idUsuario } : {}

    const verificarDocumentoDuplicado = async () => {
        if (!form.numeroIdentificacion.trim() || form.numeroIdentificacion.length < 3) {
            setAvisoDocDuplicado('')
            return
        }
        try {
            const res = await usuarioService.getUsuarios({ q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion, idOptions)
            setAvisoDocDuplicado(duplicado ? MENSAJE_DOC_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, numeroIdentificacion: MENSAJE_DOC_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarEmailDuplicado = async () => {
        const valor = form.email.trim()
        if (!valor || validarEmail(valor)) {
            setAvisoEmailDuplicado('')
            return
        }
        try {
            const res = await usuarioService.getUsuarios({ q: valor, limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, valor, { getDoc: (r) => r.email, ...idOptions })
            setAvisoEmailDuplicado(duplicado ? MENSAJE_EMAIL_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, email: MENSAJE_EMAIL_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarNombreDuplicado = async () => {
        if (!form.nombre.trim() || !form.apellido.trim()) {
            setAvisoNombreDuplicado('')
            return
        }
        try {
            const res = await usuarioService.getUsuarios({ q: form.apellido.trim(), limit: 20 })
            if (!res?.success) return
            const duplicado = hayNombreDuplicado(res.data, form.nombre, form.apellido, idOptions)
            setAvisoNombreDuplicado(duplicado ? MENSAJE_NOMBRE_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, nombre: MENSAJE_NOMBRE_DUPLICADO, apellido: MENSAJE_NOMBRE_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    return {
        avisoNombreDuplicado, avisoDocDuplicado, avisoEmailDuplicado,
        setAvisoNombreDuplicado, setAvisoDocDuplicado, setAvisoEmailDuplicado,
        verificarDocumentoDuplicado, verificarEmailDuplicado, verificarNombreDuplicado,
    }
}
