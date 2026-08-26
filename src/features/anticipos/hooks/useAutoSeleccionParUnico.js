import { useEffect } from 'react'

// Si la ruta elegida tiene un solo vehículo+conductor, no tiene caso elegir — se
// autocompleta, igual que en Ventas con los paquetes cuando la ruta tiene un solo vehículo.
// enabled: en ActualizarAnticipoExcedente esto solo debe correr mientras la asignación
// sigue siendo editable (anticipo en estado "Entregado"); en RegistrarAnticipoExcedente
// siempre es true.
export function useAutoSeleccionParUnico(idRuta, rutas, setForm, setParInput, enabled = true) {
    useEffect(() => {
        if (!enabled) return
        const ruta = rutas.find(r => r.idRuta === parseInt(idRuta))
        const pares = ruta?.paresVehiculoConductor || []
        if (pares.length !== 1) return
        const unico = pares[0]
        setForm(prev => (prev?.idRutaVehiculoConductor === unico.idRutaVehiculoConductor
            ? prev
            : { ...prev, idRutaVehiculoConductor: unico.idRutaVehiculoConductor }))
        setParInput(`${unico.placa || 'Sin placa'} — ${unico.conductorNombre}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idRuta, rutas, enabled])
}
