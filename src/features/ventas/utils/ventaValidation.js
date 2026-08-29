import { CAMPOS_PAQUETE, validarCampo, validarCampoPaquete } from '../components/wizard/validacion.js'

export const NUMERIC_LIMITS = { valorServicio: 999999999, impuestos: 999999999 }
export const PAQUETE_NUMERIC_LIMITS = { peso: 9999, alto: 9999, ancho: 9999, profundidad: 9999, valorDeclarado: 999999999 }

// valorServicio = tarifa base del destino + (peso × tarifa por kg). El resultado sigue
// siendo editable a mano después de este auto-cálculo.
export const calcularValorServicio = (tarifaBase, peso, tarifaPorKg) => {
    const pesoNum = parseFloat(peso) || 0
    return Number(tarifaBase || 0) + (pesoNum * tarifaPorKg)
}

// Devuelve {} (sin recalcular nada) si todavía no hay ruta seleccionada -- el call site
// usa eso para decidir si también debe resetear los refs de "editado a mano".
export const calcularValoresPaquetes = (idRuta, paquetes, rutasProgramadas, tarifaPorKg) => {
    if (!idRuta) return {}
    const ruta = rutasProgramadas.find(r => r.idRuta === parseInt(idRuta))
    const pesoTotal = paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
    const vs = calcularValorServicio(ruta?.destino?.tarifaBase, pesoTotal, tarifaPorKg)
    const imp = Math.round(vs * 0.10)
    return { valorServicio: vs, impuestos: imp, total: vs + imp }
}

export const validarPaso = (step, form, rutasProgramadas, opts = {}) => {
    const { ventaOriginal = null, getPesoOriginalPorPar } = opts
    const e = {}

    if (step === 0) {
        e.idCliente = validarCampo('idCliente', form, ventaOriginal)
        e.nombreDestinatario = validarCampo('nombreDestinatario', form, ventaOriginal)
        e.telefonoDestinatario = validarCampo('telefonoDestinatario', form, ventaOriginal)
        e.direccionDestinatario = validarCampo('direccionDestinatario', form, ventaOriginal)
    }

    if (step === 1) {
        const erroresPaquetes = form.paquetes.map(p => {
            const pe = {}
            CAMPOS_PAQUETE.forEach(campo => {
                const err = validarCampoPaquete(campo, p)
                if (err) pe[campo] = err
            })
            return pe
        })
        if (erroresPaquetes.some(pe => Object.keys(pe).length > 0)) e.paquetes = erroresPaquetes
    }

    if (step === 2) {
        e.idRuta = validarCampo('idRuta', form, ventaOriginal)
        e.fechaEstimadaEntrega = validarCampo('fechaEstimadaEntrega', form, ventaOriginal)
        e.observaciones = validarCampo('observaciones', form, ventaOriginal)

        const rutaSel = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
        if (rutaSel) {
            const erroresAsignacion = form.paquetes.map(p => {
                const err = validarCampoPaquete('idRutaVehiculoConductor', p)
                return err ? { idRutaVehiculoConductor: err } : {}
            })

            // Mismo cálculo que las alertas de capacidad en el render -- si algún vehículo
            // del convoy ya no alcanza, se marca en rojo el select del paquete
            // correspondiente (el backend también lo valida al guardar, pero avisar aquí
            // evita llegar hasta el final para enterarse). getPesoOriginalPorPar (solo en
            // modo Actualizar) excluye el peso que la propia venta ya tenía en cada
            // vehículo antes de editar, para no restarlo dos veces.
            const pesoOriginalPorPar = getPesoOriginalPorPar ? getPesoOriginalPorPar() : {}
            const pares = rutaSel.paresVehiculoConductor || []
            for (const par of pares) {
                const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
                if (capacidad == null) continue
                const pesoUsadoOtras = Math.max(0, Number(par.pesoUsado || 0) - (pesoOriginalPorPar[par.idRutaVehiculoConductor] || 0))
                const disponible = capacidad - pesoUsadoOtras
                const indices = form.paquetes
                    .map((p, i) => i)
                    .filter(i => parseInt(form.paquetes[i].idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                const pesoNuevo = indices.reduce((s, i) => s + (parseFloat(form.paquetes[i].peso) || 0), 0)
                if (pesoNuevo > disponible) {
                    const mensaje = `${par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((pesoNuevo - disponible).toFixed(2))} kg.`
                    indices.forEach(i => { erroresAsignacion[i] = { ...erroresAsignacion[i], idRutaVehiculoConductor: mensaje } })
                }
            }

            if (erroresAsignacion.some(pe => Object.keys(pe).length > 0)) {
                e.paquetes = (e.paquetes || form.paquetes.map(() => ({}))).map((pe, i) => ({ ...pe, ...erroresAsignacion[i] }))
            }
        }
    }

    if (step === 3) {
        e.metodoPago = validarCampo('metodoPago', form, ventaOriginal)
    }

    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
