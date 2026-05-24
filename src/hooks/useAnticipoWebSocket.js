import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const useAnticipoWebSocket = ({ agregarAnticipo, actualizarAnticipo }) => {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      auth: { token }
    })

    socketRef.current.on('anticipo_created', (nuevo) => {
      try { agregarAnticipo && agregarAnticipo(nuevo) } catch (e) { console.error(e) }
    })

    socketRef.current.on('anticipo_updated', (actualizado) => {
      try { actualizarAnticipo && actualizarAnticipo(actualizado) } catch (e) { console.error(e) }
    })

    socketRef.current.on('soporte_uploaded', (payload) => {
      try { actualizarAnticipo && actualizarAnticipo(payload) } catch (e) { console.error(e) }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [agregarAnticipo, actualizarAnticipo])

  return socketRef.current
}

export default useAnticipoWebSocket

