import { Box, Typography, TextField, Autocomplete, Avatar, Chip, Button, IconButton } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import NacionSVG from '../../../../shared/components/NacionSVG.jsx'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { MAX_PARES, MAX_PARADAS, validarPares, validarParadas } from '../../validations/salidaValidation.js'

// Paso "Vehículo y Conductor": el convoy de esta salida concreta — se elige
// después de fijar fecha/hora (para poder avisar de choques de disponibilidad
// ya con la fecha en mano). Cada fila de par trae, debajo de sus dos
// Autocompletes, su PROPIO mini-editor de paradas (agregar/quitar/reordenar
// destinos) -- ya no hay un paso "Paradas" separado y global: desde que el
// backend pasó a guardar las paradas por PAR (dos vehículos de un mismo convoy
// pueden tomar recorridos distintos, "ruta fraccionada"), pedirlas todas juntas
// en un único paso ya no tenía sentido.
const PasoConvoy = ({
    theme, form, errores, setErrores, handleParChange, handleAgregarPar, handleQuitarPar,
    // esRegreso: el convoy se muestra de solo lectura (chip, sin Autocomplete): el
    // backend rechaza (400) que un regreso mande un convoy distinto al de la ida —
    // ver REGLA NUEVA en salidaProgramadaService.js. Las paradas de cada par
    // también se heredan automáticamente de la ida (invertidas) y se muestran acá
    // como texto de solo lectura, nunca como Autocompletes editables.
    esRegreso = false,
    vehiculos, conductores, vehiculosExcluidos, conductoresExcluidos,
    vehiculoInputs, setVehiculoInputs, conductorInputs, setConductorInputs,
    getVehiculoOpciones, getConductorOpciones,
    // Paradas por par -- paradaInputsPorPar[i] es el array de textos visibles de los
    // Autocompletes de paradas del par i (mismo patrón que vehiculoInputs/conductorInputs).
    paradaInputsPorPar, setParadaInputsPorPar,
    handleParadaChange, handleAgregarParada, handleQuitarParada, handleMoverParada,
    getParadaOpciones, destinosSeleccionablesCount = 0,
    // Sugerencia de paradas (useSugerenciaParadas) -- se ofrece solo para el PRIMER
    // par por simplicidad (ver decisión documentada en RegistrarSalidaProgramada.jsx):
    // no hay un criterio de negocio claro para "a cuál par le sugiero las paradas
    // comunes" cuando hay varios, y el primero es el caso de uso dominante (un solo
    // vehículo en el convoy).
    sugerenciaParadas, onUsarSugerenciaParadas,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {errores.pares && (
            <Typography variant="caption" color="error">{errores.pares}</Typography>
        )}
        {esRegreso ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                    Se devuelven los mismos vehículos, conductores y paradas (en orden inverso) de la ida — el backend rechaza un convoy o recorrido distinto en un regreso.
                </Typography>
                {form.pares.map((par, index) => {
                    const vehiculoSel = vehiculos.find(v => v.idVehiculo === parseInt(par.idVehiculo))
                    const conductorSel = conductores.find(c => c.idConductor === parseInt(par.idConductor))
                    const paradas = par.paradas || []
                    return (
                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Chip
                                icon={<PlacaDisplay placa={vehiculoSel?.placa} theme={theme} />}
                                label={`${vehiculoSel?.placa || 'Vehículo'} · ${conductorSel ? `${conductorSel.nombre} ${conductorSel.apellido}` : 'Conductor'}`}
                                sx={{ width: 'fit-content', fontWeight: 600, backgroundColor: theme.palette.background.subtle, border: `1px solid ${theme.palette.divider}` }}
                            />
                            {paradas.length > 0 && (
                                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ pl: 1 }}>
                                    Paradas: {paradas.map(p => p.municipio).filter(Boolean).join(' → ')}
                                </Typography>
                            )}
                        </Box>
                    )
                })}
            </Box>
        ) : (
            <>
            {(vehiculosExcluidos > 0 || conductoresExcluidos > 0) && (
                <Typography variant="caption" color={theme.palette.text.secondary}>
                    {vehiculosExcluidos > 0 && `${vehiculosExcluidos} vehículo${vehiculosExcluidos > 1 ? 's' : ''} oculto${vehiculosExcluidos > 1 ? 's' : ''} por documentos vencidos`}
                    {vehiculosExcluidos > 0 && conductoresExcluidos > 0 && ' · '}
                    {conductoresExcluidos > 0 && `${conductoresExcluidos} conductor${conductoresExcluidos > 1 ? 'es' : ''} oculto${conductoresExcluidos > 1 ? 's' : ''} por licencia vencida`}
                </Typography>
            )}
            {form.pares.map((par, index) => {
                const opcionesVehiculo = getVehiculoOpciones(index)
                const opcionesConductor = getConductorOpciones(index)
                const vehiculoSel = opcionesVehiculo.find(v => v.idVehiculo === parseInt(par.idVehiculo)) || null
                const conductorSel = opcionesConductor.find(c => c.idConductor === parseInt(par.idConductor)) || null
                const paradas = par.paradas || []
                const paradaInputs = paradaInputsPorPar[index] || []
                const errorParadas = errores.paradasPorPar?.[index]
                const techoParadas = Math.min(MAX_PARADAS, destinosSeleccionablesCount)
                const alTopeParadas = paradas.length >= techoParadas
                const mostrarSugerencia = index === 0 && sugerenciaParadas
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
                                sx={{ visibility: form.pares.length === 1 ? 'hidden' : 'visible', mt: 1 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Mini-editor de paradas propio de ESTE par -- mismo comportamiento que
                            tenía el viejo paso "Paradas" global, repetido por fila. */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 3.5 }}>
                            <Typography variant="caption" color={theme.palette.text.secondary}>
                                Paradas del recorrido de este vehículo (opcional)
                            </Typography>
                            {errorParadas && (
                                <Typography variant="caption" color="error">{errorParadas}</Typography>
                            )}
                            {mostrarSugerencia && (
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap',
                                    p: 1.25, borderRadius: 2,
                                    backgroundColor: theme.palette.primary.light, border: `1px solid ${theme.palette.primary.light}`,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <LightbulbOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.darker, mt: '1px', flexShrink: 0 }} />
                                        <Typography variant="body2" color={theme.palette.primary.darker}>
                                            La mayoría de tus salidas hacia este destino pasan por: {sugerenciaParadas.municipios.join(' → ')}
                                        </Typography>
                                    </Box>
                                    <Button size="small" onClick={onUsarSugerenciaParadas}
                                        sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0, color: theme.palette.primary.darker }}>
                                        Usar esta configuración
                                    </Button>
                                </Box>
                            )}
                            {paradas.map((parada, paradaIndex) => {
                                const opcionesParada = getParadaOpciones(index, paradaIndex)
                                const paradaSeleccionada = opcionesParada.find(d => d.idDestino === parseInt(parada.idDestino)) || null
                                return (
                                    <Box key={paradaIndex} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Typography variant="body2" color={theme.palette.text.secondary} sx={{ pt: 1.75, minWidth: 18 }}>
                                            {paradaIndex + 1}.
                                        </Typography>
                                        <Autocomplete
                                            sx={{ flex: 1 }}
                                            options={opcionesParada}
                                            popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                            getOptionLabel={(d) => `${d.municipio} - ${d.departamento}`}
                                            isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                                            value={paradaSeleccionada}
                                            inputValue={paradaInputs[paradaIndex] || ''}
                                            onInputChange={(_, newVal, reason) => {
                                                const limpio = reason === 'input' ? newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '') : newVal
                                                setParadaInputsPorPar(prev => prev.map((arr, i) => i === index ? arr.map((v, j) => j === paradaIndex ? limpio : v) : arr))
                                            }}
                                            onChange={(_, val) => handleParadaChange(index, paradaIndex, val ? val.idDestino : '')}
                                            onBlur={() => setErrores(prev => ({
                                                ...prev,
                                                paradasPorPar: (prev.paradasPorPar || form.pares.map(() => '')).map((e, i) => i === index ? validarParadas(paradas) : e),
                                            }))}
                                            renderOption={(props, d) => {
                                                const { key, ...rest } = props
                                                return (
                                                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <NacionSVG color={theme.palette.primary.main} />
                                                        </Box>
                                                        <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>{d.municipio}</Typography>
                                                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>{d.departamento}</Typography>
                                                    </Box>
                                                )
                                            }}
                                            filterOptions={(opts, { inputValue }) => {
                                                if (!inputValue.trim()) return [...opts].sort((a, b) => b.idDestino - a.idDestino).slice(0, 5)
                                                const q = normalizarTexto(inputValue)
                                                return opts.filter(d => normalizarTexto(d.municipio || '').includes(q) || normalizarTexto(d.departamento || '').includes(q))
                                            }}
                                            noOptionsText="No se encontraron destinos"
                                            renderInput={(params) => (
                                                <TextField {...params} label={`Parada ${paradaIndex + 1}`}
                                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }} sx={formFieldStyles} />
                                            )}
                                        />
                                        <IconButton size="small" onClick={() => handleMoverParada(index, paradaIndex, -1)} disabled={paradaIndex === 0} sx={{ mt: 1 }}>
                                            <KeyboardArrowUpOutlinedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleMoverParada(index, paradaIndex, 1)} disabled={paradaIndex === paradas.length - 1} sx={{ mt: 1 }}>
                                            <KeyboardArrowDownOutlinedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleQuitarParada(index, paradaIndex)} sx={{ mt: 1 }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )
                            })}
                            <Button
                                onClick={() => handleAgregarParada(index)}
                                startIcon={<AddOutlinedIcon />}
                                disabled={alTopeParadas}
                                size="small"
                                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                            >
                                Agregar parada
                            </Button>
                            {alTopeParadas && (
                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                    {paradas.length >= MAX_PARADAS
                                        ? `Llegaste al límite de paradas de este vehículo (${MAX_PARADAS})`
                                        : 'No hay más municipios disponibles para agregar'}
                                </Typography>
                            )}
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
