import { Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Grid, Button } from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import slide1 from '../../assets/box.png'
import slide2 from '../../assets/camion.png'
import slide3 from '../../assets/customers.png'
import slide4 from '../../assets/cashbag.png'
import logo from '../../assets/logo.png'

const slides = [slide1, slide2, slide3, slide4]

const modules = [
  { iconClass: 'fi fi-ss-shipping-fast', name: 'Transporte', desc: 'Flota y rutas', color: '#8b5cf6' },
  { iconClass: 'fi fi-ss-money-bill-wave', name: 'Anticipos', desc: 'Movimientos de caja', color: '#f59e0b' },
  { iconClass: 'fi fi-ss-users', name: 'Clientes', desc: 'Datos y contacto', color: '#3b82f6' },
  { iconClass: 'fi fi-ss-boxes', name: 'Encomiendas', desc: 'Registro y control', color: '#ef4444' },
  { iconClass: 'fi fi-rs-chat-arrow-grow', name: 'Ventas', desc: 'Control de ingresos', color: '#10b981' },
]

const stats = [
  { label: 'Cobertura departamental', value: 'Bajo Cauca' },
  { label: 'Integrados en un sistema', value: '5 Módulos' },
  { label: 'Solo personal autorizado', value: 'Acceso Seguro' },
]

const logoStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}

const Home = () => {
  const [current, setCurrent] = useState(0)
  const theme = useTheme()
  const gridColor = theme.palette.background.default === '#121212' ? '255,255,255' : '26,46,110'
  const gridOpacity = theme.palette.background.default === '#121212' ? '0.06' : '0.05'
  const isDark = theme.palette.background.default === '#121212'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      color: theme.palette.text.dark,
    }}>
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(${gridColor},${gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(${gridColor},${gridOpacity}) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <Box sx={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,46,110,0.08) 0%, transparent 70%)',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute', bottom: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,24,24,0.06) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <Box sx={{ height: 4, background: theme.palette.gradient.navbar, width: '100%', position: 'relative', zIndex: 10 }} />

      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: { xs: 4, md: 10 }, py: 1,
        position: 'relative', zIndex: 10,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{
          width: 160,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexShrink: 0,
        }}>
          <img src={logo} alt="EncomiExpress" style={logoStyle} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8, borderRadius: '20px',
            border: `1px solid ${theme.palette.primary.main}33`, backgroundColor: `${theme.palette.primary.main}0F`,
          }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: theme.palette.primary.main, boxShadow: `0 0 6px ${theme.palette.primary.main}` }} />
            <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.72rem', fontWeight: 600 }}>Acceso Exclusivo</Typography>
          </Box>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            endIcon={<LoginIcon />}
            sx={{
              background: theme.palette.gradient.primary,
              borderRadius: '10px', px: 3.5, py: 1.2,
              fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
              color: 'white',
              '&:hover': { background: theme.palette.gradient.primaryHover, transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ px: { xs: 4, md: 10 }, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, position: 'relative', zIndex: 10 }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1.5,
              backgroundColor: `${theme.palette.primary.main}12`,
              border: `1px solid ${theme.palette.primary.main}2E`,
              px: 2.5, py: 0.8, borderRadius: '30px', mb: 4,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.palette.primary.main }} />
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                Gestión de Módulos
              </Typography>
            </Box>

            <Grid container spacing={8} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography sx={{
                  fontWeight: 700, fontSize: { xs: '2.8rem', md: '4rem' }, fontFamily: 'Cambria',
                  lineHeight: 1.08, letterSpacing: '-2px', mb: 3, color: theme.palette.background.default === '#121212' ? '#4FC3F7' : 'rgb(26, 46, 110, 0.95)',
                }}>
                  Panel de{' '}
                  <Box component="span" sx={{ color: theme.palette.background.default === '#121212' ? '#E57373' : 'rgba(204,24,24,0.95)' }}>administración</Box>
                  <br /> operativa
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.05rem', lineHeight: 1.8, mb: 5, maxWidth: 480 }}>
                  Gestiona encomiendas, transporte, clientes y finanzas en un solo sistema centralizado. Acceso exclusivo para personal autorizado.
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mt: 6, flexWrap: 'wrap' }}>
                  {stats.map((s, i) => (
                    <Box key={i} sx={{ borderLeft: `3px solid ${theme.palette.primary.main}CC`, pl: 2 }}>
                      <Typography sx={{ color: `${theme.palette.primary.main}F0`, fontWeight: 600, fontSize: '1.2rem' }}>{s.value}</Typography>
                      <Typography sx={{ color: theme.palette.text.dark, fontWeight: 600, fontSize: '0.78rem' }}>{s.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 1 }} sx={{ position: { xs: 'static', md: 'relative' } }}>
                <Box sx={{
                  position: { xs: 'relative', md: 'absolute' }, top: { md: '-275px' }, right: { md: '-520px' },
                  width: { xs: '100%', md: '580px' }, height: { xs: 300, md: 530 }, overflow: 'hidden',
                }}>
                  {slides.map((src, i) => (
                    <Box key={i} sx={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      opacity: current === i ? 1 : 0, transition: 'opacity 0.9s ease-in-out', zIndex: current === i ? 2 : 1,
                    }}>
                      <img src={src} alt={`slide-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 12 }} mt={10}>
                <Box sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '24px',
                  border: `1px solid ${theme.palette.primary.main}20`,
                  p: 3.5, boxShadow: `0 8px 40px ${theme.palette.primary.main}1A`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '2px' }}>
                      Módulos del Sistema
                    </Typography>
                    <Box sx={{ px: 1.5, py: 0.4, borderRadius: '8px', backgroundColor: `${theme.palette.primary.main}14`, border: `1px solid ${theme.palette.primary.main}33` }}>
                      <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.68rem', fontWeight: 700 }}>EncomiExpress</Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={1.5}>
                    {modules.map((mod, i) => (
                      <Grid size={{ xs: 12, md: 2.4 }} key={i}>
                        <Box sx={{
                          p: 2.5, borderRadius: '16px', backgroundColor: theme.palette.background.subtle, border: `1px solid ${theme.palette.primary.main}14`,
                          display: 'flex', alignItems: 'center', gap: 1.5, transition: 'all 0.25s ease', cursor: 'default',
                          '&:hover': {
                            backgroundColor: `${mod.color}08`, borderColor: `${mod.color}30`,
                            transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${mod.color}15`,
                          },
                        }}>
                          <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: `${mod.color}${isDark ? '33' : '12'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                            <i className={mod.iconClass}></i>
                          </Box>
                          <Box>
                            <Typography sx={{ color: theme.palette.text.dark, fontWeight: 700, fontSize: '0.82rem' }}>{mod.name}</Typography>
                            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.68rem' }}>{mod.desc}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${theme.palette.primary.main}14`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.primary.main, boxShadow: `0 0 8px ${theme.palette.primary.main}`, flexShrink: 0 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>Acceso restringido · Solo personal autorizado</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{
          position: 'relative', zIndex: 10, borderTop: '1px solid rgba(26,46,110,0.1)',
          backgroundColor: theme.palette.background.paper, px: { xs: 4, md: 10 }, py: 8,
        }}>
          <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
            <Typography sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: '0.95rem', letterSpacing: '2px', textAlign: 'center', mb: 5 }}>
              Capacidades del Sistema
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'center', textAlign: 'center' }}>
              {[
                { iconClass: 'fi fi-ss-boxes', title: 'Registro de encomiendas', desc: 'Envíos, guías PDF, estados y métodos de pago. Reportes de ventas.', accent: '#CC1818' },
                { iconClass: 'fi fi-ss-shipping-fast', title: 'Logística de transporte', desc: 'Vehículos, conductores, rutas, destinos y propietarios. Control documental y reportes.', accent: '#1A2E6E' },
                { iconClass: 'fi fi-ss-users', title: 'Gestión de clientes', desc: 'Registro y datos de contacto.', accent: '#CC1818' },
                { iconClass: 'fi fi-ss-money-bill-wave', title: 'Control financiero', desc: 'Anticipos, legalización, excedentes y pagos de ventas. Reportes contables.', accent: '#1A2E6E' },
              ].map((item, i) => (
                <Box key={i} sx={{
                  flex: '1 1 220px', maxWidth: 260, p: 3.5, borderRadius: '20px', backgroundColor: theme.palette.background.subtle,
                  border: '1px solid rgba(26,46,110,0.08)', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  '&:hover': { borderColor: `${item.accent}30`, backgroundColor: `${item.accent}05`, transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${item.accent}12` },
                }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: '12px', backgroundColor: `${item.accent}${isDark ? '33' : '12'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', mb: 1.5 }}>
                    <i className={item.iconClass}></i>
                  </Box>
                  <Typography sx={{ color: theme.palette.text.dark, fontWeight: 700, fontSize: '0.95rem', mb: 1 }}>{item.title}</Typography>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{
        position: 'relative', zIndex: 10,
        background: theme.palette.gradient.hero,
        px: { xs: 4, md: 10 }, py: 1.5,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
      }}>
        <Box sx={{
          width: 160,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexShrink: 0,
        }}>
          <img src={logo} alt="EncomiExpress" style={logoStyle} />
        </Box>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.78rem' }}>
          © 2026 EncomiExpress · Uso exclusivo del personal autorizado.
        </Typography>
      </Box>
    </Box>
  )
}

export default Home