import { useState, useEffect } from 'react'

const DIAS   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES  = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export const formatDateTime = (date) => {
  const dia  = DIAS[date.getDay()]
  const num  = date.getDate()
  const mes  = MESES[date.getMonth()]
  const hora = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${dia}, ${num} de ${mes}  •  ${hora}`
}

const useDateTime = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    // Sincronizar con el cambio de minuto exacto
    const msHastaProximoMinuto = (60 - new Date().getSeconds()) * 1000
    const timeout = setTimeout(() => {
      setNow(new Date())
      const interval = setInterval(() => setNow(new Date()), 60000)
      return () => clearInterval(interval)
    }, msHastaProximoMinuto)

    return () => clearTimeout(timeout)
  }, [now])

  return formatDateTime(now)
}

export default useDateTime
