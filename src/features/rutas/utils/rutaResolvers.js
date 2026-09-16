import { MUNICIPIO_ORIGEN } from '../../../shared/config/negocio.js'

// Una Ruta (plantilla) no tiene nombre propio -- se identifica por su corredor,
// igual que antes de la migración Ruta/SalidaProgramada: "Medellín -> Destino".
// Toda ruta normal sale de la base (MUNICIPIO_ORIGEN); la única excepción es la
// plantilla auto-generada "hacia Medellín" que reutilizan los regresos (su
// destino ES Medellín) -- ahí el corredor de todos modos sigue siendo válido de
// mostrar tal cual, no hace falta un caso especial.
export const getRutaLabel = (ruta) =>
    ruta?.destino?.municipio ? `${MUNICIPIO_ORIGEN} → ${ruta.destino.municipio}` : (ruta ? `Ruta #${ruta.idRuta}` : '—')
