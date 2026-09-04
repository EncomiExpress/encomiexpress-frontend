import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as configuracionService from '../services/configuracionService'

const ConfiguracionContext = createContext()

export const useConfiguracion = () => useContext(ConfiguracionContext)

export const ConfiguracionProvider = ({ children }) => {
  const { token } = useAuth()
  const [tarifaPorKgHierro, setTarifaPorKgHierro] = useState(0)
  const [tarifaPorKgNormal, setTarifaPorKgNormal] = useState(0)
  const [tarifaPorPaquete, setTarifaPorPaquete] = useState(0)
  const [loading, setLoading] = useState(true)

  // Devuelve {tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete} frescos (no solo
  // actualiza el estado del contexto) -- necesario para quien llame esto dentro de un
  // mismo .then() (ver useVentaWizardForm.js, refresco de los pasos "Paquete" y "Pago"):
  // los estados de React no se actualizan de forma síncrona, así que leer estos valores
  // del hook ahí mismo daría el valor viejo (closure obsoleto).
  const fetchConfiguracion = useCallback(async (signal) => {
    setLoading(true)
    try {
      const res = await configuracionService.getConfiguracion(signal)
      if (res?.success) {
        const nuevaTarifaPorKgHierro = Number(res.data.tarifaPorKgHierro) || 0
        const nuevaTarifaPorKgNormal = Number(res.data.tarifaPorKgNormal) || 0
        const nuevaTarifaPorPaquete = Number(res.data.tarifaPorPaquete) || 0
        setTarifaPorKgHierro(nuevaTarifaPorKgHierro)
        setTarifaPorKgNormal(nuevaTarifaPorKgNormal)
        setTarifaPorPaquete(nuevaTarifaPorPaquete)
        return { tarifaPorKgHierro: nuevaTarifaPorKgHierro, tarifaPorKgNormal: nuevaTarifaPorKgNormal, tarifaPorPaquete: nuevaTarifaPorPaquete }
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        // Si falla, se sigue usando el último valor conocido (o 0) — la
        // fórmula de precio simplemente no suma nada por peso/paquete hasta
        // que la petición funcione.
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    const abortController = new AbortController()
    fetchConfiguracion(abortController.signal)
    return () => abortController.abort()
  }, [token, fetchConfiguracion])

  const actualizarTarifaPorKgHierro = useCallback(async (nuevaTarifa) => {
    const res = await configuracionService.updateConfiguracion({ tarifaPorKgHierro: nuevaTarifa })
    if (res.success) {
      setTarifaPorKgHierro(Number(res.data.tarifaPorKgHierro) || 0)
      return res.data
    }
    throw new Error(res.message || 'Error al actualizar la configuración')
  }, [])

  const actualizarTarifaPorKgNormal = useCallback(async (nuevaTarifa) => {
    const res = await configuracionService.updateConfiguracion({ tarifaPorKgNormal: nuevaTarifa })
    if (res.success) {
      setTarifaPorKgNormal(Number(res.data.tarifaPorKgNormal) || 0)
      return res.data
    }
    throw new Error(res.message || 'Error al actualizar la configuración')
  }, [])

  const actualizarTarifaPorPaquete = useCallback(async (nuevaTarifa) => {
    const res = await configuracionService.updateConfiguracion({ tarifaPorPaquete: nuevaTarifa })
    if (res.success) {
      setTarifaPorPaquete(Number(res.data.tarifaPorPaquete) || 0)
      return res.data
    }
    throw new Error(res.message || 'Error al actualizar la configuración')
  }, [])

  const value = {
    tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, loading, fetchConfiguracion,
    actualizarTarifaPorKgHierro, actualizarTarifaPorKgNormal, actualizarTarifaPorPaquete,
  }

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  )
}
