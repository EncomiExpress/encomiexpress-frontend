import { Box } from '@mui/material'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formatearMoneda } from '../../../../shared/utils/formatters.js'
import { validarCampo } from '../../validations/destinoValidation.js'

const PasoTarifa = ({ form, errores, setErrores, handleChange }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
        <FormField
            label="Tarifa Base (COP)" name="tarifaBase" value={formatearMoneda(form.tarifaBase)} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, tarifaBase: validarCampo('tarifaBase', form) }))}
            required error={errores.tarifaBase} helperText={errores.tarifaBase || 'Valor en pesos colombianos'}
            icon={AttachMoneyOutlinedIcon} inputProps={{ maxLength: 11 }}
            placeholder="Ej: 25.000"
        />
    </Box>
)

export default PasoTarifa
