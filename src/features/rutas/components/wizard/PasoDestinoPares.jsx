import { Box, Typography, TextField, Autocomplete, Avatar } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Button, IconButton } from '@mui/material'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import NacionSVG from '../../../../shared/components/NacionSVG.jsx'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { MAX_PARES, validarCampo, validarPares } from '../../utils/rutaValidation.js'

const PasoDestinoPares = ({
    theme, form, errores, setErrores, handleChange, handleParChange, handleAgregarPar, handleQuitarPar,
    destinos, destinoInput, setDestinoInput, destinoSeleccionado,
    vehiculos, conductores, vehiculosExcluidos, conductoresExcluidos,
    vehiculoInputs, setVehiculoInputs, conductorInputs, setConductorInputs,
    getVehiculoOpciones, getConductorOpciones,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField label="Origen" name="origen" value={form.origen}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, origen: validarCampo('origen', form) }))}
                required error={errores.origen} helperText={errores.origen}
                icon={RouteOutlinedIcon} inputProps={{ maxLength: 100 }} placeholder="Ej: Medellín" />
            <Autocomplete
                options={destinos}
                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                getOptionLabel={(d) => `${d.ciudad} - ${d.departamento}`}
                isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                value={destinoSeleccionado}
                inputValue={destinoInput}
                onInputChange={(_, newVal, reason) => {
                    if (reason === 'input') setDestinoInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
                    else setDestinoInput(newVal)
                }}
                onChange={(_, val) => handleChange({ target: { name: 'idDestino', value: val ? val.idDestino : '' } })}
                onBlur={() => setErrores(prev => ({ ...prev, idDestino: validarCampo('idDestino', form) }))}
                renderOption={(props, d) => {
                    const { key, ...rest } = props
                    return (
                        <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NacionSVG color={theme.palette.primary.main} />
                            </Box>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                {d.ciudad}
                            </Typography>
                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                {d.departamento}
                            </Typography>
                        </Box>
                    )
                }}
                filterOptions={(opts, { inputValue }) => {
                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idDestino - a.idDestino).slice(0, 5)
                    const q = normalizarTexto(inputValue)
                    return opts.filter(d =>
                        normalizarTexto(d.nombre || '').includes(q) ||
                        normalizarTexto(d.ciudad || '').includes(q) ||
                        normalizarTexto(d.departamento || '').includes(q)
                    )
                }}
                noOptionsText="No se encontraron destinos"
                renderInput={(params) => (
                    <TextField {...params} label="Destino *"
                        error={!!errores.idDestino} helperText={errores.idDestino || 'Busca por nombre, ciudad o departamento'}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }} sx={formFieldStyles} />
                )}
            />
        </Box>

        <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
            Vehículos y conductores de esta ruta
        </Typography>
        {errores.pares && (
            <Typography variant="caption" color="error" sx={{ mt: -1.5 }}>{errores.pares}</Typography>
        )}
        {(vehiculosExcluidos > 0 || conductoresExcluidos > 0) && (
            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mt: -1.5 }}>
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
            return (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1.5, alignItems: 'flex-start' }}>
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
    </Box>
)

export default PasoDestinoPares
