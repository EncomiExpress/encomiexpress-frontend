import { useState, useEffect } from 'react'
import { Box } from '@mui/material'

const ImageCarousel = ({ slides, sx, intervalMs = 3500 }) => {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length)
        }, intervalMs)
        return () => clearInterval(timer)
    }, [slides.length, intervalMs])

    return (
        <Box sx={{ overflow: 'hidden', ...sx }}>
            {slides.map((src, i) => (
                <Box key={i} sx={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: current === i ? 1 : 0, transition: 'opacity 0.9s ease-in-out', zIndex: current === i ? 2 : 1,
                }}>
                    <img src={src} alt={`slide-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
            ))}
        </Box>
    )
}

export default ImageCarousel
