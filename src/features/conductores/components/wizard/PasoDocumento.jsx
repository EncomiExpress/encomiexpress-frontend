import { Box, TextField, MenuItem, InputAdornment } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { maxLengthDocumento, docHelperText, validarNumeroDocumento } from '../../../../shared/utils/documento.js'
import { validarCampo } from '../../validations/conductorValidation.js'

const PasoDocumento = ({ form, errores, setErrores, handleChange, verificarDocumentoDuplicado, verificarNombreDuplicado, validationOpts }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <TextField fullWidth select label="Tipo de documento *" name="tipoIdentificacion"
            value={form.tipoIdentificacion} onChange={handleChange}
            onBlur={() => setErrores(prev => ({ ...prev, tipoIdentificacion: validarCampo('tipoIdentificacion', form, validationOpts) }))}
            error={!!errores.tipoIdentificacion} helperText={errores.tipoIdentificacion}
            slotProps={{
                input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> },
                select: { IconComponent: KeyboardArrowDownOutlinedIcon },
            }}
            sx={formFieldStyles}>
            {/* Solo CC/CE/PPT: el RUNT exige mayoría de edad y licencia pública
            colombiana vigente para manejar carga -- TI/RC (menores) y pasaporte
            (documento de viaje) no permiten registrar ni renovar esa licencia. Desde
            2023 el Ministerio de Transporte sí habilita al venezolano con PPT a
            tramitar/convalidar licencia de servicio público. Ver LOGICA.md. */}
            <MenuItem value="CC">Cédula de Ciudadanía (CC)</MenuItem>
            <MenuItem value="CE">Cédula de Extranjería (CE)</MenuItem>
            <MenuItem value="PPT">Permiso por Protección Temporal (PPT)</MenuItem>
        </TextField>
        <FormField label="Número de documento" name="numeroIdentificacion" value={form.numeroIdentificacion}
            onChange={handleChange}
            onBlur={() => {
                verificarDocumentoDuplicado()
                setErrores(prev => ({ ...prev, numeroIdentificacion: validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion) || '' }))
            }}
            required error={errores.numeroIdentificacion}
            helperText={errores.numeroIdentificacion || docHelperText(form.tipoIdentificacion)} icon={BadgeOutlinedIcon}
            inputProps={{ maxLength: maxLengthDocumento(form.tipoIdentificacion) }} />
        <FormField label="Nombres" name="nombre" value={form.nombre} onChange={handleChange}
            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, nombre: validarCampo('nombre', form, validationOpts) })) }}
            required error={errores.nombre} helperText={errores.nombre} icon={PersonOutlinedIcon}
            inputProps={{ maxLength: 50 }} placeholder="Ej: Juan" />
        <FormField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange}
            onBlur={() => { verificarNombreDuplicado(); setErrores(prev => ({ ...prev, apellido: validarCampo('apellido', form, validationOpts) })) }}
            required error={errores.apellido} helperText={errores.apellido} icon={PersonOutlinedIcon}
            inputProps={{ maxLength: 50 }} placeholder="Ej: Gómez López" />
    </Box>
)

export default PasoDocumento
