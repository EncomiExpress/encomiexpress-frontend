import { Box, Typography, Paper, Divider, Avatar, TextField, Autocomplete } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { validarCampo, OPCION_CLIENTE_NUEVO } from './validacion.js'

/** Paso 1 del wizard: elegir el cliente remitente y capturar los datos del destinatario. */
export default function PasoParticipantes({
    theme, clientes, clienteSeleccionado, clienteInput, setClienteInput,
    form, setForm, errores, setErrores, handleChange, onNuevoCliente,
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Remitente — solo seleccionar cliente */}
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
                        return [...base, OPCION_CLIENTE_NUEVO]
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
                            : (prev.idCliente ? { ...prev, idCliente: validarCampo('idCliente', { idCliente: '' }) } : prev))
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, idCliente: validarCampo('idCliente', form) }))}
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
                    <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                        onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, nombreDestinatario: validarCampo('nombreDestinatario', form) }))}
                        required error={errores.nombreDestinatario}
                        helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon}
                        placeholder="Ej: Juan Pérez" inputProps={{ maxLength: 50 }} />
                    <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                        onChange={handleChange}
                        onBlur={() => setErrores(prev => ({ ...prev, telefonoDestinatario: validarCampo('telefonoDestinatario', form) }))}
                        required error={errores.telefonoDestinatario}
                        helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                        inputProps={{ maxLength: 10 }} />
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, direccionDestinatario: validarCampo('direccionDestinatario', form) }))}
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
