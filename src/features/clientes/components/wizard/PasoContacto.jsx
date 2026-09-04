import { Box, Typography, TextField, Autocomplete } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import NacionSVG from '../../../../shared/components/NacionSVG.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { validarCampo } from '../../validations/clienteValidation.js'

const PasoContacto = ({ theme, form, errores, setErrores, handleChange, destinos, destinoInput, setDestinoInput, clienteOriginal }) => {
    // Si el municipio ya asignado a este cliente fue inhabilitado después de
    // registrarlo, no aparece en `destinos` (solo trae habilitados) — se usa el
    // dato que ya trae el cliente como respaldo, mismo patrón que Rutas.
    const destinoSeleccionado = destinos?.find(d => d.idDestino === parseInt(form.idDestino)) || (
        clienteOriginal?.destino && parseInt(form.idDestino) === clienteOriginal.idDestino
            ? clienteOriginal.destino
            : null
    )
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form) }))}
                required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
                icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} />
            <FormField label="Correo electrónico" name="email" value={form.email}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, email: validarCampo('email', form) }))}
                required error={errores.email} helperText={errores.email}
                icon={EmailOutlinedIcon} placeholder="correo@dominio.com"
                inputProps={{ maxLength: 100 }} />
            <FormField label="Dirección" name="direccion" value={form.direccion}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, direccion: validarCampo('direccion', form) }))} required error={errores.direccion}
                placeholder="Ej: Calle 45 #20-10"
                helperText={errores.direccion || `${form.direccion.length}/200`} icon={HomeOutlinedIcon}
                inputProps={{ maxLength: 200 }} />
            <Autocomplete
                options={destinos || []}
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
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>{d.ciudad}</Typography>
                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>{d.departamento}</Typography>
                        </Box>
                    )
                }}
                filterOptions={(opts, { inputValue }) => {
                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idDestino - a.idDestino).slice(0, 5)
                    const q = normalizarTexto(inputValue)
                    return opts.filter(d => normalizarTexto(d.ciudad || '').includes(q) || normalizarTexto(d.departamento || '').includes(q))
                }}
                noOptionsText="No se encontraron destinos"
                renderInput={(params) => (
                    <TextField {...params} label="Municipio *"
                        error={!!errores.idDestino}
                        helperText={errores.idDestino || 'A dónde se devuelve un paquete si el destinatario nunca lo recoge'}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }} sx={formFieldStyles} />
                )}
            />
        </Box>
    )
}

export default PasoContacto
