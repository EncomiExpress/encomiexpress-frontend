import { Box, Typography, Select, MenuItem, Pagination } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'

// Pie de página de tabla compartido: "Mostrando X-Y de Z" + selector de filas por página + paginación.
// Mismo patrón usado en todos los Listar*.jsx — centralizado aquí para no repetirlo en cada uno.
const TablaPaginacionFooter = ({ total, page, rowsPerPage, onPageChange, onRowsPerPageChange, opciones = [5, 10, 25] }) => {
    const theme = useTheme()

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 0.5, pt: 1.5,
        }}>
            <Typography variant="body2" color={theme.palette.text.secondary}>
                Mostrando {from}–{to} de {total} resultado{total !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>
                        Filas
                    </Typography>
                    <Select
                        value={rowsPerPage}
                        onChange={e => onRowsPerPageChange(Number(e.target.value))}
                        size="small"
                        renderValue={(value) => value}
                        IconComponent={KeyboardArrowDownOutlinedIcon}
                        sx={{
                            fontSize: '0.82rem',
                            borderRadius: 2,
                            '& .MuiSelect-select': { py: 0.6, pl: 1.5, pr: '28px !important' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main, borderWidth: '1px',
                            },
                            '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                            '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                            '& .MuiTouchRipple-root': { display: 'none' },
                        }}
                        MenuProps={{
                            slotProps: {
                                paper: {
                                    sx: {
                                        borderRadius: 2,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                        mt: 0.5,
                                        minWidth: 80,
                                        '& .MuiMenuItem-root': {
                                            fontSize: '0.82rem',
                                            py: 0.9,
                                            px: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            '&:hover': { backgroundColor: theme.palette.action.hover },
                                            '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                                            '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                                        },
                                    },
                                },
                            },
                        }}
                    >
                        {opciones.map(n => (
                            <MenuItem key={n} value={n}>
                                {n}
                                {rowsPerPage === n && (
                                    <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
                <Pagination
                    count={totalPages}
                    page={safePage}
                    onChange={(_, val) => onPageChange(val)}
                    size="small"
                    shape="rounded"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            fontSize: '0.82rem',
                            borderRadius: '8px',
                            minWidth: 34,
                            height: 34,
                            mx: 0.2,
                            color: theme.palette.text.primary,
                            border: `1px solid ${theme.palette.divider}`,
                            '& .MuiTouchRipple-root': { display: 'none' },
                        },
                        '& .MuiPaginationItem-ellipsis': { border: 'none' },
                        '& .MuiPaginationItem-root.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            color: 'white',
                            fontWeight: 600,
                            '&:hover': { backgroundColor: theme.palette.primary.darker },
                        },
                        '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                            backgroundColor: theme.palette.background.subtle,
                            borderColor: theme.palette.divider,
                        },
                    }}
                />
            </Box>
        </Box>
    )
}

export default TablaPaginacionFooter
