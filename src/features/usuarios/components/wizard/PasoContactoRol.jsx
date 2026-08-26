import { Box, TextField, MenuItem, InputAdornment, IconButton } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { validarCampo } from '../../utils/usuarioValidation.js'

const PasoContactoRol = ({
    theme, navigate, form, errores, setErrores, handleChange, verificarEmailDuplicado, validationOpts,
    showPassword, setShowPassword, showConfirmarPassword, setShowConfirmarPassword,
    passwordLabel, passwordRequired, passwordHelperText,
    rolesDisponibles,
}) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <TextField fullWidth label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form, validationOpts) }))} required
            error={!!errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
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
    </Box>
)

export default PasoContactoRol
