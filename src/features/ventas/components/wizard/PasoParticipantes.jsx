import { Box, Typography, Paper, Divider, Avatar, TextField, MenuItem, InputAdornment, Autocomplete } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import NacionSVG from '../../../../shared/components/NacionSVG.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import {
    validarCampo, OPCION_CLIENTE_NUEVO,
    getMaxLengthDocDestinatario, docHelperTextDestinatario, validarDocumentoDestinatarioCompleto,
} from '../../validations/validacion.js'

/**
 * Paso 1 del wizard: elegir el cliente remitente y capturar los datos del destinatario.
 * `onNuevoCliente` es opcional — solo lo pasa el modo registrar, y habilita la opción
 * "Registrar nuevo cliente" al final de las sugerencias. `setSinCambios` y `ventaOriginal`
 * son opcionales y solo los pasa el modo edición. `destinos` es el catálogo de municipios
 * (mismo que usa Rutas) para elegir a dónde se envía el paquete — una decisión comercial,
 * independiente de qué Ruta administrativa se le termine asignando en el paso "Envío".
 */
export default function PasoParticipantes({
    theme, clientes, clienteSeleccionado, clienteInput, setClienteInput,
    form, setForm, errores, setErrores, handleChange, onNuevoCliente, setSinCambios, ventaOriginal,
    destinos, destinoDestinatarioInput, setDestinoDestinatarioInput,
}) {
    // Si el destino de este destinatario ya fue inhabilitado desde que se registró la
    // venta, no aparece en `destinos` (solo trae habilitados) — se usa el dato que ya
    // trae la propia venta como respaldo sintético, para que el campo nunca se vea vacío.
    const destinoDestinatarioSeleccionado = destinos.find(d => d.idDestino === parseInt(form.idDestinoDestinatario)) || (
        ventaOriginal?.destinatario?.destino && parseInt(form.idDestinoDestinatario) === ventaOriginal.destinatario.idDestino
            ? ventaOriginal.destinatario.destino
            : null
    )
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Remitente */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: theme.palette.text.primary }}>
                    Remitente
                </Typography>
                <Autocomplete
                    popupIcon={<KeyboardArrowDownOutlinedIcon />}
                    options={clientes.filter(c => c.habilitado)}
                    getOptionLabel={(option) => {
                        if (option.esNuevo) return ''
                        const nombre = option.apellido ? `${option.nombre} ${option.apellido}` : option.nombre
                        return `${nombre} — ${option.numeroIdentificacion}`
                    }}
                    isOptionEqualToValue={(opt, val) => opt.idCliente === val.idCliente}
                    filterOptions={(opts, { inputValue }) => {
                        const base = !inputValue.trim()
                            ? [...opts].sort((a, b) => b.idCliente - a.idCliente).slice(0, 5)
                            : opts.filter(c => {
                                const q = normalizarTexto(inputValue)
                                return normalizarTexto(c.nombre || '').includes(q) ||
                                    normalizarTexto(c.apellido || '').includes(q) ||
                                    normalizarTexto(c.numeroIdentificacion || '').includes(q)
                            })
                        return onNuevoCliente ? [...base, OPCION_CLIENTE_NUEVO] : base
                    }}
                    value={clienteSeleccionado || null}
                    inputValue={clienteInput}
                    onInputChange={(_, val, reason) => {
                        if (reason === 'input') {
                            setClienteInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, ''))
                        } else if (reason === 'reset') {
                            setClienteInput(val)
                        } else if (reason === 'clear') {
                            setClienteInput('')
                        }
                    }}
                    onChange={(_, newValue) => {
                        if (newValue?.esNuevo) {
                            onNuevoCliente()
                            return
                        }
                        setForm(prev => ({ ...prev, idCliente: newValue ? newValue.idCliente : '' }))
                        setErrores(prev => newValue
                            ? { ...prev, idCliente: '' }
                            : (prev.idCliente ? { ...prev, idCliente: validarCampo('idCliente', { idCliente: '' }, ventaOriginal) } : prev))
                        setSinCambios?.(false)
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, idCliente: validarCampo('idCliente', form, ventaOriginal) }))}
                    renderOption={(props, option) => {
                        const { key, ...rest } = props
                        if (option.esNuevo) {
                            return (
                                <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                                    <Box sx={{
                                        width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: theme.palette.primary.activeBg, color: theme.palette.primary.main,
                                    }}>
                                        <AddOutlinedIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                                        Registrar nuevo cliente
                                    </Typography>
                                </Box>
                            )
                        }
                        const nombre = option.apellido ? `${option.nombre} ${option.apellido}` : option.nombre
                        const iniciales = option.iniciales && option.iniciales !== 'U' ? option.iniciales : (option.nombre?.[0] || '') + (option.apellido?.[0] || '') || 'C'
                        return (
                            <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{
                                    width: 34, height: 34, flexShrink: 0,
                                    backgroundColor: theme.palette.avatarDefault.bg,
                                    color: theme.palette.avatarDefault.color,
                                    fontSize: '0.73rem', fontWeight: 700,
                                }}>
                                    {iniciales}
                                </Avatar>
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                    {nombre}
                                </Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                    {option.numeroIdentificacion}
                                </Typography>
                            </Box>
                        )
                    }}
                    noOptionsText="No se encontraron clientes"
                    renderInput={(params) => (
                        <TextField {...params} label="Cliente *"
                            error={!!errores.idCliente} helperText={errores.idCliente || 'Busca por nombre, apellido o documento'}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                            sx={formFieldStyles} />
                    )}
                />
                {clienteSeleccionado && (
                    <Paper elevation={0} sx={{
                        mt: 1.5, p: 1.5, borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.default,
                    }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                            <Typography variant="body2">
                                <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Nombre:</Box>
                                {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                            </Typography>
                            <Typography variant="body2">
                                <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>{clienteSeleccionado.tipoIdentificacion || 'ID'}:</Box>
                                {clienteSeleccionado.numeroIdentificacion}
                            </Typography>
                            <Typography variant="body2">
                                <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Teléfono:</Box>
                                {clienteSeleccionado.telefono}
                            </Typography>
                            <Typography variant="body2">
                                <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Correo:</Box>
                                {clienteSeleccionado.email}
                            </Typography>
                            {clienteSeleccionado.destino && (
                                <Typography variant="body2">
                                    <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Municipio:</Box>
                                    {clienteSeleccionado.destino.ciudad}, {clienteSeleccionado.destino.departamento}
                                </Typography>
                            )}
                            {clienteSeleccionado.direccion && (
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="body2">
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Dirección:</Box>
                                        {clienteSeleccionado.direccion}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                )}
            </Box>

            <Divider />

            {/* Destinatario */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: theme.palette.text.primary }}>
                    Destinatario
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                    <TextField fullWidth select label="Tipo de documento *" name="tipoIdentificacionDestinatario"
                        value={form.tipoIdentificacionDestinatario} onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacionDestinatario: validarCampo('tipoIdentificacionDestinatario', form, ventaOriginal) }))}
                        error={!!errores.tipoIdentificacionDestinatario} helperText={errores.tipoIdentificacionDestinatario}
                        slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                            select: { IconComponent: KeyboardArrowDownOutlinedIcon },
                        }}
                        sx={formFieldStyles}>
                        <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
                        <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
                        <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
                        <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
                        <MenuItem value="PAS">Pasaporte</MenuItem>
                        <MenuItem value="RC">Registro Civil (RC)</MenuItem>
                    </TextField>
                    <FormField label="Número de documento" name="numeroIdentificacionDestinatario" value={form.numeroIdentificacionDestinatario}
                        onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, numeroIdentificacionDestinatario: validarDocumentoDestinatarioCompleto(form.tipoIdentificacionDestinatario, form.numeroIdentificacionDestinatario) }))}
                        required error={errores.numeroIdentificacionDestinatario}
                        helperText={errores.numeroIdentificacionDestinatario || docHelperTextDestinatario(form.tipoIdentificacionDestinatario)}
                        icon={BadgeOutlinedIcon} inputProps={{ maxLength: getMaxLengthDocDestinatario(form.tipoIdentificacionDestinatario) }} />
                    <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                        onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, nombreDestinatario: validarCampo('nombreDestinatario', form, ventaOriginal) }))}
                        required error={errores.nombreDestinatario}
                        helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon}
                        placeholder="Ej: Juan Pérez" inputProps={{ maxLength: 50 }} />
                    <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                        onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, telefonoDestinatario: validarCampo('telefonoDestinatario', form, ventaOriginal) }))}
                        required error={errores.telefonoDestinatario}
                        helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                        inputProps={{ maxLength: 10 }} />
                    <FormField label="Correo" name="correoDestinatario" value={form.correoDestinatario}
                        onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, correoDestinatario: validarCampo('correoDestinatario', form, ventaOriginal) }))}
                        error={errores.correoDestinatario}
                        placeholder="correo@dominio.com"
                        helperText={errores.correoDestinatario || 'Opcional'} icon={MailOutlinedIcon}
                        inputProps={{ maxLength: 150 }} />
                    <Autocomplete
                        popupIcon={<KeyboardArrowDownOutlinedIcon />}
                        options={destinos}
                        getOptionLabel={(d) => `${d.ciudad} - ${d.departamento}`}
                        isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                        value={destinoDestinatarioSeleccionado}
                        inputValue={destinoDestinatarioInput}
                        onInputChange={(_, newVal, reason) => {
                            if (reason === 'input') setDestinoDestinatarioInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
                            else setDestinoDestinatarioInput(newVal)
                        }}
                        onChange={(_, val) => {
                            handleChange({ target: { name: 'idDestinoDestinatario', value: val ? val.idDestino : '' } })
                            setSinCambios?.(false)
                        }}
                        onBlur={() => setErrores(prev => ({ ...prev, idDestinoDestinatario: validarCampo('idDestinoDestinatario', form, ventaOriginal) }))}
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
                                normalizarTexto(d.ciudad || '').includes(q) ||
                                normalizarTexto(d.departamento || '').includes(q)
                            )
                        }}
                        noOptionsText="No se encontraron destinos"
                        renderInput={(params) => (
                            <TextField {...params} label="Destino *"
                                error={!!errores.idDestinoDestinatario}
                                helperText={errores.idDestinoDestinatario || '¿A qué municipio se envía el paquete?'}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }}
                                sx={formFieldStyles} />
                        )}
                    />
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, direccionDestinatario: validarCampo('direccionDestinatario', form, ventaOriginal) }))}
                            required error={errores.direccionDestinatario}
                            placeholder="Ej: Cra 23 #80-5"
                            helperText={errores.direccionDestinatario || `${(form.direccionDestinatario || '').length}/300`}
                            icon={HomeOutlinedIcon} multiline rows={2} inputProps={{ maxLength: 300 }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
