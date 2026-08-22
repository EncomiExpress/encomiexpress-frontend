import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, TextField, IconButton,
  InputAdornment, Typography, CircularProgress, Button,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import { FILTROS_ESTADO } from '../hooks/useEntityCrud.js'

const getThStyle = (theme) => ({
  fontWeight: 700,
  fontSize: '0.80rem',
  color: theme.palette.text.primary,
  letterSpacing: 0.5,
  py: 1.5,
  borderBottom: `1px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
})

/** Selector de estado (Todo / Habilitado / Inhabilitado) con el pill animado. */
export function FiltroEstadoTabs({ value, onChange, containerRef, btnRefs, pillStyle, filtros = FILTROS_ESTADO }) {
  const theme = useTheme()
  return (
    <Box ref={containerRef} sx={{
      position: 'relative', display: 'inline-flex',
      backgroundColor: theme.palette.primary.light, borderRadius: 4, p: '4px', gap: '5px',
    }}>
      <Box sx={{
        position: 'absolute', top: '4px', bottom: '4px',
        left: `${pillStyle.left}px`, width: `${pillStyle.width}px`,
        borderRadius: 3, backgroundColor: theme.palette.background.paper,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      }} />
      {filtros.map((f, i) => (
        <Button
          key={f.value}
          ref={el => { btnRefs.current[i] = el }}
          onClick={() => onChange(f.value)}
          size="small"
          disableElevation
          disableRipple
          sx={{
            position: 'relative', zIndex: 1, borderRadius: 3, textTransform: 'none',
            fontSize: '0.75rem', px: 2, py: 0.5, minWidth: 0,
            fontWeight: value === f.value ? 600 : 400,
            backgroundColor: 'transparent',
            color: value === f.value ? theme.palette.text.primary : theme.palette.primary.darker,
            transition: 'color 0.3s ease', border: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: value === f.value ? theme.palette.text.primary : theme.palette.primary.dark,
              border: 'none',
            },
          }}
        >
          {f.label}
        </Button>
      ))}
    </Box>
  )
}

/** Caja de búsqueda con debounce ya resuelto por useEntityCrud (recibe el valor y el setter). */
export function BuscadorField({ value, onChange, placeholder = 'Buscar...', width = 320 }) {
  const theme = useTheme()
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      sx={{
        width,
        '& .MuiOutlinedInput-root': {
          borderRadius: 4,
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
        },
      }}
      value={value}
      onChange={e => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onChange('')}>
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

/**
 * Tabla genérica de listado: encabezados ordenables, estados de carga/error/vacío
 * y resaltado de una fila (?highlight=) ya resuelto. Cada pantalla define sus
 * `columns` (incluida la columna de Acciones) y sigue siendo dueña del contenido
 * de cada celda y de qué botones de acción mostrar según permisos.
 *
 * columns: [{ key, label, sortField?, width?, align?, render(row) }]
 */
export default function DataTable({
  columns,
  rows,
  rowKey,
  loading,
  initialLoad,
  error,
  sortBy,
  onSort,
  highlightId,
  highlightRef,
  isHighlighted,
  rowSx,
  emptyMessage = 'No hay registros.',
  loadingMessage = 'Cargando...',
  errorMessage = 'No se pudieron cargar los datos. Verifica la conexión con el servidor.',
}) {
  const theme = useTheme()
  const thStyle = getThStyle(theme)
  const colSpan = columns.length

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
              {columns.map(col => (
                <TableCell key={col.key} sx={{ ...thStyle, ...(col.width ? { width: col.width } : {}) }} align={col.align}>
                  {col.sortField ? (
                    <TableSortLabel
                      active={sortBy.field === col.sortField}
                      direction={sortBy.dir === 'desc' ? 'desc' : 'asc'}
                      onClick={() => onSort(col.sortField)}
                      IconComponent={sortBy.field === col.sortField ? undefined : UnfoldMoreOutlinedIcon}
                      sx={{
                        color: 'inherit',
                        '&:hover': { color: 'inherit' },
                        '&.Mui-active': { color: theme.palette.primary.main },
                        '&.Mui-active:hover': { color: theme.palette.primary.main },
                        '& .MuiTableSortLabel-icon': { opacity: 1, fontSize: 16 },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && initialLoad?.current ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 7 }}>
                  <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                    {loadingMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
                  <Typography color="error" variant="body2">{errorMessage}</Typography>
                  {import.meta.env.DEV && (
                    <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                      {String(error)}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : !loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 7 }}>
                  {typeof emptyMessage === 'string' ? (
                    <Typography color={theme.palette.text.secondary} variant="body2">{emptyMessage}</Typography>
                  ) : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => {
                const key = rowKey(row)
                const highlighted = isHighlighted ? isHighlighted(row) : (highlightId && String(key) === String(highlightId))
                return (
                  <TableRow
                    key={key}
                    ref={highlighted ? highlightRef : null}
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.background.subtle },
                      transition: 'background-color 0.15s',
                      ...(rowSx ? rowSx(row) : {}),
                      ...(highlighted && {
                        animation: 'highlightPulse 1.1s ease-in-out 4',
                        '@keyframes highlightPulse': {
                          '0%, 100%': { backgroundColor: 'transparent' },
                          '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                        },
                      }),
                    }}
                  >
                    {columns.map(col => (
                      <TableCell key={col.key} align={col.align} sx={col.cellSx}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
