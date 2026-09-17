import { CAMPOS_PAQUETE, validarCampo, validarCampoPaquete, validarDocumentoDestinatarioCompleto } from './validacion.js'

export const NUMERIC_LIMITS = { total: 9999999 }
export const PAQUETE_NUMERIC_LIMITS = { peso: 999, alto: 999, ancho: 999, profundidad: 999 }

// Rutas directas: el municipio de destino de la venta (elegido en "Participantes")
// tiene que ser EXACTAMENTE el destino final de la salida elegida. Si no, esa
// salida no sirve para esta venta — se BLOQUEA el paso. El destino final no es un
// campo directo de la Salida — se hereda de su Ruta (plantilla):
// `salida.ruta.idDestino` (ver models/index.js).
export const rutaLlegaAlDestino = (salida, idDestinoVenta) => {
    if (!salida || !idDestinoVenta) return true
    return idDestinoVenta === salida.ruta?.idDestino
}
export const MENSAJE_RUTA_NO_LLEGA = 'Esta salida no llega al municipio de destino de la venta'

// Rutas directas: todos los pares del convoy de una salida llegan al mismo (único)
// destino final -- si `rutaLlegaAlDestino` ya validó la salida, cualquier par sirve.
export const paresQueLleganAlDestino = (salida, idDestinoVenta) => {
    const pares = salida?.paresVehiculoConductor || []
    if (!idDestinoVenta || idDestinoVenta === salida?.ruta?.idDestino) return pares
    return []
}

// Para operador_sede, el destino de una venta solo puede ser uno al que de verdad
// pueda llegar alguno de los regresos disponibles de SU sede (mismo filtro de
// salidas que ofrece PasoEnvio — regreso, sale de mi sede, Programada, habilitada).
// Se arma directo del `ruta.destino` que YA viene anidado en cada salida (mismo
// dato que ya usa `rutaLlegaAlDestino`) — a propósito SIN llamar a `/destinos`: ese
// catálogo es el listado nacional completo (con tarifas), y `operador_sede` no
// tiene ni debería tener el permiso `listar_destino` para verlo. Si no hay ningún
// regreso disponible todavía, el resultado es un array vacío (a propósito: no hay
// ningún destino válido para ofrecer, ver plan-sedes-remotas.md, WS5).
export const destinosDesdeSede = (salidas, municipioSede) => {
    const regresosDisponibles = (salidas || []).filter((r) =>
        r.habilitado !== false && r.estado === 'Programada' && r.idSalidaIda != null && r.origen === municipioSede
    )
    const porId = new Map()
    for (const r of regresosDisponibles) {
        if (r.ruta?.destino) porId.set(r.ruta.destino.idDestino, r.ruta.destino)
    }
    return [...porId.values()]
}

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

// Póliza de seguro opcional (1% del valor declarado de la mercancía) -- decisión
// de negocio (P5): aplica por paquete individual, no por venta completa, así que
// cada paquete tiene su propio toggle + valor declarado. Sin la póliza activa (o
// sin valor declarado todavía), no suma nada al total.
export const PORCENTAJE_POLIZA = 0.01
export const calcularValorPoliza = (paquete) => {
    if (!paquete.aplicaPoliza) return 0
    const valorDeclarado = parseFloat(paquete.valorDeclarado) || 0
    return valorDeclarado * PORCENTAJE_POLIZA
}

// total = tarifa base del destino + (suma del costo por peso de cada paquete,
// según su tipo de carga y el mayor entre su peso real y volumétrico) + (cantidad de
// paquetes × tarifa por paquete) + (suma de la póliza de cada paquete con valor
// declarado, ver calcularValorPoliza -- P5). El resultado sigue siendo editable a
// mano después de este auto-cálculo.
//
// Se redondea SIEMPRE al peso colombiano más cercano (sin centavos, ver LOGICA.md) antes
// de devolverlo — el peso volumétrico (alto×ancho×profundidad/100³×400) puede dar un
// kilaje con decimales (ej. 3.75 kg), y ese decimal se arrastraba hasta el total final
// (ej. $35.437,5). Ese total con .5 pesos después pasaba por formatearMoneda()/
// limpiarMonedaInput() (que solo entienden dígitos, sin punto decimal) en el campo
// "Total a pagar" de PasoPago.jsx, y al quitarle el punto "35437.5" se convertía en
// "354375" — un cobro 10 veces mayor al real, mostrado como si fuera correcto. Redondear
// acá, en el único lugar que calcula el total, evita que un total fraccionario llegue a
// tocar esas dos funciones.
export const calcularValorServicio = (tarifaBase, paquetes, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete = 0) => {
    const costoPesoTotal = paquetes.reduce((s, p) => s + calcularCostoPeso(p, tarifaPorKgHierro, tarifaPorKgNormal), 0)
    const costoPolizaTotal = paquetes.reduce((s, p) => s + calcularValorPoliza(p), 0)
    const total = Number(tarifaBase || 0) + costoPesoTotal + costoPolizaTotal + (paquetes.length * (Number(tarifaPorPaquete) || 0))
    // Se topa en NUMERIC_LIMITS.total para no dejar un valor auto-calculado por encima de
    // lo que el campo editable (y el backend) aceptan.
    return Math.min(Math.round(total), NUMERIC_LIMITS.total)
}

// Devuelve {} (sin recalcular nada) si todavía no hay salida seleccionada -- el call
// site usa eso para decidir si también debe resetear el ref de "editado a mano".
export const calcularValoresPaquetes = (idSalida, paquetes, salidasProgramadas, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete) => {
    if (!idSalida) return {}
    const salida = salidasProgramadas.find(r => r.idSalida === parseInt(idSalida))
    const total = calcularValorServicio(salida?.ruta?.destino?.tarifaBase, paquetes, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete)
    return { total }
}

export const validarPaso = (step, form, salidasProgramadas, opts = {}) => {
    const { ventaOriginal = null, getPesoOriginalPorPar, esOperadorSede = false, sedeMunicipio } = opts
    const e = {}

    if (step === 0) {
        e.idCliente = validarCampo('idCliente', form, ventaOriginal)
        e.tipoIdentificacionDestinatario = validarCampo('tipoIdentificacionDestinatario', form, ventaOriginal)
        e.numeroIdentificacionDestinatario = validarDocumentoDestinatarioCompleto(form.tipoIdentificacionDestinatario, form.numeroIdentificacionDestinatario)
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
        e.idSalida = validarCampo('idSalida', form, ventaOriginal)
        e.fechaEstimadaEntrega = validarCampo('fechaEstimadaEntrega', form, ventaOriginal)
        e.observaciones = validarCampo('observaciones', form, ventaOriginal)

        const rutaSel = salidasProgramadas.find(r => r.idSalida === parseInt(form.idSalida))
        // form.idSalida puede quedar con un id que ya no es una opción del selector
        // (salida que dejó de estar Programada mientras el formulario seguía
        // abierto) — sin esto, validarCampo('idSalida') lo pasaba igual por solo
        // mirar si hay algo puesto, no si sigue siendo una elección válida.
        if (form.idSalida && !rutaSel && !e.idSalida) {
            e.idSalida = 'Esta salida ya no está disponible — elige otra'
        }
        // Un viaje de regreso no transporta ventas nuevas — EXCEPTO para
        // operador_sede sobre el regreso de su propia sede (WS5, "Sedes
        // remotas"), mismo criterio que el filtro del selector en PasoEnvio.jsx
        // y la excepción simétrica del backend.
        const esRegresoDeSuSede = esOperadorSede && rutaSel?.idSalidaIda != null && rutaSel.origen === sedeMunicipio
        if (rutaSel && !e.idSalida && rutaSel.idSalidaIda != null && !esRegresoDeSuSede) {
            e.idSalida = 'Esta salida es un viaje de regreso — elige una salida de ida'
        }
        if (rutaSel && !e.idSalida && esOperadorSede && rutaSel.idSalidaIda == null) {
            e.idSalida = 'Elige un viaje de regreso de tu sede'
        }
        if (rutaSel && !e.idSalida && !rutaLlegaAlDestino(rutaSel, parseInt(form.idDestinoDestinatario) || null)) {
            e.idSalida = MENSAJE_RUTA_NO_LLEGA
        }
        if (rutaSel) {
            const erroresAsignacion = form.paquetes.map(p => {
                const err = validarCampoPaquete('idSalidaVehiculoConductor', p)
                return err ? { idSalidaVehiculoConductor: err } : {}
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
                const pesoUsadoOtras = Math.max(0, Number(par.pesoUsado || 0) - (pesoOriginalPorPar[par.idSalidaVehiculoConductor] || 0))
                const disponible = capacidad - pesoUsadoOtras
                const indices = form.paquetes
                    .map((p, i) => i)
                    .filter(i => parseInt(form.paquetes[i].idSalidaVehiculoConductor) === par.idSalidaVehiculoConductor)
                const pesoNuevo = indices.reduce((s, i) => s + (parseFloat(form.paquetes[i].peso) || 0), 0)
                if (pesoNuevo > disponible) {
                    const mensaje = `${par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((pesoNuevo - disponible).toFixed(2))} kg.`
                    indices.forEach(i => { erroresAsignacion[i] = { ...erroresAsignacion[i], idSalidaVehiculoConductor: mensaje } })
                }
            }

            if (erroresAsignacion.some(pe => Object.keys(pe).length > 0)) {
                e.paquetes = (e.paquetes || form.paquetes.map(() => ({}))).map((pe, i) => ({ ...pe, ...erroresAsignacion[i] }))
            }
        }
    }

    if (step === 3) {
        e.modalidadRecaudo = validarCampo('modalidadRecaudo', form, ventaOriginal)
    }

    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
