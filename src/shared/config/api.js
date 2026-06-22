const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error('[EncomiExpress] VITE_API_URL no está configurado. El frontend apunta a localhost en producción.')
}

export { API_URL }