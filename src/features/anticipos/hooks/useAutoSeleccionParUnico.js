import { useEffect } from 'react'

// Si a la ruta elegida solo le queda un vehículo+conductor DISPONIBLE (sin anticipo
// activo — ver useAnticiposActivos.filtrarParesDisponibles), no tiene caso elegir — se
// autocompleta, igual que en Ventas con los paquetes cuando la ruta tiene un solo
// vehículo. Antes miraba TODOS los pares de la ruta (sin filtrar por anticipo); ahora el
// caller pasa ya la lista filtrada, así que esto autoselecciona "el único que falta" aun
// cuando la ruta tenga varios pares en total.
// enabled: en ActualizarAnticipoExcedente esto solo debe correr mientras la asignación
// sigue siendo editable (anticipo en estado "Entregado"); en RegistrarAnticipoExcedente
// siempre es true.
export function useAutoSeleccionParUnico(idRuta, paresDisponibles, setForm, setParInput, enabled = true) {
    const unico = (paresDisponibles || []).length === 1 ? paresDisponibles[0] : null

    useEffect(() => {
        if (!enabled || !unico) return
        setForm(prev => (prev?.idRutaVehiculoConductor === unico.idRutaVehiculoConductor
            ? prev
            : { ...prev, idRutaVehiculoConductor: unico.idRutaVehiculoConductor }))
        setParInput(`${unico.placa || 'Sin placa'} — ${unico.conductorNombre}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idRuta, unico?.idRutaVehiculoConductor, enabled])
}
