import { Box } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { maxLengthTelefono, telefonoHelperText } from '../../../../shared/validations/telefonoValidation.js'
import { validarCampo } from '../../validations/clienteValidation.js'

const PasoContacto = ({ form, errores, setErrores, handleChange }) => {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form) }))}
                required error={errores.telefono} helperText={errores.telefono || telefonoHelperText(form.tipoIdentificacion)}
                icon={PhoneOutlinedIcon} inputProps={{ maxLength: maxLengthTelefono(form.tipoIdentificacion) }} />
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
        </Box>
    )
}

export default PasoContacto
