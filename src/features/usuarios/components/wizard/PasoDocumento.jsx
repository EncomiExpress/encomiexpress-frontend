import { Box, TextField, MenuItem, InputAdornment } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { maxLengthDocumento, docHelperText, validarNumeroDocumento } from '../../../../shared/utils/documento.js'
import { validarCampo } from '../../utils/usuarioValidation.js'

const PasoDocumento = ({ form, errores, setErrores, handleChange, verificarDocumentoDuplicado, verificarNombreDuplicado, validationOpts }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <TextField fullWidth select label="Tipo de documento" name="tipoIdentificacion"
            value={form.tipoIdentificacion} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacion: validarCampo('tipoIdentificacion', form, validationOpts) }))} required
            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                select: { IconComponent: KeyboardArrowDownOutlinedIcon }
            }}
            sx={formFieldStyles}>
            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
            <MenuItem value="CE">Cédula Extranjería (CE)</MenuItem>
            <MenuItem value="PAS">Pasaporte</MenuItem>
        </TextField>
        <TextField fullWidth label="Número de documento" name="numeroIdentificacion"
            value={form.numeroIdentificacion} onChange={handleChange}
            onBlur={() => {
                verificarDocumentoDuplicado()
                setErrores(prev => ({ ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
            }} required
            error={!!errores.numeroIdentificacion} helperText={errores.numeroIdentificacion || docHelperText(form.tipoIdentificacion)}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                htmlInput: { maxLength: maxLengthDocumento(form.tipoIdentificacion) }
            }}
            sx={formFieldStyles} />
        <TextField fullWidth label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form, validationOpts) })) }} required placeholder="Ej: Juan"
            error={!!errores.nombre} helperText={errores.nombre}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                htmlInput: { maxLength: 50 }
            }}
            sx={formFieldStyles} />
        <TextField fullWidth label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form, validationOpts) })) }} required placeholder="Ej: Gómez López"
            error={!!errores.apellido} helperText={errores.apellido}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>, sx: { pl: 1.5 } },
                htmlInput: { maxLength: 50 }
            }}
            sx={formFieldStyles} />
    </Box>
)

export default PasoDocumento
