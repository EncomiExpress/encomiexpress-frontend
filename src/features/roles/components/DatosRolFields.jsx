import { Box } from '@mui/material'
import { FormField } from '../../../shared/components/FormularioEstandarizado.jsx'
import { validarNombreRol, validarDescripcionRol } from '../validations/rolValidation.js'

const DatosRolFields = ({ formData, setFormData, errores, setErrores, setAvisoNombreDuplicado, verificarNombreRolDuplicado, panelRef }) => (
    <Box ref={panelRef} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2 }}>
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
                setErrores(prev => prev.descripcion ? { ...prev, descripcion: validarDescripcionRol(valor) } : prev)
            }}
            onBlur={() => setErrores(prev => ({ ...prev, descripcion: validarDescripcionRol(formData.descripcion) }))}
            placeholder="Descripción del rol"
            inputProps={{ maxLength: 200 }}
            error={!!errores.descripcion}
            helperText={errores.descripcion || `${formData.descripcion.length}/200`}
        />
    </Box>
)

export default DatosRolFields
