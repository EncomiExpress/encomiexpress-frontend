import { useState } from 'react'
import * as vehiculoService from '../services/vehiculoService.js'
import { hayDocumentoDuplicado, MENSAJE_PLACA_DUPLICADA } from '../../../shared/utils/duplicados.js'

// excludeId: solo Actualizar lo pasa (el propio vehículo no debe marcarse como
// duplicado de sí mismo); Registrar lo deja undefined.
export function useDuplicadoVehiculo({ formData, setErrores, excludeId }) {
    const [avisoPlacaDuplicada, setAvisoPlacaDuplicada] = useState('')

    const verificarPlacaDuplicada = async () => {
        if (!formData.placa.trim() || formData.placa.length < 6) {
            setAvisoPlacaDuplicada('')
            return
        }
        try {
            const res = await vehiculoService.getVehiculos(undefined, { q: formData.placa.trim(), limit: 10 })
            if (!res?.success) return
            const duplicado = hayDocumentoDuplicado(res.data, formData.placa, {
                getDoc: (r) => r.placa,
                ...(excludeId !== undefined ? { excludeId, getId: (r) => r.idVehiculo } : {}),
            })
            setAvisoPlacaDuplicada(duplicado ? MENSAJE_PLACA_DUPLICADA : '')
            if (duplicado) setErrores(prev => ({ ...prev, placa: MENSAJE_PLACA_DUPLICADA }))
        } catch {
            // Si falla la verificación no bloqueamos el flujo
        }
    }

    return { avisoPlacaDuplicada, setAvisoPlacaDuplicada, verificarPlacaDuplicada }
}
