import { createContext, useCallback, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

    const showToast = useCallback((message, severity = 'success') => {
        setToast({ open: true, message, severity })
    }, [])

    const handleClose = () => setToast(prev => ({ ...prev, open: false }))

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} onClose={handleClose}
                    sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)
