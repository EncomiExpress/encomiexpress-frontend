import { Box, TextField, InputAdornment, IconButton } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { validarCampo } from '../../validations/conductorValidation.js'

const PasoContacto = ({
    form, errores, setErrores, handleChange, verificarEmailDuplicado, validationOpts,
    showPassword, setShowPassword, showConfirmarPassword, setShowConfirmarPassword,
    passwordLabel, passwordRequired, passwordHelperText,
}) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form, validationOpts) }))}
            required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
            icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} />
        <FormField label="Correo electrónico" name="email" value={form.email}
            onChange={handleChange}
            onBlur={() => {
                verificarEmailDuplicado()
                setErrores(prev => ({ ...prev, email: validarCampo('email', form, validationOpts) }))
            }}
            required error={errores.email} helperText={errores.email}
            icon={EmailOutlinedIcon} placeholder="correo@dominio.com"
            inputProps={{ maxLength: 100 }} />
        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <TextField fullWidth label={passwordLabel} name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, password: validarCampo('password', form, validationOpts) }))} required={passwordRequired}
                error={!!errores.password} helperText={errores.password || passwordHelperText}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockOutlinedIcon sx={{ color: '#94a3b8' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small" tabIndex={-1}>
                                    {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                    htmlInput: { maxLength: 64 }
                }}
                sx={formFieldStyles} />
            <TextField fullWidth label="Confirmar contraseña" name="confirmarPassword"
                type={showConfirmarPassword ? 'text' : 'password'}
                value={form.confirmarPassword} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, confirmarPassword: validarCampo('confirmarPassword', form, validationOpts) }))} required={passwordRequired}
                error={!!errores.confirmarPassword} helperText={errores.confirmarPassword}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockOutlinedIcon sx={{ color: '#94a3b8' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmarPassword(p => !p)} edge="end" size="small" tabIndex={-1}>
                                    {showConfirmarPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                    htmlInput: { maxLength: 64 }
                }}
                sx={formFieldStyles} />
        </Box>
    </Box>
)

export default PasoContacto
