import { Box, Typography, TextField, Autocomplete, Chip } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import NacionSVG from '../../../../shared/components/NacionSVG.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { validarCampo } from '../../validations/salidaValidation.js'
import { getRutaLabel } from '../../../rutas/utils/rutaResolvers.js'

// Paso 1 del wizard de Salidas ("Ruta"): elige la plantilla reutilizable
// (origen→destino) sobre la que se agenda esta salida concreta. El destino
// final se muestra de solo lectura (viene de `rutaSeleccionada.destino`) —
// paradas, convoy y horario son propios de cada Salida y viven en pasos
// siguientes. Cuando se llega desde "Asignar salida" (Rutas), la plantilla ya
// viene preseleccionada — el usuario solo confirma.
const PasoRuta = ({
    theme, form, errores, setErrores, handleChange,
    rutas, rutaInput, setRutaInput, rutaSeleccionada,
    // esRegreso: viaje de vuelta — el selector de plantilla queda fijo (la Salida de
    // regreso siempre va hacia la sede base) — ver REGLA NUEVA en salidaProgramadaService.js.
    esRegreso = false,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <Box>
                {/* El origen no se edita: una salida normal siempre sale de Medellín; un
                    regreso sale del municipio donde terminó la ida (precargado). El
                    backend lo fuerza igual (resolverOrigenRuta en salidaProgramadaService.js). */}
                <FormField label="Origen" name="origen" value={form.origen}
                    disabled
                    required error={errores.origen}
                    helperText={errores.origen || (esRegreso ? 'Origen del regreso: donde terminó la salida de ida' : 'Toda salida sale de Medellín (oficina principal)')}
                    icon={RouteOutlinedIcon} inputProps={{ maxLength: 100 }} placeholder="Ej: Medellín" />
            </Box>
            <Box>
                {esRegreso ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight={600} color={theme.palette.text.secondary}>Ruta (plantilla) *</Typography>
                        {rutaSeleccionada ? (
                            <Chip
                                icon={<RouteOutlinedIcon sx={{ fontSize: 16 }} />}
                                label={getRutaLabel(rutaSeleccionada)}
                                sx={{ width: 'fit-content', fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker }}
                            />
                        ) : (
                            <Typography variant="body2" color="error">
                                No existe todavía una plantilla de ruta hacia la base — créala primero en Rutas.
                            </Typography>
                        )}
                        <Typography variant="caption" color={theme.palette.text.secondary}>
                            El regreso siempre vuelve a la base — la plantilla no se elige a mano.
                        </Typography>
                    </Box>
                ) : (
                    <Autocomplete
                        options={rutas}
                        popupIcon={<KeyboardArrowDownOutlinedIcon />}
                        getOptionLabel={(r) => getRutaLabel(r)}
                        isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
                        value={rutaSeleccionada}
                        inputValue={rutaInput}
                        onInputChange={(_, newVal, reason) => {
                            if (reason === 'input') setRutaInput(newVal)
                            else setRutaInput(newVal)
                        }}
                        onChange={(_, val) => handleChange({ target: { name: 'idRuta', value: val ? val.idRuta : '' } })}
                        onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form) }))}
                        renderOption={(props, r) => {
                            const { key, ...rest } = props
                            return (
                                <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <NacionSVG color={theme.palette.primary.main} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                        {getRutaLabel(r)}
                                    </Typography>
                                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                        {r.destino?.departamento || ''}
                                    </Typography>
                                </Box>
                            )
                        }}
                        filterOptions={(opts, { inputValue }) => {
                            if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                            const q = normalizarTexto(inputValue)
                            return opts.filter(r =>
                                normalizarTexto(r.destino?.municipio || '').includes(q) ||
                                normalizarTexto(r.destino?.departamento || '').includes(q)
                            )
                        }}
                        noOptionsText="No hay rutas (plantillas) habilitadas"
                        renderInput={(params) => (
                            <TextField {...params} label="Ruta (plantilla) *"
                                error={!!errores.idRuta} helperText={errores.idRuta || (rutaSeleccionada ? `Destino: ${rutaSeleccionada.destino?.municipio || '—'}` : 'Busca por nombre o destino')}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }} sx={formFieldStyles} />
                        )}
                    />
                )}
            </Box>
        </Box>

        {!esRegreso && rutas.length === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                    Todavía no hay ninguna plantilla de Ruta registrada — créala primero en el módulo Rutas.
                </Typography>
            </Box>
        )}
    </Box>
)

export default PasoRuta
