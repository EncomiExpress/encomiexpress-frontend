import { useEffect, useState } from 'react'

// No hay forma de saber si el backend está reactivándose tras dormirse
const useSlowRequest = (activo, umbralMs = 4000) => {
  const [tardando, setTardando] = useState(false)

  useEffect(() => {
    if (!activo) {
      return undefined
    }
    const timer = setTimeout(() => setTardando(true), umbralMs)
    return () => {
      clearTimeout(timer)
      setTardando(false)
    }
  }, [activo, umbralMs])

  return tardando
}

export default useSlowRequest
