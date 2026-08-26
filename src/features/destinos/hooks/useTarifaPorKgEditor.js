import { useState } from 'react'
import { useConfiguracion } from '../../../shared/contexts/ConfiguracionContext.jsx'
import { useToast } from '../../../shared/contexts/ToastContext.jsx'
import { limpiarMonedaInput } from '../../../shared/utils/formatters.js'

const useTarifaPorKgEditor = () => {
    const { tarifaPorKg, actualizarTarifaPorKg } = useConfiguracion()
    const { showToast } = useToast()

    const [editandoTarifa, setEditandoTarifa] = useState(false)
    const [tarifaInput, setTarifaInput] = useState('')
    const [guardandoTarifa, setGuardandoTarifa] = useState(false)

    const handleAbrirEdicionTarifa = () => {
        setTarifaInput(String(tarifaPorKg))
        setEditandoTarifa(true)
    }

    const handleCancelarEdicionTarifa = () => {
        setEditandoTarifa(false)
        setTarifaInput('')
    }

    const handleGuardarTarifa = async () => {
        const valor = parseFloat(limpiarMonedaInput(tarifaInput))
        if (isNaN(valor) || valor < 0) {
            showToast('Ingresa un valor numérico válido', 'error')
            return
        }
        setGuardandoTarifa(true)
        try {
            await actualizarTarifaPorKg(valor)
            showToast('Tarifa por kg actualizada correctamente', 'success')
            setEditandoTarifa(false)
        } catch (err) {
            showToast(err.message || 'No se pudo actualizar la tarifa por kg.', 'error')
        } finally {
            setGuardandoTarifa(false)
        }
    }

    return {
        tarifaPorKg,
        editandoTarifa, tarifaInput, setTarifaInput, guardandoTarifa,
        handleAbrirEdicionTarifa, handleCancelarEdicionTarifa, handleGuardarTarifa,
    }
}

export default useTarifaPorKgEditor
