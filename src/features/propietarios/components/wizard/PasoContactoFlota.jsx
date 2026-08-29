import { Box, MenuItem } from '@mui/material'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { validarCampo } from '../../validations/propietarioValidation.js'

const PasoContactoFlota = ({ form, errores, setErrores, handleChange }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, telefono: validarCampo('telefono', form) }))}
            required error={errores.telefono} helperText={errores.telefono || 'Número de 10 dígitos'}
            icon={PhoneOutlinedIcon} inputProps={{ maxLength: 10 }} />
        <FormField label="Correo electrónico" name="email" value={form.email}
            onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, email: validarCampo('email', form) }))}
            required error={errores.email} helperText={errores.email}
            icon={EmailOutlinedIcon} placeholder="correo@dominio.com"
            inputProps={{ maxLength: 100 }} />
        <FormSelect label="Tipo de flota" name="tipoFlota" value={form.tipoFlota}
            onChange={handleChange} helperText="Opcional">
            <MenuItem value="">Sin especificar</MenuItem>
            <MenuItem value="Mensajería">Mensajería</MenuItem>
            <MenuItem value="Carga Liviana">Carga Liviana</MenuItem>
            <MenuItem value="Carga Pesada">Carga Pesada</MenuItem>
            <MenuItem value="Mixta">Mixta</MenuItem>
        </FormSelect>
    </Box>
)

export default PasoContactoFlota
