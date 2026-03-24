import { createContext, useContext, useState } from 'react'

const ClienteContext = createContext()

export const useClientes = () => useContext(ClienteContext)

export const ClienteProvider = ({ children }) => {
    const [clientes, setClientes] = useState([
        { idCliente: 1, tipoIdentificacion: 'CC', numeroIdentificacion: '1038648135', nombre: 'Santiago', apellido: 'Suárez Durán', telefono: '3104776919', email: 'santiago@gmail.com', direccion: 'Cll 45 #20-10', ciudad: 'Medellín', habilitado: true },
        { idCliente: 2, tipoIdentificacion: 'CC', numeroIdentificacion: '1013343818', nombre: 'Sebastian', apellido: 'Valencia Pérez', telefono: '3117772135', email: 'sebastian@gmail.com', direccion: 'Cra 80 #50-30', ciudad: 'Medellín', habilitado: true },
        { idCliente: 3, tipoIdentificacion: 'TI', numeroIdentificacion: '1106634727', nombre: 'Valeria', apellido: 'Paz Arana', telefono: '3107018771', email: 'valeria@gmail.com', direccion: 'Av El Poblado #1-20', ciudad: 'Medellín', habilitado: false },
        { idCliente: 4, tipoIdentificacion: 'NIT', numeroIdentificacion: '900123456', nombre: 'Carlos', apellido: 'Gómez López', telefono: '3001234567', email: 'carlos@empresa.com', direccion: 'Cll 10 #5-40', ciudad: 'Bogotá', habilitado: true },
        { idCliente: 5, tipoIdentificacion: 'CE', numeroIdentificacion: '987654321', nombre: 'María', apellido: 'Torres Ruiz', telefono: '3209876543', email: 'maria@gmail.com', direccion: 'Cra 50 #30-15', ciudad: 'Cali', habilitado: true },
        { idCliente: 6, tipoIdentificacion: 'CC', numeroIdentificacion: '71234567', nombre: 'Andrés', apellido: 'Martínez Díaz', telefono: '3154321098', email: 'andres@gmail.com', direccion: 'Cll 70 #45-20', ciudad: 'Barranquilla', habilitado: false },
        { idCliente: 7, tipoIdentificacion: 'CC', numeroIdentificacion: '43210987', nombre: 'Luisa', apellido: 'Hernández Castro', telefono: '3168765432', email: 'luisa@gmail.com', direccion: 'Cra 65 #12-08', ciudad: 'Bucaramanga', habilitado: true },
    ])

    const agregarCliente = (nuevoCliente) => {
        setClientes(prev => [
            ...prev,
            { ...nuevoCliente, idCliente: prev.length + 1, habilitado: true }
        ])
    }

    const actualizarCliente = (clienteActualizado) => {
        setClientes(prev =>
            prev.map(c =>
                c.idCliente === clienteActualizado.idCliente ? clienteActualizado : c
            )
        )
    }

    // Cambia el estado de habilitado/inhabilitado (toggle)
    const invalidateCliente = (id) => {
        setClientes(prev => prev.map(c => c.idCliente === id ? { ...c, habilitado: !c.habilitado } : c))
    }

    return (
        <ClienteContext.Provider value={{ clientes, agregarCliente, invalidateCliente, actualizarCliente }}>
            {children}
        </ClienteContext.Provider>
    )
}
