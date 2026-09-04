import { useState } from 'react'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { limpiarMonedaInput } from '../../../shared/utils/formatters.js'

// Generaliza el patrón candado + edición inline de un valor global de
// Configuracion -- antes duplicado por cada tarifa (useTarifaPorKgEditor en
// Destinos, useTarifaPorPaqueteEditor en Ventas). Ahora Ventas necesita 3
// instancias (kg-hierro, kg-normal, por-paquete) y Destinos ninguna, así que
// vive acá como único dueño, parametrizado por el valor y el setter del
// ConfiguracionContext que le pase cada control.
const useTarifaEditor = (valor, actualizar, { mensajeExito, mensajeError } = {}) => {
    const { showToast } = useToast()

    const [editandoTarifa, setEditandoTarifa] = useState(false)
    const [tarifaInput, setTarifaInput] = useState('')
    const [guardandoTarifa, setGuardandoTarifa] = useState(false)

    const handleAbrirEdicionTarifa = () => {
        setTarifaInput(String(valor))
        setEditandoTarifa(true)
    }

    const handleCancelarEdicionTarifa = () => {
        setEditandoTarifa(false)
        setTarifaInput('')
    }

    const handleGuardarTarifa = async () => {
        const nuevoValor = parseFloat(limpiarMonedaInput(tarifaInput))
        if (isNaN(nuevoValor) || nuevoValor < 0) {
            showToast('Ingresa un valor numérico válido', 'error')
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
