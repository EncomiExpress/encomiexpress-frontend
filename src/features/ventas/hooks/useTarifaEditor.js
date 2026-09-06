import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { limpiarMonedaInput } from '../../../shared/utils/formatters.js'

// Topes de las tarifas globales de Configuracion (deben coincidir con configuracionValidator.js
// del backend). Tarifas por kg (hierro/normal) hasta 9.999; tarifa por paquete hasta 99.999.
export const MAX_TARIFA_KG = 9999
export const MAX_TARIFA_PAQUETE = 99999

// Generaliza el patrón candado + edición inline de un valor global de
// Configuracion -- antes duplicado por cada tarifa (useTarifaPorKgEditor en
// Destinos, useTarifaPorPaqueteEditor en Ventas). Ahora Ventas necesita 3
// instancias (kg-hierro, kg-normal, por-paquete) y Destinos ninguna, así que
// vive acá como único dueño, parametrizado por el valor y el setter del
// ConfiguracionContext que le pase cada control.
const useTarifaEditor = (valor, actualizar, { mensajeExito, mensajeError, max = Infinity } = {}) => {
    const { showToast } = useToast()

    const [editandoTarifa, setEditandoTarifa] = useState(false)
    const [tarifaInput, setTarifaInputRaw] = useState('')
    const [guardandoTarifa, setGuardandoTarifa] = useState(false)

    // Limpia el input y bloquea al tipear cualquier valor por encima del tope.
    const setTarifaInput = (v) => {
        const limpio = limpiarMonedaInput(v)
        const num = parseFloat(limpio)
        if (!isNaN(num) && num > max) return
        setTarifaInputRaw(limpio)
    }

    // `valor` llega como string desde el backend por ser columna DECIMAL (ej. "450.00",
    // siempre con dos decimales aunque sean ".00") — sin redondear acá, TarifaControl.jsx
    // muestra ese string tal cual dentro de formatearMoneda(), que solo entiende dígitos:
    // le quita el punto y "450.00" se vuelve "45000" ($45.000 en pantalla, 100 veces el
    // valor real). Si además se guarda sin editar nada, ese mismo string pasa por
    // limpiarMonedaInput() en handleGuardarTarifa y persiste 45000 en vez de 450. Mismo
    // patrón que ya se usa al precargar tarifaBase/valorAnticipo en Destinos/Anticipos.
    const handleAbrirEdicionTarifa = () => {
        // Carga el valor guardado tal cual (sin clamp — el tope solo aplica a lo que se teclea).
        setTarifaInputRaw(String(Math.round(Number(valor)) || 0))
        setEditandoTarifa(true)
    }

    const handleCancelarEdicionTarifa = () => {
        setEditandoTarifa(false)
        setTarifaInputRaw('')
    }

    const handleGuardarTarifa = async () => {
        const nuevoValor = parseFloat(limpiarMonedaInput(tarifaInput))
        if (isNaN(nuevoValor) || nuevoValor < 0) {
            showToast('Ingresa un valor numérico válido', 'error')
            return
        }
        if (nuevoValor > max) {
            showToast(`El valor no puede ser mayor a $${max.toLocaleString('es-CO')}`, 'error')
            return
        }
        setGuardandoTarifa(true)
        try {
            await actualizar(nuevoValor)
            showToast(mensajeExito || 'Tarifa actualizada correctamente', 'success')
            setEditandoTarifa(false)
        } catch (err) {
            showToast(err.message || mensajeError || 'No se pudo actualizar la tarifa.', 'error')
        } finally {
            setGuardandoTarifa(false)
        }
    }

    return {
        valor,
        editandoTarifa, tarifaInput, setTarifaInput, guardandoTarifa,
        handleAbrirEdicionTarifa, handleCancelarEdicionTarifa, handleGuardarTarifa,
    }
}

export default useTarifaEditor
