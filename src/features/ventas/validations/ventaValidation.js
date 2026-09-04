import { CAMPOS_PAQUETE, validarCampo, validarCampoPaquete } from './validacion.js'

export const NUMERIC_LIMITS = { valorServicio: 999999999 }
export const PAQUETE_NUMERIC_LIMITS = { peso: 999, alto: 999, ancho: 999, profundidad: 999 }

// "Factor 400": constante de negocio del peso volumétrico (alto×ancho×profundidad, en
// METROS, × 400). Las dimensiones se capturan en cm (ver PasoPaquetes.jsx), por eso se
// dividen entre 100 antes de aplicar el factor.
export const FACTOR_VOLUMETRICO = 400

// Peso volumétrico (kg) de un paquete a partir de sus dimensiones en centímetros.
export const calcularPesoVolumetrico = (alto, ancho, profundidad) => {
    const altoM = (parseFloat(alto) || 0) / 100
    const anchoM = (parseFloat(ancho) || 0) / 100
    const profundidadM = (parseFloat(profundidad) || 0) / 100
    return altoM * anchoM * profundidadM * FACTOR_VOLUMETRICO
}

// Compara peso real vs. volumétrico y devuelve cuál "gana" -- se reusa tanto en el
// preview en vivo del paso Paquetes como en el cálculo final del paso Pago.
export const calcularPesoEfectivo = (paquete) => {
    const pesoReal = parseFloat(paquete.peso) || 0
    const pesoVolumetrico = calcularPesoVolumetrico(paquete.alto, paquete.ancho, paquete.profundidad)
    return {
        pesoReal, pesoVolumetrico,
        pesoEfectivo: Math.max(pesoReal, pesoVolumetrico),
        gana: pesoVolumetrico > pesoReal ? 'volumetrico' : 'real',
    }
}

// Costo por peso de UN paquete: su peso efectivo × la tarifa por kg que le corresponda
// según su tipoCarga (hierro/normal).
export const calcularCostoPeso = (paquete, tarifaPorKgHierro, tarifaPorKgNormal) => {
    const { pesoEfectivo } = calcularPesoEfectivo(paquete)
    const tarifaKg = paquete.tipoCarga === 'hierro' ? tarifaPorKgHierro : tarifaPorKgNormal
    return pesoEfectivo * (Number(tarifaKg) || 0)
}

// valorServicio = tarifa base del destino + (suma del costo por peso de cada paquete,
// según su tipo de carga y el mayor entre su peso real y volumétrico) + (cantidad de
// paquetes × tarifa por paquete). El resultado sigue siendo editable a mano después
// de este auto-cálculo.
export const calcularValorServicio = (tarifaBase, paquetes, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete = 0) => {
    const costoPesoTotal = paquetes.reduce((s, p) => s + calcularCostoPeso(p, tarifaPorKgHierro, tarifaPorKgNormal), 0)
    return Number(tarifaBase || 0) + costoPesoTotal + (paquetes.length * (Number(tarifaPorPaquete) || 0))
}

// Devuelve {} (sin recalcular nada) si todavía no hay ruta seleccionada -- el call site
// usa eso para decidir si también debe resetear el ref de "editado a mano". Ya no hay
// impuestos: total queda siempre igual a valorServicio.
export const calcularValoresPaquetes = (idRuta, paquetes, rutasProgramadas, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete) => {
    if (!idRuta) return {}
    const ruta = rutasProgramadas.find(r => r.idRuta === parseInt(idRuta))
    const vs = calcularValorServicio(ruta?.destino?.tarifaBase, paquetes, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete)
    return { valorServicio: vs, total: vs }
}

export const validarPaso = (step, form, rutasProgramadas, opts = {}) => {
    const { ventaOriginal = null, getPesoOriginalPorPar } = opts
    const e = {}

    if (step === 0) {
        e.idCliente = validarCampo('idCliente', form, ventaOriginal)
        e.nombreDestinatario = validarCampo('nombreDestinatario', form, ventaOriginal)
        e.telefonoDestinatario = validarCampo('telefonoDestinatario', form, ventaOriginal)
        e.correoDestinatario = validarCampo('correoDestinatario', form, ventaOriginal)
        e.idDestinoDestinatario = validarCampo('idDestinoDestinatario', form, ventaOriginal)
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
