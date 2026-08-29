import { useState } from 'react'
import * as conductorService from '../services/conductorService.js'
import * as usuarioService from '../../usuarios/services/usuarioService.js'
import { hayNombreDuplicado, MENSAJE_NOMBRE_DUPLICADO, hayDocumentoDuplicado, MENSAJE_DOC_DUPLICADO, MENSAJE_EMAIL_DUPLICADO, MENSAJE_LICENCIA_DUPLICADA } from '../../../shared/utils/duplicados.js'
import { validarCampo, validarEmail } from '../validations/conductorValidation.js'

// excludeConductorId/excludeUsuarioId: solo Actualizar los pasa (para no marcar el
// propio registro como duplicado de sí mismo); Registrar los deja undefined.
export function useDuplicadoConductor({ form, setErrores, excludeConductorId, excludeUsuarioId }) {
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')
    const [avisoDocDuplicado, setAvisoDocDuplicado] = useState('')
    const [avisoEmailDuplicado, setAvisoEmailDuplicado] = useState('')
    const [avisoLicenciaDuplicada, setAvisoLicenciaDuplicada] = useState('')

    const conductorIdOptions = excludeConductorId !== undefined
        ? { excludeId: excludeConductorId, getId: (r) => r.idConductor }
        : {}

    const verificarDocumentoDuplicado = async () => {
        if (!form.numeroIdentificacion.trim() || form.numeroIdentificacion.length < 3) {
            setAvisoDocDuplicado('')
            return
        }
        try {
            const res = await conductorService.getConductores(undefined, { q: form.numeroIdentificacion.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroIdentificacion, {
                getDoc: (r) => r.usuario?.numeroIdentificacion || r.numeroIdentificacion,
                ...conductorIdOptions,
            })
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
            // El correo es único en toda la tabla usuario (admin, conductor o cualquier
            // otro rol) -- se busca ahí, no solo entre conductores, porque si no un correo
            // ya usado por un admin (u otro rol) no se detecta como duplicado acá.
            const res = await usuarioService.getUsuarios({ q: valor, limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, valor, {
                getDoc: (r) => r.email,
                ...(excludeUsuarioId !== undefined ? { excludeId: excludeUsuarioId, getId: (r) => r.idUsuario } : {}),
            })
            setAvisoEmailDuplicado(duplicado ? MENSAJE_EMAIL_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, email: MENSAJE_EMAIL_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    const verificarLicenciaDuplicada = async () => {
        if (!form.numeroLicencia.trim()) {
            setAvisoLicenciaDuplicada('')
            return
        }
        const errorRelleno = validarCampo('numeroLicencia', form)
        if (errorRelleno) {
            setErrores(prev => ({ ...prev, numeroLicencia: errorRelleno }))
            return
        }
        try {
            const res = await conductorService.getConductores(undefined, { q: form.numeroLicencia.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, form.numeroLicencia, {
                getDoc: (r) => r.numeroLicencia,
                ...conductorIdOptions,
            })
            setAvisoLicenciaDuplicada(duplicado ? MENSAJE_LICENCIA_DUPLICADA : '')
            if (duplicado) setErrores(prev => ({ ...prev, numeroLicencia: MENSAJE_LICENCIA_DUPLICADA }))
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
            const res = await conductorService.getConductores(undefined, { q: form.apellido.trim(), limit: 20 })
            if (!res?.success) return
            const duplicado = hayNombreDuplicado(res.data, form.nombre, form.apellido, {
                getNombre: (r) => r.usuario?.nombre,
                getApellido: (r) => r.usuario?.apellido,
                ...conductorIdOptions,
            })
            setAvisoNombreDuplicado(duplicado ? MENSAJE_NOMBRE_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, nombre: MENSAJE_NOMBRE_DUPLICADO, apellido: MENSAJE_NOMBRE_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    return {
        avisoNombreDuplicado, avisoDocDuplicado, avisoEmailDuplicado, avisoLicenciaDuplicada,
        setAvisoNombreDuplicado, setAvisoDocDuplicado, setAvisoEmailDuplicado, setAvisoLicenciaDuplicada,
        verificarDocumentoDuplicado, verificarEmailDuplicado, verificarLicenciaDuplicada, verificarNombreDuplicado,
    }
}
