import { createContext, useContext, useState, useEffect } from 'react'
import * as anticipoService from '../services/anticipoService'
import { fetchWithAuth } from '../services/authService'
import useAnticipoWebSocket from '../../hooks/useAnticipoWebSocket'
import { useAuth } from './AuthContext'

const AnticipoExcedenteContext = createContext()

export const useAnticipos = () => useContext(AnticipoExcedenteContext)

export const AnticipoExcedenteProvider = ({ children }) => {
  const { token } = useAuth()
  const [anticipos, setAnticipos] = useState([])
  const [conductores, setConductores] = useState([])
  const [rutas, setRutas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    Promise.all([
      anticipoService.getAnticipos(),
      fetchWithAuth('/conductores'),
      fetchWithAuth('/rutas'),
    ])
      .then(([anticiposRes, conductoresRes, rutasRes]) => {
        setAnticipos(anticiposRes.data || [])
        // Normalizar conductores: nombre completo desde usuario asociado
        setConductores(
          (conductoresRes.data || []).map(c => ({
            idConductor: c.idConductor,
            nombre: c.usuario
              ? `${c.usuario.nombre} ${c.usuario.apellido}`
              : `Conductor ${c.idConductor}`,
          }))
        )
        setRutas(
          (rutasRes.data || []).map(r => ({
            idRuta: r.idRuta,
            nombre: r.nombre,
          }))
        )
      })
      .catch(err => {
        if (err.status !== 403) {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  const agregarAnticipo = async (nuevo) => {
    const res = await anticipoService.createAnticipo(nuevo)
    setAnticipos(prev => [...prev, res.data])
  }

  const actualizarAnticipo = async (actualizado) => {
    const res = await anticipoService.updateAnticipo(actualizado.idAnticipoExcedente, actualizado)
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === actualizado.idAnticipoExcedente ? res.data : a
      )
    )
  }

  const actualizarAnticipoEnLista = (actualizado) => {
    setAnticipos(prev => prev.map(a => (a.idAnticipoExcedente === (actualizado.idAnticipoExcedente || actualizado.idAnticipo) ? { ...a, ...actualizado } : a)))
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    await anticipoService.cambiarEstadoAnticipo(id, nuevoEstado)
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === id ? { ...a, estado: nuevoEstado } : a
      )
    )
  }

  const toggleHabilitado = async (id) => {
    await anticipoService.toggleHabilitadoAnticipo(id)
    setAnticipos(prev =>
      prev.map(a =>
        a.idAnticipoExcedente === id ? { ...a, habilitado: !a.habilitado } : a
      )
    )
  }

  // Inicializar WebSocket para actualizaciones en tiempo real
  useAnticipoWebSocket({ agregarAnticipo, actualizarAnticipo: actualizarAnticipoEnLista })

  return (
    <AnticipoExcedenteContext.Provider
      value={{
        anticipos,
        conductores,
        rutas,
        loading,
        error,
        agregarAnticipo,
        actualizarAnticipo,
        cambiarEstado,
        toggleHabilitado,
      }}
    >
      {children}
    </AnticipoExcedenteContext.Provider>
  )
}

// Exports de compatibilidad — ahora son arrays vacíos, los datos reales
// vienen del contexto (conductores, rutas). Se mantienen para no romper
// otros imports que aún los referencien.
export const conductoresMock = []
export const rutasMock = []

export default AnticipoExcedenteProvider