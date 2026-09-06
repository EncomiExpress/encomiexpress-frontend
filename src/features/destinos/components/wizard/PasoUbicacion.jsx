import { Box, Autocomplete, TextField } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import {
    getOpcionesDepartamento,
    validarCampo,
} from '../../validations/destinoValidation.js'

const PasoUbicacion = ({
    form, setForm, errores, setErrores, handleChange,
    validarMunicipioDup, destinos,
}) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <Autocomplete
            freeSolo
            options={getOpcionesDepartamento(destinos)}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            inputValue={form.departamento}
            onInputChange={(_, newVal, reason) => {
                if (reason !== 'input') { setForm(prev => ({ ...prev, departamento: newVal })); return }
                const limpio = newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '').slice(0, 60)
                setForm(prev => ({ ...prev, departamento: limpio }))
                setErrores(prev => prev.departamento ? { ...prev, departamento: validarCampo('departamento', { ...form, departamento: limpio }) } : prev)
            }}
            onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
            renderInput={(params) => (
                <TextField {...params} label="Departamento *"
                    error={!!errores.departamento}
                    helperText={errores.departamento}
                    slotProps={{ htmlInput: { ...params.inputProps, maxLength: 60 } }}
                    sx={formFieldStyles} />
            )}
        />
        <FormField
            label="Municipio" name="municipio" value={form.municipio} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, municipio: validarCampo('municipio', form) || validarMunicipioDup(form.municipio) }))}
            required disabled={!form.departamento}
            error={errores.municipio} helperText={errores.municipio || (form.departamento ? 'Escribe el nombre del municipio de destino' : 'Completa primero el departamento')}
            icon={LocationOnOutlinedIcon} inputProps={{ maxLength: 60 }}
            placeholder="Ej: Caucasia"
        />
        <Box sx={{ gridColumn: '1 / -1' }}>
            <FormField
                label="Dirección de la oficina" name="direccion" value={form.direccion} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, direccion: validarCampo('direccion', form) }))}
                error={errores.direccion}
                helperText={errores.direccion || `Opcional · ${(form.direccion || '').length}/200`}
                icon={HomeOutlinedIcon} inputProps={{ maxLength: 200 }}
                placeholder="Ej: Calle 30 #12-45, local 2"
            />
        </Box>
    </Box>
)

export default PasoUbicacion
