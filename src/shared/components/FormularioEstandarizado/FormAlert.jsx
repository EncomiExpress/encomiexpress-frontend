import { Alert } from '@mui/material'

export const FormAlert = ({ severity = 'error', children, onClose }) => {
  return (
    <Alert severity={severity} sx={{ mb: 3, borderRadius: 2 }} onClose={onClose}>
      {children}
    </Alert>
  )
}
