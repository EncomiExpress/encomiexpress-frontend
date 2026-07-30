// Replica en el frontend el mismo criterio que usa el backend para bloquear la
// asignación de un vehículo/conductor a una ruta (rutaService.js validarDocumentosVehiculo
// y src/utils/licenciaHelper.js tieneLicenciaVigente) — así el select de Rutas puede
// excluir de una vez a quien de todas formas el backend va a rechazar, en vez de dejar
// elegirlo y que el error aparezca recién al intentar guardar.

const DOCUMENTOS_VEHICULO = [
    { campo: 'vencimientoSOAT', nombre: 'SOAT' },
    { campo: 'vencimientoRevisionTecnica', nombre: 'Revisión Técnico-Mecánica' },
    { campo: 'vencimientoSeguroTerceros', nombre: 'Seguro de Terceros' },
]

// "valor" es un DATEONLY del backend ("YYYY-MM-DD") — new Date(valor) lo interpreta como
// medianoche UTC, no medianoche local, y en Colombia (UTC-5) eso corre el punto de corte
// varias horas hacia atrás (mismo bug ya corregido en isVencido/mananaISO/hoyISO). Se arma
// la fecha con componentes locales para comparar por día calendario real.
const aFechaLocal = (valor) => {
    const [y, m, d] = valor.split('-').map(Number)
    return new Date(y, m - 1, d)
}

// Nombre del primer documento vencido de un vehículo, o null si todos están vigentes
// (o sin fecha registrada — igual que el backend, la ausencia de dato no bloquea).
export const getDocumentoVehiculoVencido = (vehiculo) => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    for (const { campo, nombre } of DOCUMENTOS_VEHICULO) {
        const valor = vehiculo?.[campo]
        if (!valor) continue
        if (aFechaLocal(valor) <= hoy) return nombre
    }
    return null
}

export const vehiculoDocumentosVigentes = (vehiculo) => getDocumentoVehiculoVencido(vehiculo) === null

// Un conductor sin categorías registradas no se bloquea (falta de dato, no vencimiento).
// Con categorías registradas, basta con que UNA esté vigente.
export const conductorLicenciaVigente = (categoriasLicencia) => {
    if (!categoriasLicencia || categoriasLicencia.length === 0) return true
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return categoriasLicencia.some((c) => {
        if (!c.vencimiento) return false
        return aFechaLocal(c.vencimiento) > hoy
    })
}
