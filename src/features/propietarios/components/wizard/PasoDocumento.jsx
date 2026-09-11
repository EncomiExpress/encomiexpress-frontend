import { useState } from 'react'
import { Box, TextField, MenuItem, InputAdornment, Autocomplete, Typography, Avatar } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { validarCampo, validarDocumentoCompleto, getMaxLengthDoc, docHelperText } from '../../validations/propietarioValidation.js'

const etiquetaConductor = (c) => `${c.nombre} ${c.apellido} — ${c.numeroIdentificacion}`

// Atajo "¿también es conductor?": busca entre los Conductores ya registrados y, al
// elegir uno, copia sus datos hacia el formulario (ver handleAutocompletarDesdeConductor
// en RegistrarPropietario.jsx). No es un campo del formulario -- por eso siempre queda
// en blanco después de elegir (`value={null}`, se resetea la búsqueda), en vez de
// mostrar "seleccionado" como el Autocomplete de Propietario en el wizard de Vehículo:
// Propietario no guarda ningún vínculo con el Conductor de origen, es solo un ahorro
// de tecleo al registrar.
const BuscarConductor = ({ conductores, onSeleccionar }) => {
    const [busqueda, setBusqueda] = useState('')
    return (
        <Autocomplete
            options={(conductores || []).filter(c => c.habilitado !== false)}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            getOptionLabel={etiquetaConductor}
            value={null}
            inputValue={busqueda}
            onInputChange={(_, newVal, reason) => {
                setBusqueda(reason === 'input' ? newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, '') : '')
            }}
            onChange={(_, val) => {
                setBusqueda('')
                if (val) onSeleccionar(val)
            }}
            renderOption={(props, c) => {
                const { key, ...rest } = props
                return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, flexShrink: 0, backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.73rem', fontWeight: 700 }}>
                            {(c.nombre?.[0] || '').toUpperCase()}{(c.apellido?.[0] || '').toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                            {c.nombre} {c.apellido}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {c.numeroIdentificacion}
                        </Typography>
                    </Box>
                )
            }}
            filterOptions={(opts, { inputValue }) => {
                if (!inputValue.trim()) return []
                const q = normalizarTexto(inputValue)
                return opts.filter(c =>
                    normalizarTexto(c.nombre).includes(q) ||
                    normalizarTexto(c.apellido).includes(q) ||
                    normalizarTexto(`${c.nombre} ${c.apellido}`).includes(q) ||
                    normalizarTexto(c.numeroIdentificacion || '').includes(q)
                )
            }}
            noOptionsText={busqueda.trim() ? 'No se encontraron conductores' : 'Escribe un nombre, apellido o documento'}
            renderInput={(params) => (
                <TextField {...params} label="¿Este propietario también es conductor? Búscalo aquí"
                    placeholder="Opcional — autocompleta documento, nombre y contacto"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={formFieldStyles} />
            )}
        />
    )
}

const PasoDocumento = ({
    form, errores, setErrores, handleChange, verificarDocumentoDuplicado, verificarNombreDuplicado,
    conductores, onSeleccionarConductor,
}) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <Box sx={{ gridColumn: '1 / -1' }}>
            <BuscarConductor conductores={conductores} onSeleccionar={onSeleccionarConductor} />
        </Box>
        <TextField fullWidth select label="Tipo de documento *" name="tipoIdentificacion"
            value={form.tipoIdentificacion} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacion: validarCampo('tipoIdentificacion', form) }))}
            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                select: { IconComponent: KeyboardArrowDownOutlinedIcon },
            }}
            sx={formFieldStyles}>
            {/* Sin TI/RC: heredar un vehículo siendo menor es un caso extremo, se opta
            por mantener el formulario limpio -- ver LOGICA.md ("Tipos de documento por
            módulo"). */}
            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
            <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
            <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
            <MenuItem value="PAS">Pasaporte</MenuItem>
        </TextField>
        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
            onChange={handleChange}
            onBlur={() => {
                verificarDocumentoDuplicado()
                setErrores(prev => ({ ...prev, numeroIdentificacion: validarDocumentoCompleto(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
            }}
            required error={errores.numeroIdentificacion}
            helperText={errores.numeroIdentificacion || docHelperText(form.tipoIdentificacion)} icon={BadgeOutlinedIcon}
            inputProps={{ maxLength: getMaxLengthDoc(form.tipoIdentificacion) }} />
        <FormField
            label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombres'}
            name="nombre" value={form.nombre} onChange={handleChange}
            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form) })) }}
            required error={errores.nombre} helperText={errores.nombre}
            icon={form.tipoIdentificacion === 'NIT' ? BusinessOutlinedIcon : PersonOutlinedIcon}
            inputProps={{ maxLength: 50 }}
            placeholder={form.tipoIdentificacion === 'NIT' ? 'Ej: Transportes XYZ S.A.S' : 'Ej: Carlos'} />
        {form.tipoIdentificacion !== 'NIT' && (
            <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form) })) }}
                required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
                inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
        )}
    </Box>
)

export default PasoDocumento
