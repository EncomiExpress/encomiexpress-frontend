import { useState } from 'react'
import { hayDocumentoDuplicado } from '../../../shared/utils/duplicados.js'
import { MENSAJE_ROL_DUPLICADO } from '../validations/rolValidation.js'

// getRolesBackend viene de useAuth() (AuthContext) — roles no tiene un servicio propio,
// la consulta de roles pasa por el contexto de autenticación.
// excludeId: solo Actualizar lo pasa (para no marcar el propio rol como duplicado
// de sí mismo); Registrar lo deja undefined.
export function useDuplicadoRol({ nombre, setErrores, getRolesBackend, excludeId }) {
    const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')

    const verificarNombreRolDuplicado = async () => {
        if (!nombre.trim()) {
            setAvisoNombreDuplicado('')
            return
        }
        try {
            const res = await getRolesBackend({ q: nombre.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, nombre, {
                getDoc: (r) => r.nombre,
                ...(excludeId !== undefined ? { excludeId, getId: (r) => r.idRol ?? r.id } : {}),
            })
            setAvisoNombreDuplicado(duplicado ? MENSAJE_ROL_DUPLICADO : '')
            if (duplicado) setErrores(prev => ({ ...prev, nombre: MENSAJE_ROL_DUPLICADO }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    return { avisoNombreDuplicado, setAvisoNombreDuplicado, verificarNombreRolDuplicado }
}
