import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as clienteService from '../services/clienteService.js'
import { useAuth } from './AuthContext'

const ClienteContext = createContext()

export const useClientes = () => useContext(ClienteContext)

const normalize = (c) => c

export const ClienteProvider = ({ children }) => {
    const { token } = useAuth()
    const [clientes, setClientes] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchClientes = useCallback(async (signal, params = {}) => {
        setLoading(true)
        setError(null)
        try {
            const res = await clienteService.getClientes(signal, params)
            if (res?.success) {
                setClientes((res.data || []).map(normalize))
                setTotal(res.total ?? (res.data || []).length)
            }
        } catch (err) {
            if (err?.name !== 'AbortError' && err.status !== 403) {
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }

        const abortController = new AbortController()
        fetchClientes(abortController.signal)

        return () => abortController.abort()
    }, [token, fetchClientes])

  const agregarCliente = async (nuevoCliente) => {
    const res = await clienteService.createCliente(nuevoCliente)
    setClientes(prev => [...prev, normalize(res.data)])
  }

  const actualizarCliente = async (clienteActualizado) => {
    const res = await clienteService.updateCliente(clienteActualizado.idCliente, clienteActualizado)
    setClientes(prev =>
      prev.map(c => c.idCliente === clienteActualizado.idCliente ? normalize(res.data) : c)
    )
  }

  const toggleHabilitadoCliente = async (id) => {
    const res = await clienteService.toggleHabilitadoCliente(id)
    setClientes(prev =>
      prev.map(c => c.idCliente === id ? normalize(res.data) : c)
    )
    return res
  }

  const value = {
    clientes, total, loading, error,
    fetchClientes,
    agregarCliente, actualizarCliente, toggleHabilitadoCliente,
  }

  return (
    <ClienteContext.Provider value={value}>
      {children}
    </ClienteContext.Provider>
  )
}