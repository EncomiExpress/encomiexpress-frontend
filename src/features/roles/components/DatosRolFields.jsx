import { Box } from '@mui/material'
import { FormField } from '../../../shared/components/FormularioEstandarizado.jsx'
import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { validarNombreRol } from '../utils/rolValidation.js'

const DatosRolFields = ({ formData, setFormData, errores, setErrores, setAvisoNombreDuplicado, verificarNombreRolDuplicado }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2 }}>
        <FormField
            label="Nombre del Rol"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => {
                const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
                setFormData({ ...formData, nombre: valor })
                setAvisoNombreDuplicado('')
                setErrores(prev => prev.nombre ? { ...prev, nombre: valor.trim() ? '' : prev.nombre } : prev)
            }}
            onBlur={() => {
                verificarNombreRolDuplicado()
                setErrores(prev => ({ ...prev, nombre: validarNombreRol(formData.nombre) }))
            }}
            error={!!errores.nombre}
            helperText={errores.nombre}
            placeholder="Ej: Gerente, Supervisor, Asesor comercial"
            required
            inputProps={{ maxLength: 50 }}
        />

        <FormField
            label="Descripción (opcional)"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => {
                const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
                setFormData({ ...formData, descripcion: valor })
                setErrores(prev => prev.descripcion ? { ...prev, descripcion: esSoloRelleno(valor) ? prev.descripcion : '' } : prev)
            }}
            onBlur={() => setErrores(prev => ({ ...prev, descripcion: (formData.descripcion && esSoloRelleno(formData.descripcion)) ? 'La descripción no puede contener solo espacios' : '' }))}
            placeholder="Descripción del rol"
            inputProps={{ maxLength: 200 }}
            error={!!errores.descripcion}
            helperText={errores.descripcion || `${formData.descripcion.length}/200`}
        />
    </Box>
)

export default DatosRolFields
