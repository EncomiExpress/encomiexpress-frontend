import { useState } from 'react'
import { Box, Typography, TextField, MenuItem, InputAdornment, IconButton, Autocomplete } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import NacionSVG from '../../../../shared/components/NacionSVG.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { validarCampo } from '../../validations/usuarioValidation.js'

const PasoContactoRol = ({
    theme, navigate, form, errores, setErrores, handleChange, verificarEmailDuplicado, validationOpts,
    showPassword, setShowPassword, showConfirmarPassword, setShowConfirmarPassword,
    passwordLabel, passwordRequired, passwordHelperText,
    rolesDisponibles, sedesDisponibles = [],
}) => {
    // La sede vive en form.sedes como un array (contrato con el backend), pero un
    // distribuidor cubre una sola -> el Autocomplete maneja un único valor.
    const [sedeInput, setSedeInput] = useState('')
    const sedeSeleccionada = sedesDisponibles.find(
        s => s.idDestino === (Array.isArray(form.sedes) ? form.sedes[0] : undefined)
    ) || null

    return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <TextField fullWidth label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form, validationOpts) }))} required
            error={!!errores.telefono} helperText={errores.telefono || 'Empieza por 3, 10 dígitos'}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                htmlInput: { maxLength: 10 }
            }}
            sx={formFieldStyles} />
        <TextField fullWidth label="Correo electrónico" name="email"
            value={form.email} onChange={handleChange}
            onBlur={() => {
                verificarEmailDuplicado()
                setErrores(prev => ({ ...prev, email: validarCampo('email', form, validationOpts) }))
            }} required
            placeholder="correo@dominio.com"
            error={!!errores.email} helperText={errores.email}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                htmlInput: { maxLength: 100 }
            }}
            sx={formFieldStyles} />
        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <TextField fullWidth label={passwordLabel} name="password" type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, password: validarCampo('password', form, validationOpts) }))} required={passwordRequired}
                error={!!errores.password} helperText={errores.password || passwordHelperText}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: { pl: 1.5 }
                    },
                    htmlInput: { maxLength: 64 }
                }}
                sx={formFieldStyles} />
            <TextField fullWidth label="Confirmar contraseña" name="confirmarPassword" type={showConfirmarPassword ? 'text' : 'password'}
                value={form.confirmarPassword} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, confirmarPassword: validarCampo('confirmarPassword', form, validationOpts) }))} required={passwordRequired}
                error={!!errores.confirmarPassword} helperText={errores.confirmarPassword}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmarPassword(!showConfirmarPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                                    {showConfirmarPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: { pl: 1.5 }
                    },
                    htmlInput: { maxLength: 64 }
                }}
                sx={formFieldStyles} />
        </Box>
        <TextField fullWidth select label="Rol" name="idRol" value={form.idRol} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, idRol: validarCampo('idRol', form, validationOpts) }))} required
            error={!!errores.idRol} helperText={errores.idRol || (
                <>
                    ¿Buscas registrar un conductor? Hazlo desde el módulo de{' '}
                    <Box component="span" onClick={() => navigate('/transporte/conductores')}
                        sx={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                        Conductores
                    </Box>
                </>
            )}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><AssignmentIndOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                select: { IconComponent: KeyboardArrowDownOutlinedIcon }
            }}
            sx={formFieldStyles}>
            {rolesDisponibles.map((rol) => (
                <MenuItem key={rol.idRol} value={rol.idRol} sx={{ p: 0, justifyContent: 'flex-start', my: 0.5 }}>
                    <Box sx={{
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                        border: `1px solid ${theme.palette.divider}`,
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        ml: 1,
                    }}>
                        {rol.nombre}
                    </Box>
                </MenuItem>
            ))}
        </TextField>

        {/* Sede del distribuidor (encargado de sede) — solo visible para ese rol, al
            lado del campo Rol. Un distribuidor cubre un único municipio: es donde
            entrega los paquetes al destinatario. Mismo patrón de buscador que el
            Destino de una ruta (trae los primeros 5 y filtra al escribir). */}
        {form.rolNombre === 'distribuidor' && (
            <Autocomplete
                options={sedesDisponibles}
                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                getOptionLabel={(d) => `${d.municipio}${d.departamento ? ` - ${d.departamento}` : ''}`}
                isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                value={sedeSeleccionada}
                inputValue={sedeInput}
                onInputChange={(_, newVal, reason) => {
                    if (reason === 'input') setSedeInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
                    else setSedeInput(newVal)
                }}
                onChange={(_, val) => handleChange({ target: { name: 'sedes', value: val ? [val.idDestino] : [] } })}
                onBlur={() => setErrores(prev => ({ ...prev, sedes: validarCampo('sedes', form, validationOpts) }))}
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
                    return opts.filter(d =>
                        normalizarTexto(d.municipio || '').includes(q) ||
                        normalizarTexto(d.departamento || '').includes(q)
                    )
                }}
                noOptionsText="No se encontraron sedes"
                renderInput={(params) => (
                    <TextField {...params} label="Sede *"
                        error={!!errores.sedes}
                        helperText={errores.sedes || 'Municipio donde este distribuidor entrega los paquetes al destinatario'}
                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }}
                        sx={formFieldStyles} />
                )}
            />
        )}
    </Box>
    )
}

export default PasoContactoRol
