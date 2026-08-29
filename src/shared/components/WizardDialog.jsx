import { useTheme } from '@mui/material/styles'
import { Box, Typography, Stepper, Step, StepLabel, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CloseIcon from '@mui/icons-material/Close'

const stepperSx = (theme) => ({
    mb: 3, mt: 2,
    '& .MuiStepIcon-root': { color: theme.palette.divider },
    '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
    '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
    '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
    '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
    '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
    '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
    '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
    '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
    '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
})

const backButtonSx = (theme) => ({
    textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
    color: theme.palette.text.primary, fontWeight: 500,
    '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
    '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
})

const cancelButtonSx = (theme) => ({
    textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
    '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
})

// Estilo único de "deshabilitado" (tokens de theme, se adapta a modo oscuro) — antes
// convivían 3 variantes distintas entre módulos (algunas con hex fijo, otras sin
// override), unificadas acá al extraer el molde compartido del wizard.
const primaryButtonSx = (theme, { minWidth = 170 } = {}) => ({
    textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
    '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
})

/**
 * Molde compartido de los wizards de Registrar/Actualizar: Dialog + título/subtítulo +
 * Stepper + footer de 3 botones (Anterior/Cancelar/Principal). El contenido del paso
 * actual lo sigue eligiendo cada página (via su propio renderStepContent) y se pasa
 * como children. Los estados tempranos de "cargando"/"error" (solo los usan 3 de 9
 * módulos, antes de tener datos para hidratar el form) se quedan en cada página, fuera
 * de este componente — no forman parte del molde común.
 */
const WizardDialog = ({
    open, onClose, title, subtitle,
    steps, activeStep, onBack, onNext, onSubmit,
    submitting, submitDisabled = false, submitLabel, submitIcon,
    children,
}) => {
    const theme = useTheme()
    const isLastStep = activeStep === steps.length - 1

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>{title}</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        {subtitle}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Box sx={{ mb: 3 }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={stepperSx(theme)}>
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                </Box>
                <Box sx={{ px: 4, py: 2 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {children}
                    </Box>
                </Box>
            </DialogContent>

            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`,
            }}>
                <Button onClick={onBack} disabled={activeStep === 0} variant="outlined"
                    startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={backButtonSx(theme)}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={onClose} disableRipple sx={cancelButtonSx(theme)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={isLastStep ? onSubmit : onNext}
                        variant="contained" disabled={submitting || (isLastStep && submitDisabled)}
                        endIcon={submitting ? undefined : (isLastStep ? submitIcon : <ArrowForwardOutlinedIcon />)}
                        disableRipple
                        sx={primaryButtonSx(theme)}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (isLastStep ? submitLabel : 'Siguiente')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default WizardDialog
