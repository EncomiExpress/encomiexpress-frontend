import { createContext, useContext, useState, useEffect } from 'react'
import * as clienteService from '../services/clienteService.js'

const ClienteContext = createContext()

export const useClientes = () => useContext(ClienteContext)

// El backend devuelve `id`, el frontend usa `idCliente` — normalizamos aquí
const normalize = (c) => ({ ...c, idCliente: c.id })

export const ClienteProvider = ({ children }) => {
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
        setLoading(false)
        return
    }
    clienteService.getClientes()
        .then(res => setClientes(res.data.map(normalize)))
        .catch(err => {
            if (err.status !== 403) {
                setError(err.message)
            }
        })
        .finally(() => setLoading(false))
}, [])

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

    const invalidateCliente = async (id) => {
        const res = await clienteService.toggleHabilitadoCliente(id)
        setClientes(prev =>
            prev.map(c => c.idCliente === id ? normalize(res.data) : c)
        )
    }

    const actualizarEstadoCliente = (id, habilitado) => {
        setClientes(prev =>
            prev.map(c => c.idCliente === id ? { ...c, habilitado } : c)
        )
    }

    return (
        <ClienteContext.Provider value={{ clientes, loading, error, agregarCliente, invalidateCliente, actualizarCliente, actualizarEstadoCliente }}>
            {children}
        </ClienteContext.Provider>
    )
}

