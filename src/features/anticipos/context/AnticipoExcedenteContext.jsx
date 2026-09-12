import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as anticipoService from '../services/anticipoService'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'
import { useRutaProgramacion } from '../../rutas/context/RutaProgramacionContext.jsx'

const AnticipoExcedenteContext = createContext()

export const useAnticipos = () => useContext(AnticipoExcedenteContext)

export const AnticipoExcedenteProvider = ({ children }) => {
  const { token } = useAuth()
  const { conductores } = useConductor()
  const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()

  const [anticipos, setAnticipos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnticipos = useCallback(async (signal, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await anticipoService.getAnticipos(signal, params)
      if (res?.success) {
        setAnticipos(res.data)
        setTotal(res.total ?? res.data.length)
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
    fetchAnticipos(abortController.signal, {
      page: 1,
      limit: 5,
      sortBy: 'fechaEntrega.desc'
    })
    return () => abortController.abort()
  }, [token, fetchAnticipos])

  // Cargar rutas al montar siempre que haya token,
  // independientemente de si el array ya tiene datos en el contexto padre
  useEffect(() => {
    if (token) {
      fetchRutasProgramadas({ limit: 1000 })
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Normalizar conductores para el selector: { idConductor, nombre } — solo habilitados.
  // Memoizado: sin esto, este array (y los de rutas de abajo) se reconstruían enteros —
  // con objetos nuevos — en CADA render del provider, aunque `conductores`/`rutasProgramadas`
  // no hubieran cambiado en nada. Un Autocomplete controlado (ver PasoRutaVehiculo.jsx)
  // interpreta esa referencia nueva como "el valor cambió" y resetea lo que el usuario
  // esté escribiendo para buscar — mismo bug de fondo que el de la "x" en Editar Anticipo
  // (ver ActualizarAnticipoExcedente.jsx, rutaSintetica), solo que acá podía disparar con
  // cualquier ruta/conductor, no solo el caso sintético.
  const conductoresNormalizados = useMemo(() => conductores
    .filter((c) => c.habilitado !== false)
    .map((c) => ({
      idConductor: c.idConductor,
      nombre:
        c.nombre && c.apellido
          ? `${c.nombre} ${c.apellido}`
          : c.nombre || `Conductor ${c.idConductor}`,
      numeroIdentificacion: c.numeroIdentificacion || '',
    })), [conductores])

  // Normalizar rutas para el selector: { idRuta, nombre, paresVehiculoConductor } —
  // solo habilitadas y Programadas (una ruta "En Ruta"/"Completada"/"Cancelada" ya no
  // debería recibir anticipos nuevos). Una ruta ahora puede tener varios vehículo+conductor
  // (convoy), así que el conductor ya no se autocompleta solo: el formulario debe dejar
  // elegir cuál par corresponde entre los de `paresVehiculoConductor`.
  const rutasNormalizadas = useMemo(() => rutasProgramadas
    .filter((r) => r.habilitado !== false && r.estado === 'Programada')
    .map((r) => ({
      idRuta: r.idRuta,
      nombre: r.origen || r.nombre || `Ruta ${r.idRuta}`,
      destino: r.destino || null,
      // Para validar que fechaEntrega del anticipo no sea posterior a la salida de
      // la ruta (ver anticipoValidation.js, validarCampo 'fechaEntrega').
      fechaSalida: r.fechaSalida || null,
      // Paradas intermedias del corredor — solo para dibujar el recorrido en el
      // selector de ruta (ModalRutaDiagrama, ver PasoRutaVehiculo.jsx), no se usa
      // para nada más acá.
      paradas: r.paradas || [],
      paresVehiculoConductor: (r.paresVehiculoConductor || [])
        .filter((p) => p.habilitado !== false)
        .map((p) => {
          const u = p.conductor?.usuario
          return {
            idRutaVehiculoConductor: p.idRutaVehiculoConductor,
            idVehiculo: p.idVehiculo,
            idConductor: p.idConductor,
            placa: p.vehiculo?.placa || '',
            conductorNombre: u ? `${u.nombre} ${u.apellido}` : `Conductor ${p.idConductor}`,
          }
        }),
    })), [rutasProgramadas])

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const agregarAnticipo = useCallback(async (datos) => {
    const res = await anticipoService.createAnticipo(datos)
    const nuevo = res.data
    if (nuevo) setAnticipos((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const actualizarAnticipo = useCallback(async (datosActualizados) => {
    const id = datosActualizados.idAnticipoExcedente
    const res = await anticipoService.updateAnticipo(id, datosActualizados)
    const actualizado = res.data
    if (actualizado) {
      setAnticipos((prev) =>
        prev.map((a) => (a.idAnticipoExcedente === id ? actualizado : a))
      )
    }
    return actualizado
  }, [])

  // Confirma que el conductor devolvió el excedente: pasa el anticipo a
  // Completado y registra fechaEntregaExcedente con la fecha de hoy.
  const entregarExcedente = useCallback(async (id, soporte) => {
    const res = await anticipoService.entregarExcedenteAnticipo(id, soporte)
    const actualizado = res?.data
    if (actualizado) {
      setAnticipos((prev) =>
        prev.map((a) => (a.idAnticipoExcedente === id ? actualizado : a))
      )
    }
    return actualizado
  }, [])

  const toggleHabilitado = useCallback(async (id) => {
    const res = await anticipoService.toggleHabilitadoAnticipo(id)
    if (res?.data) {
      setAnticipos((prev) =>
        prev.map((a) => (a.idAnticipoExcedente === id ? res.data : a))
      )
    }
  }, [])

  return (
    <AnticipoExcedenteContext.Provider
      value={{
        anticipos,
        total,
        fetchAnticipos,
        conductores: conductoresNormalizados,
        rutas: rutasNormalizadas,
        // Se reexpone para que Registrar/Editar Anticipo puedan pedir las rutas
        // frescas al abrirse — `rutasProgramadas` solo se carga una vez por sesión
        // (ver el useEffect de arriba, atado a `token`), así que si una ruta se edita
        // en otra pantalla (ej. se reasigna un conductor) mientras el usuario sigue
        // logueado, el wizard de Anticipos seguiría viendo la versión vieja sin esto.
        fetchRutasProgramadas,
        loading,
        error,
        agregarAnticipo,
        actualizarAnticipo,
        entregarExcedente,
        toggleHabilitado,
      }}
    >
      {children}
    </AnticipoExcedenteContext.Provider>
  )
}

export default AnticipoExcedenteProvider