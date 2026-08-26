import { Box, MenuItem, Typography, TextField, Autocomplete, Avatar } from '@mui/material'
import { EventOutlined, DescriptionOutlined, KeyboardArrowDownOutlined } from '@mui/icons-material'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { validarCampo } from '../../utils/vehiculoValidation.js'

const PasoPropietarioDocumentacion = ({ theme, formData, errores, setErrores, handleChange, propietarios, validationOpts, minFecha }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <Autocomplete
            options={propietarios.filter(p => p.habilitado !== false)}
            popupIcon={<KeyboardArrowDownOutlined />}
            getOptionLabel={(p) => `${p.nombre} ${p.apellido} — ${p.numeroIdentificacion}`}
            isOptionEqualToValue={(opt, val) => opt.idPropietario === val.idPropietario}
            value={propietarios.find(p => p.idPropietario === formData.idPropietario) || null}
            onChange={(_, val) => handleChange({ target: { name: 'idPropietario', value: val ? val.idPropietario : '' } })}
            onBlur={() => setErrores(prev => ({ ...prev, idPropietario: validarCampo('idPropietario', formData, validationOpts) }))}
            renderOption={(props, p) => {
                const { key, ...rest } = props
                return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                            width: 34, height: 34, flexShrink: 0,
                            backgroundColor: theme.palette.avatarDefault.bg,
                            color: theme.palette.avatarDefault.color,
                            fontSize: '0.73rem', fontWeight: 700,
                        }}>
                            {(p.nombre?.[0] || '').toUpperCase()}{(p.apellido?.[0] || '').toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                            {p.nombre} {p.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                            {p.numeroIdentificacion}
                        </Typography>
                    </Box>
                )
            }}
            filterOptions={(opts, { inputValue }) => {
                if (!inputValue.trim()) {
                    return [...opts].sort((a, b) => b.idPropietario - a.idPropietario).slice(0, 5)
                }
                const q = normalizarTexto(inputValue)
                return opts.filter(p =>
                    normalizarTexto(p.nombre).includes(q) ||
                    normalizarTexto(p.apellido).includes(q) ||
                    normalizarTexto(`${p.nombre} ${p.apellido}`).includes(q) ||
                    normalizarTexto(p.numeroIdentificacion || '').includes(q) ||
                    normalizarTexto(p.telefono || '').includes(q)
                )
            }}
            noOptionsText="No se encontraron propietarios"
            renderInput={(params) => (
                <TextField {...params} label="Propietario *"
                    error={!!errores.idPropietario} helperText={errores.idPropietario || 'Busca por documento, nombre, apellido o teléfono'}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }}
                    sx={formFieldStyles} />
            )}
        />
        <FormField label="Tarjeta de propiedad" name="tarjetaPropiedad" value={formData.tarjetaPropiedad}
            onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, tarjetaPropiedad: validarCampo('tarjetaPropiedad', formData, validationOpts) }))}
            icon={DescriptionOutlined}
            inputProps={{ maxLength: 11 }} placeholder="Ej: 12345678901"
            error={errores.tarjetaPropiedad} helperText={errores.tarjetaPropiedad || 'Opcional · solo números, entre 6 y 11 dígitos'} />
        <FormSelect label="Origen" name="origen" value={formData.origen} onChange={handleChange} required>
            <MenuItem value="Propio">Propio</MenuItem>
            <MenuItem value="Tercerizado">Tercerizado</MenuItem>
        </FormSelect>
        <FormField label="Vencimiento SOAT" name="vencimientoSOAT" type="date"
            value={formData.vencimientoSOAT} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, vencimientoSOAT: validarCampo('vencimientoSOAT', formData, validationOpts) }))} required icon={EventOutlined}
            inputProps={minFecha ? { min: minFecha } : undefined}
            error={errores.vencimientoSOAT} helperText={errores.vencimientoSOAT} />
        <FormField label="Vencimiento Revisión Técnica" name="vencimientoRevisionTecnica" type="date"
            value={formData.vencimientoRevisionTecnica} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, vencimientoRevisionTecnica: validarCampo('vencimientoRevisionTecnica', formData, validationOpts) }))} required icon={EventOutlined}
            inputProps={minFecha ? { min: minFecha } : undefined}
            error={errores.vencimientoRevisionTecnica} helperText={errores.vencimientoRevisionTecnica} />
        <FormField label="Vencimiento Seguro de Terceros" name="vencimientoSeguroTerceros" type="date"
            value={formData.vencimientoSeguroTerceros} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, vencimientoSeguroTerceros: validarCampo('vencimientoSeguroTerceros', formData, validationOpts) }))} required icon={EventOutlined}
            inputProps={minFecha ? { min: minFecha } : undefined}
            error={errores.vencimientoSeguroTerceros} helperText={errores.vencimientoSeguroTerceros} />
    </Box>
)

export default PasoPropietarioDocumentacion
