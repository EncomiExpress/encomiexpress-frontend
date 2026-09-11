// Catálogo geográfico de Colombia para el selector Departamento → Municipio de
// Destino. Es la ÚNICA llamada del frontend a un servicio externo (no al backend
// de EncomiExpress) — se decidió usar la API en vivo (https://api-colombia.com) en
// vez de congelar un JSON local: el módulo de Destinos se usa poco (se registran una
// vez y casi no cambian), así que el volumen de solicitudes es bajo y no hay riesgo
// real de chocar con el límite de 60 solicitudes/minuto por IP que impone la API.
//
// Los resultados se cachean en memoria (por pestaña/sesión, se pierde al recargar):
// los departamentos no cambian nunca dentro de una sesión de uso, y los municipios de
// un departamento ya consultado tampoco — así que un segundo Registrar/Actualizar
// Destino en la misma sesión no vuelve a pedirlos.
const BASE_URL = 'https://api-colombia.com/api/v1'

let departamentosPromise = null
const municipiosPorDepartamento = new Map()

const mapearYOrdenar = (lista) =>
    lista
        .map((r) => ({ id: r.id, nombre: r.name }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

export const getDepartamentosColombia = () => {
    if (!departamentosPromise) {
        departamentosPromise = fetch(`${BASE_URL}/Department`)
            .then((res) => {
                if (!res.ok) throw new Error('No se pudo cargar el listado de departamentos.')
                return res.json()
            })
            .then(mapearYOrdenar)
            .catch((err) => {
                // Sin esto, un fallo de red deja la promesa cacheada en rechazado para
                // siempre — "Reintentar" no volvería a intentar nada.
                departamentosPromise = null
                throw err
            })
    }
    return departamentosPromise
}

export const getMunicipiosColombia = (idDepartamento) => {
    if (!municipiosPorDepartamento.has(idDepartamento)) {
        const promesa = fetch(`${BASE_URL}/Department/${idDepartamento}/cities`)
            .then((res) => {
                if (!res.ok) throw new Error('No se pudo cargar el listado de municipios.')
                return res.json()
            })
            .then(mapearYOrdenar)
            .catch((err) => {
                municipiosPorDepartamento.delete(idDepartamento)
                throw err
            })
        municipiosPorDepartamento.set(idDepartamento, promesa)
    }
    return municipiosPorDepartamento.get(idDepartamento)
}
