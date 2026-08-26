import { Box, TextField, MenuItem, InputAdornment } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { validarCampo, validarDocumentoCompleto, getMaxLengthDoc, docHelperText } from '../../utils/propietarioValidation.js'

const PasoDocumento = ({ form, errores, setErrores, handleChange, verificarDocumentoDuplicado, verificarNombreDuplicado }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <TextField fullWidth select label="Tipo de documento *" name="tipoIdentificacion"
            value={form.tipoIdentificacion} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacion: validarCampo('tipoIdentificacion', form) }))}
            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                select: { IconComponent: KeyboardArrowDownOutlinedIcon },
            }}
            sx={formFieldStyles}>
            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
            <MenuItem value="NIT">NIT (Persona Jurídica)</MenuItem>
            <MenuItem value="TI">Tarjeta de Identidad (TI)</MenuItem>
            <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
            <MenuItem value="PAS">Pasaporte</MenuItem>
            <MenuItem value="RC">Registro Civil (RC)</MenuItem>
        </TextField>
        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
            onChange={handleChange}
            onBlur={() => {
                verificarDocumentoDuplicado()
                setErrores(prev => ({ ...prev, numeroIdentificacion: validarDocumentoCompleto(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
            }}
            required error={errores.numeroIdentificacion}
            helperText={errores.numeroIdentificacion || docHelperText(form.tipoIdentificacion)} icon={BadgeOutlinedIcon}
            inputProps={{ maxLength: getMaxLengthDoc(form.tipoIdentificacion) }} />
        <FormField
            label={form.tipoIdentificacion === 'NIT' ? 'Razón Social' : 'Nombres'}
            name="nombre" value={form.nombre} onChange={handleChange}
            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form) })) }}
            required error={errores.nombre} helperText={errores.nombre}
            icon={form.tipoIdentificacion === 'NIT' ? BusinessOutlinedIcon : PersonOutlinedIcon}
            inputProps={{ maxLength: 50 }}
            placeholder={form.tipoIdentificacion === 'NIT' ? 'Ej: Transportes XYZ S.A.S' : 'Ej: Carlos'} />
        {form.tipoIdentificacion !== 'NIT' && (
            <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
                onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form) })) }}
                required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
                inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
        )}
    </Box>
)

export default PasoDocumento
