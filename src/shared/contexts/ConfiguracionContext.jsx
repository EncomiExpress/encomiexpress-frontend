import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as configuracionService from '../services/configuracionService'

const ConfiguracionContext = createContext()

export const useConfiguracion = () => useContext(ConfiguracionContext)

export const ConfiguracionProvider = ({ children }) => {
  const { token } = useAuth()
  const [tarifaPorKg, setTarifaPorKg] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchConfiguracion = useCallback(async (signal) => {
    setLoading(true)
    try {
      const res = await configuracionService.getConfiguracion(signal)
      if (res?.success) {
        setTarifaPorKg(Number(res.data.tarifaPorKg) || 0)
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        // Si falla, se sigue usando el último valor conocido (o 0) — la
        // fórmula de precio simplemente no suma nada por peso hasta que
        // la petición funcione.
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

  const actualizarTarifaPorKg = useCallback(async (nuevaTarifa) => {
    const res = await configuracionService.updateConfiguracion({ tarifaPorKg: nuevaTarifa })
    if (res.success) {
      setTarifaPorKg(Number(res.data.tarifaPorKg) || 0)
      return res.data
    }
    throw new Error(res.message || 'Error al actualizar la configuración')
  }, [])

  const value = { tarifaPorKg, loading, fetchConfiguracion, actualizarTarifaPorKg }

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  )
}
