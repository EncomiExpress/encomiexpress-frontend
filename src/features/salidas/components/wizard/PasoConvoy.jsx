import { Box, Typography, TextField, Autocomplete, Avatar, Chip, Button, IconButton } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { MAX_PARES, validarPares } from '../../validations/salidaValidation.js'

// Paso "Vehículo y Conductor": el convoy de esta salida concreta — se elige
// después de fijar fecha/hora (para poder avisar de choques de disponibilidad
// ya con la fecha en mano).
const PasoConvoy = ({
    theme, form, errores, setErrores, handleParChange, handleAgregarPar, handleQuitarPar,
    // esRegreso: el convoy se muestra de solo lectura (chip, sin Autocomplete): el
    // backend rechaza (400) que un regreso mande un convoy distinto al de la ida —
    // ver REGLA NUEVA en salidaProgramadaService.js.
    esRegreso = false,
    vehiculos, conductores, vehiculosExcluidos, conductoresExcluidos,
    vehiculosOcupados = 0, conductoresOcupados = 0,
    vehiculosProyectadosFuera = 0, conductoresProyectadosFuera = 0,
    vehiculoInputs, setVehiculoInputs, conductorInputs, setConductorInputs,
    getVehiculoOpciones, getConductorOpciones,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {errores.pares && (
            <Typography variant="caption" color="error">{errores.pares}</Typography>
        )}
        {esRegreso ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                    Se devuelven los mismos vehículos y conductores de la ida — el backend rechaza un convoy distinto en un regreso.
                </Typography>
                {form.pares.map((par, index) => {
                    const vehiculoSel = vehiculos.find(v => v.idVehiculo === parseInt(par.idVehiculo))
                    const conductorSel = conductores.find(c => c.idConductor === parseInt(par.idConductor))
                    return (
                        <Chip
                            key={index}
                            icon={<PlacaDisplay placa={vehiculoSel?.placa} theme={theme} />}
                            label={`${vehiculoSel?.placa || 'Vehículo'} · ${conductorSel ? `${conductorSel.nombre} ${conductorSel.apellido}` : 'Conductor'}`}
                            sx={{ width: 'fit-content', fontWeight: 600, backgroundColor: theme.palette.background.subtle, border: `1px solid ${theme.palette.divider}` }}
                        />
                    )
                })}
            </Box>
        ) : (
            <>
            {(vehiculosExcluidos > 0 || conductoresExcluidos > 0 || vehiculosOcupados > 0 || conductoresOcupados > 0 || vehiculosProyectadosFuera > 0 || conductoresProyectadosFuera > 0) && (
                <Typography variant="caption" color={theme.palette.text.secondary}>
                    {[
                        vehiculosExcluidos > 0 && `${vehiculosExcluidos} vehículo${vehiculosExcluidos > 1 ? 's' : ''} oculto${vehiculosExcluidos > 1 ? 's' : ''} por documentos vencidos`,
                        conductoresExcluidos > 0 && `${conductoresExcluidos} conductor${conductoresExcluidos > 1 ? 'es' : ''} oculto${conductoresExcluidos > 1 ? 's' : ''} por licencia vencida`,
                        // Ya tienen otra salida programada/en ruta que choca con las fechas
                        // elegidas en el paso "Horario" (ver useDisponibilidadPares.js).
                        vehiculosOcupados > 0 && `${vehiculosOcupados} vehículo${vehiculosOcupados > 1 ? 's' : ''} oculto${vehiculosOcupados > 1 ? 's' : ''} por choque de horario`,
                        conductoresOcupados > 0 && `${conductoresOcupados} conductor${conductoresOcupados > 1 ? 'es' : ''} oculto${conductoresOcupados > 1 ? 's' : ''} por choque de horario`,
                        // No chocan de fecha, pero su última salida antes de esta no es un
                        // regreso -- van a seguir fuera de Medellín cuando esta arranque.
                        vehiculosProyectadosFuera > 0 && `${vehiculosProyectadosFuera} vehículo${vehiculosProyectadosFuera > 1 ? 's' : ''} oculto${vehiculosProyectadosFuera > 1 ? 's' : ''} porque van a quedar fuera de base`,
                        conductoresProyectadosFuera > 0 && `${conductoresProyectadosFuera} conductor${conductoresProyectadosFuera > 1 ? 'es' : ''} oculto${conductoresProyectadosFuera > 1 ? 's' : ''} porque van a quedar fuera de base`,
                    ].filter(Boolean).join(' · ')}
                </Typography>
            )}
            {form.pares.map((par, index) => {
                const opcionesVehiculo = getVehiculoOpciones(index)
                const opcionesConductor = getConductorOpciones(index)
                const vehiculoSel = opcionesVehiculo.find(v => v.idVehiculo === parseInt(par.idVehiculo)) || null
                const conductorSel = opcionesConductor.find(c => c.idConductor === parseInt(par.idConductor)) || null
                return (
                    <Box key={index} sx={{
                        display: 'flex', flexDirection: 'column', gap: 1.5,
                        p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.default,
                    }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: 1.5, alignItems: 'flex-start' }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ pt: 1.75, minWidth: 18 }}>
                                {index + 1}.
                            </Typography>
                            <Autocomplete
                                options={opcionesVehiculo}
                                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                getOptionLabel={(v) => `${v.placa} — ${v.marca} ${v.modelo}`}
                                isOptionEqualToValue={(opt, val) => opt.idVehiculo === val.idVehiculo}
                                value={vehiculoSel}
                                inputValue={vehiculoInputs[index] || ''}
                                onInputChange={(_, newVal, reason) => {
                                    const limpio = reason === 'input' ? newVal.replace(/[^a-zA-Z0-9\s\-_]/g, '') : newVal
                                    setVehiculoInputs(prev => prev.map((v, i) => i === index ? limpio : v))
                                }}
                                onChange={(_, val) => handleParChange(index, 'idVehiculo', val ? val.idVehiculo : '')}
                                onBlur={() => setErrores(prev => ({ ...prev, pares: validarPares(form.pares) }))}
                                renderOption={(props, v) => {
                                    const { key, ...rest } = props
                                    return (
                                        <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <PlacaDisplay placa={v.placa} theme={theme} />
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                {v.marca} {v.modelo}
                                            </Typography>
                                        </Box>
                                    )
                                }}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idVehiculo - a.idVehiculo).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(v =>
                                        normalizarTexto(v.placa).includes(q) ||
                                        normalizarTexto(v.marca || '').includes(q) ||
                                        normalizarTexto(v.modelo || '').includes(q)
                                    )
                                }}
                                noOptionsText="No se encontraron vehículos"
                                renderInput={(params) => (
                                    <TextField {...params} label="Vehículo *"
                                        helperText="Busca por placa, marca o modelo"
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 30 } }} sx={formFieldStyles} />
                                )}
                            />
                            <Autocomplete
                                options={opcionesConductor}
                                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                getOptionLabel={(c) => `${c.nombre} ${c.apellido}`}
                                isOptionEqualToValue={(opt, val) => opt.idConductor === val.idConductor}
                                value={conductorSel}
                                inputValue={conductorInputs[index] || ''}
                                onInputChange={(_, newVal, reason) => {
                                    const limpio = reason === 'input' ? newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, '') : newVal
                                    setConductorInputs(prev => prev.map((v, i) => i === index ? limpio : v))
                                }}
                                onChange={(_, val) => handleParChange(index, 'idConductor', val ? val.idConductor : '')}
                                onBlur={() => setErrores(prev => ({ ...prev, pares: validarPares(form.pares) }))}
                                renderOption={(props, c) => {
                                    const { key, ...rest } = props
                                    return (
                                        <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{
                                                width: 34, height: 34, flexShrink: 0,
                                                backgroundColor: theme.palette.avatarDefault.bg,
                                                color: theme.palette.avatarDefault.color,
                                                fontSize: '0.73rem', fontWeight: 700,
                                            }}>
                                                {c.nombre?.[0] || ''}{c.apellido?.[0] || ''}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                {c.nombre} {c.apellido}
                                            </Typography>
                                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                                {c.numeroIdentificacion}
                                            </Typography>
                                        </Box>
                                    )
                                }}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idConductor - a.idConductor).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(c =>
                                        normalizarTexto(c.nombre).includes(q) ||
                                        normalizarTexto(c.apellido).includes(q) ||
                                        normalizarTexto(`${c.nombre} ${c.apellido}`).includes(q) ||
                                        normalizarTexto(c.numeroIdentificacion || '').includes(q)
                                    )
                                }}
                                noOptionsText="No se encontraron conductores"
                                renderInput={(params) => (
                                    <TextField {...params} label="Conductor *"
                                        helperText="Busca por nombre, apellido o documento"
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }} sx={formFieldStyles} />
                                )}
                            />
                            <IconButton onClick={() => handleQuitarPar(index)}
                                disabled={form.pares.length === 1}
                                sx={{ visibility: form.pares.length === 1 ? 'hidden' : 'visible', mt: 1, color: theme.palette.neutral.main, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                )
            })}
            <Button
                onClick={handleAgregarPar}
                startIcon={<AddOutlinedIcon />}
                disabled={form.pares.length >= Math.min(MAX_PARES, vehiculos.length, conductores.length)}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
            >
                Agregar vehículo y conductor
            </Button>
            {form.pares.length >= Math.min(MAX_PARES, vehiculos.length, conductores.length) && (
                <Typography variant="caption" color={theme.palette.text.secondary}>
                    {form.pares.length >= MAX_PARES
                        ? `Llegaste al límite de vehículos y conductores (${MAX_PARES})`
                        : vehiculos.length <= conductores.length
                            ? 'No hay más vehículos disponibles para agregar'
                            : 'No hay más conductores disponibles para agregar'}
                </Typography>
            )}
            </>
        )}
    </Box>
)

export default PasoConvoy
