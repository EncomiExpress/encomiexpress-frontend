import { useEffect, useState } from 'react'

// No hay forma de saber con certeza SI el backend está reactivándose tras dormirse
// (Render plan gratis apaga el servidor tras ~15 min sin tráfico) o si simplemente
// la red/consulta está lenta — pero la reacción de UI correcta es la misma en ambos
// casos: avisar que está tardando en vez de dejar la pantalla como congelada.
// Umbral en ms: ajústalo tras desplegar en Render, según cuánto tarde en despertar
// de verdad en producción (aquí en local nunca se va a disparar).
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
