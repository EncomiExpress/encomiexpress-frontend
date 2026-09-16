import { Box } from '@mui/material'
import {
    DirectionsCarOutlined, BadgeOutlined, SellOutlined, InvertColorsOutlined,
    SpeedOutlined, LocalShippingOutlined,
} from '@mui/icons-material'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formatearMoneda } from '../../../../shared/utils/formatters.js'
import { formatearPlaca, validarCampo } from '../../validations/vehiculoValidation.js'

const PasoDatosVehiculo = ({ formData, errores, setErrores, handleChange, verificarPlacaDuplicada, validationOpts }) => (
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
        {/* La empresa solo maneja camiones -- ya no es un select, es un campo
            fijo de solo lectura (siempre "Camión"). */}
        <FormField label="Tipo de Vehículo" name="tipo" value="Camión" disabled
            icon={LocalShippingOutlined} helperText="La empresa solo maneja camiones" />
        <FormField label="Capacidad (kg)" name="capacidad" value={formatearMoneda(formData.capacidad)}
            onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, capacidad: validarCampo('capacidad', formData, validationOpts) }))} required placeholder="Ej: 1.500" icon={SpeedOutlined}
            error={errores.capacidad} helperText={errores.capacidad}
            inputProps={{ maxLength: 7 }} />
    </Box>
)

export default PasoDatosVehiculo
