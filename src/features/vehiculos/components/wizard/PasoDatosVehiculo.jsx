import { Box, MenuItem, TextField, InputAdornment, IconButton } from '@mui/material'
import {
    DirectionsCarOutlined, BadgeOutlined, SellOutlined, InvertColorsOutlined,
    SpeedOutlined, Close,
} from '@mui/icons-material'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { TIPOS_VEHICULO, formatearPlaca, validarCampo } from '../../validations/vehiculoValidation.js'

const PasoDatosVehiculo = ({ formData, setFormData, errores, setErrores, handleChange, verificarPlacaDuplicada, validationOpts }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <FormField label="Placa" name="placa" value={formatearPlaca(formData.placa)} onChange={handleChange}
            onBlur={() => {
                verificarPlacaDuplicada()
                setErrores(prev => ({ ...prev, placa: validarCampo('placa', formData, validationOpts) }))
            }} required
            placeholder="Ej: ABC-123" icon={BadgeOutlined}
            error={errores.placa} helperText={errores.placa}
            inputProps={{ maxLength: 7 }} />
        <FormField label="Marca" name="marca" value={formData.marca} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, marca: validarCampo('marca', formData, validationOpts) }))} required
            placeholder="Ej: Toyota" icon={SellOutlined}
            error={errores.marca} helperText={errores.marca}
            inputProps={{ maxLength: 30 }} />
        <FormField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, modelo: validarCampo('modelo', formData, validationOpts) }))} required
            placeholder="Ej: Hilux" icon={DirectionsCarOutlined}
            error={errores.modelo} helperText={errores.modelo}
            inputProps={{ maxLength: 30 }} />
        <FormField label="Color" name="color" value={formData.color} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, color: validarCampo('color', formData, validationOpts) }))} required
            placeholder="Ej: Blanco" icon={InvertColorsOutlined}
            error={errores.color} helperText={errores.color}
            inputProps={{ maxLength: 20 }} />
        {formData.tipo === 'Otro' ? (
            <TextField
                fullWidth label="Tipo de Vehículo" name="tipoOtro" value={formData.tipoOtro || ''} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, tipoOtro: validarCampo('tipoOtro', formData, validationOpts) }))} required
                placeholder="Escribe el tipo de vehículo"
                error={!!errores.tipoOtro} helperText={errores.tipoOtro || 'Presiona la X para volver a la lista'}
                slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { maxLength: 30 },
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setFormData(prev => ({ ...prev, tipo: '', tipoOtro: '' }))} edge="end">
                                    <Close fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
                sx={formFieldStyles}
            />
        ) : (
            <FormSelect label="Tipo de Vehículo" name="tipo" value={formData.tipo} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, tipo: validarCampo('tipo', formData, validationOpts) }))} required
                error={errores.tipo} helperText={errores.tipo}>
                {TIPOS_VEHICULO.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </FormSelect>
        )}
        <FormField label="Capacidad (kg)" name="capacidad" value={formData.capacidad}
            onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, capacidad: validarCampo('capacidad', formData, validationOpts) }))} required placeholder="Ej: 1500" icon={SpeedOutlined}
            error={errores.capacidad} helperText={errores.capacidad}
            inputProps={{ maxLength: 6 }} />
    </Box>
)

export default PasoDatosVehiculo
