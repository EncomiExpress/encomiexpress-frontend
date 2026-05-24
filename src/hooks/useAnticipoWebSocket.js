import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../shared/contexts/AuthContext'

const useAnticipoWebSocket = ({ agregarAnticipo, actualizarAnticipo }) => {
  const { token } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
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
  }, [token, agregarAnticipo, actualizarAnticipo])

  return socketRef.current
}

export default useAnticipoWebSocket