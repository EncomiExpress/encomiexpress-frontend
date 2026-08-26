import { useState, useRef, useEffect } from 'react'
import { Box } from '@mui/material'

const PUNTOS_PALETA = [
  { cx: 6.5,  cy: 10.5 },
  { cx: 9.5,  cy: 6.5  },
  { cx: 14.5, cy: 6.5  },
  { cx: 17.5, cy: 10.5 },
]
const PASO_ANIM = 90
const TRANS_ANIM = 120

const PaletaAnimada = ({ isOpen, onClick, pal, darkMode }) => {
  const [ocultos, setOcultos] = useState([false, false, false, false])
  const animandoRef = useRef(false)
  const timersRef   = useRef([])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const schedule = (fn, delay) => { timersRef.current.push(setTimeout(fn, delay)) }

  const handleEntrar = () => {
    if (animandoRef.current) return
    animandoRef.current = true

    schedule(() => setOcultos([false, false, false, true]), 0)
    schedule(() => setOcultos([false, false, true,  true]), PASO_ANIM)
    schedule(() => setOcultos([false, true,  true,  true]), PASO_ANIM * 2)
    schedule(() => setOcultos([true,  true,  true,  true]), PASO_ANIM * 3)

    const INICIO = PASO_ANIM * 3 + TRANS_ANIM + 60

    schedule(() => setOcultos([false, true,  true,  true]),  INICIO)
    schedule(() => setOcultos([false, false, true,  true]),  INICIO + PASO_ANIM)
    schedule(() => setOcultos([false, false, false, true]),  INICIO + PASO_ANIM * 2)
    schedule(() => setOcultos([false, false, false, false]), INICIO + PASO_ANIM * 3)

    schedule(() => { animandoRef.current = false; timersRef.current = [] }, INICIO + PASO_ANIM * 3 + TRANS_ANIM + 80)
  }

  const iconColor = isOpen ? pal.primary.main : (darkMode ? '#A0A0A0' : '#8b8382')

  return (
    <Box
      onClick={onClick}
      onMouseEnter={handleEntrar}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 1, borderRadius: '10px', cursor: 'pointer', transition: 'background-color 0.18s ease',
        backgroundColor: isOpen ? pal.primary.activeBg : 'transparent',
        '&:hover': { backgroundColor: pal.primary.activeBg },
      }}
    >
      <svg width="1.3rem" height="1.3rem" viewBox="0 0 24 24" style={{ display: 'block' }}>
        <path
          d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'stroke 0.18s ease' }}
        />
        {PUNTOS_PALETA.map(({ cx, cy }, i) => (
          <circle
            key={i} cx={cx} cy={cy} r="1.5"
            fill={iconColor}
            style={{
              transition: `opacity ${TRANS_ANIM}ms ease, transform ${TRANS_ANIM}ms ease, fill 0.18s ease`,
              opacity:   ocultos[i] ? 0 : 1,
              transform: ocultos[i] ? 'scale(0)' : 'scale(1)',
              transformBox:    'fill-box',
              transformOrigin: 'center',
            }}
          />
        ))}
      </svg>
    </Box>
  )
}

export default PaletaAnimada
