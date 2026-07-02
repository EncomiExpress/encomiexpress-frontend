import * as XLSX from 'xlsx'

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (value instanceof Date) return value.toLocaleDateString('es-CO')
  if (Array.isArray(value)) return value.map(normalizeValue).join(', ')
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${normalizeValue(item)}`)
      .join(', ')
  }
  return String(value)
}

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(value)])
  )

const buildWorkbook = (sheets) => {
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, rows }) => {
    const worksheet = XLSX.utils.json_to_sheet(rows.map(normalizeRow))
    XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31))
  })
  return workbook
}

export const exportToExcel = ({ data = [], fileName = 'reporte', sheetName = 'Datos', sheets = null }) => {
  const workbook = sheets && Array.isArray(sheets) && sheets.length > 0
    ? buildWorkbook(sheets)
    : buildWorkbook([{ name: sheetName, rows: data }])

  const safeFileName = String(fileName)
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'reporte'

  XLSX.writeFile(workbook, `${safeFileName}.xlsx`)
}
