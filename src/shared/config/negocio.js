import { normalizarTexto } from '../utils/duplicados.js'

// Constantes de negocio transversales del frontend.
//
// MUNICIPIO_ORIGEN: municipio de la oficina principal, origen de TODA ruta de ida y
// de toda venta. El backend fuerza este mismo valor en rutaService.resolverOrigenRuta
// (ver LOGICA.md, "Rutas — origen bloqueado"). No es una fila de `destino` por diseño,
// pero puede existir una fila `destino` "Medellín" en la BD real — y una venta nunca
// debe ir dirigida a ella.
export const MUNICIPIO_ORIGEN = 'Medellín'

// true si `municipio` es el municipio de origen (insensible a tildes/mayúsculas).
export const esMunicipioOrigen = (municipio) =>
    normalizarTexto(municipio) === normalizarTexto(MUNICIPIO_ORIGEN)
